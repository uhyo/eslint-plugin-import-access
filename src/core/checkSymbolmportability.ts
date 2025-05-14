import { minimatch } from "minimatch";
import path from "path";
import type { Program, Symbol } from "typescript";
import { assertNever } from "../utils/assertNever.js";
import { concatArrays } from "../utils/concatArrays.js";
import { findExportedDeclaration } from "../utils/findExportableDeclaration.js";
import { getAccessOfJsDocs } from "../utils/getAccessOfJsDocs.js";
import type { Tag } from "../utils/getJSDocTags.js";
import { getJSDocTags } from "../utils/getJSDocTags.js";
import type { PackageOptions } from "../utils/isInPackage.js";
import { isInPackage } from "../utils/isInPackage.js";
import { lookupPackageJson } from "./lookupPackageJson.js";

// Debug logging function
function debugLog(...args: any[]): void {
  console.log("[DEBUG:checkSymbolImportability.ts]", ...args);
}

/**
 * Result of checking a symbol.
 * A non-undefined return value means an error
 */
export type CheckSymbolResult = "package" | "private" | undefined;

export function checkSymbolImportability(
  packageOptions: PackageOptions,
  program: Program,
  importerFilename: string,
  moduleSpecifier: string,
  exportedSymbol: Symbol,
): CheckSymbolResult {
  debugLog("checkSymbolImportability called", {
    importerFilename,
    moduleSpecifier,
    symbolName: exportedSymbol.name,
    packageOptions,
  });

  const rawDecl = exportedSymbol.declarations?.[0];
  if (!rawDecl) {
    debugLog("No declarations found for symbol", exportedSymbol.name);
    return;
  }

  const decl = findExportedDeclaration(rawDecl);
  if (!decl) {
    debugLog("No exported declaration found for", exportedSymbol.name);
    return;
  }

  // Get the actual file name of the exported declaration
  const exporterFilename = decl.getSourceFile().fileName;
  debugLog("Exporter filename", exporterFilename);

  // Check if moduleSpecifier or exporter file path matches any of the excludeSourcePatterns
  if (packageOptions.excludeSourcePatterns?.length) {
    debugLog(
      "Checking excludeSourcePatterns",
      packageOptions.excludeSourcePatterns,
    );
    for (const pattern of packageOptions.excludeSourcePatterns) {
      // Check actual file path
      // Get relative path from the project root
      const projectPath = program.getCurrentDirectory();
      const relativePath = path.relative(projectPath, exporterFilename);

      debugLog("Checking pattern", { pattern, relativePath });

      // Check if the file path matches the pattern
      if (minimatch(relativePath, pattern, { dot: true })) {
        // Skip importability check for this source
        debugLog("File matches exclude pattern, skipping importability check");
        return;
      }
    }
  }

  // If declaration is from external module, treat as importable
  if (program.isSourceFileFromExternalLibrary(decl.getSourceFile())) {
    debugLog("Declaration is from external library, treating as importable");
    return;
  }

  if (
    packageOptions.treatSelfReferenceAs === "external" &&
    possibleSubpathImportFromPackage.test(moduleSpecifier)
  ) {
    debugLog("Checking for self-reference", {
      treatSelfReferenceAs: packageOptions.treatSelfReferenceAs,
      moduleSpecifier,
    });

    // Check whether this import is the result of a self-reference.
    const lookupResult = lookupPackageJson(importerFilename);
    debugLog("lookupPackageJson result", lookupResult);

    if (lookupResult !== null) {
      if (
        checkIfImportIsSelfReference(
          moduleSpecifier,
          lookupResult.packageJson.name,
        )
      ) {
        // This is a self-reference, so treat as external.
        debugLog("This is a self-reference, treating as external");
        return;
      }
    }
  }

  const checker = program.getTypeChecker();

  // found an export declaration
  const jsDocs = concatArrays<Tag>(
    exportedSymbol.getJsDocTags(checker).map((tag) => ({
      name: tag.name,
      text: tag.text?.[0].text || "",
    })),
    getJSDocTags(decl),
  );

  debugLog("JSDoc tags", jsDocs);

  if (!jsDocs) {
    debugLog(
      "No JSDoc tags found, using defaultImportability",
      packageOptions.defaultImportability,
    );
    switch (packageOptions.defaultImportability) {
      case "public":
        debugLog("defaultImportability is public, symbol is importable");
        return;
      case "private":
        debugLog("defaultImportability is private, symbol is not importable");
        return "private";
      case "package": {
        const inPackage = isInPackage(
          importerFilename,
          decl.getSourceFile().fileName,
          packageOptions,
        );
        debugLog(
          "defaultImportability is package, inPackage check result:",
          inPackage,
        );
        return inPackage ? undefined : "package";
      }
    }
  }
  const access = getAccessOfJsDocs(jsDocs, packageOptions.defaultImportability);
  debugLog("Access from JSDoc", access);

  if (access === "public") {
    // no restriction
    debugLog("Access is public, symbol is importable");
    return;
  }
  if (access === "private") {
    // no import of private stuff! (why is this exported?)
    debugLog("Access is private, symbol is not importable");
    return "private";
  }
  if (access !== "package") {
    assertNever(access);
  }

  // for package-exports, check relation of this and that files
  const inPackage = isInPackage(
    importerFilename,
    decl.getSourceFile().fileName,
    packageOptions,
  );

  debugLog("Access is package, inPackage check result:", inPackage);
  return inPackage ? undefined : "package";
}

const possibleSubpathImportFromPackage =
  /^(?![./\\])([^/\\]*)(?:$|[/\\][^/\\])/;

const checkIfImportIsSelfReference = (
  moduleSpecifier: string,
  packageName: string,
) => {
  const importIsDefaultModule = moduleSpecifier === packageName;
  const importIsSubModule = moduleSpecifier.startsWith(`${packageName}/`);
  return importIsDefaultModule || importIsSubModule;
};
