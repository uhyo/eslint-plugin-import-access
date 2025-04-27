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
  const rawDecl = exportedSymbol.declarations?.[0];
  if (!rawDecl) {
    return;
  }
  const decl = findExportedDeclaration(rawDecl);
  if (!decl) {
    return;
  }

  // Get the actual file name of the exported declaration
  const exporterFilename = decl.getSourceFile().fileName;

  // Check if moduleSpecifier or exporter file path matches any of the excludeSourcePatterns
  if (packageOptions.excludeSourcePatterns?.length) {
    for (const pattern of packageOptions.excludeSourcePatterns) {
      // Check actual file path
      // Get relative path from the project root
      const projectPath = program.getCurrentDirectory();
      const relativePath = path.relative(projectPath, exporterFilename);

      // Check if the file path matches the pattern
      if (minimatch(relativePath, pattern, { dot: true })) {
        // Skip importability check for this source
        return;
      }
    }
  }

  // If declaration is from external module, treat as importable
  if (program.isSourceFileFromExternalLibrary(decl.getSourceFile())) {
    return;
  }

  if (
    packageOptions.treatSelfReferenceAs === "external" &&
    possibleSubpathImportFromPackage.test(moduleSpecifier)
  ) {
    // Check whether this import is the result of a self-reference.
    const lookupResult = lookupPackageJson(importerFilename);
    if (lookupResult !== null) {
      if (
        checkIfImportIsSelfReference(
          moduleSpecifier,
          lookupResult.packageJson.name,
        )
      ) {
        // This is a self-reference, so treat as external.
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
  if (!jsDocs) {
    switch (packageOptions.defaultImportability) {
      case "public":
        return;
      case "private":
        return "private";
      case "package": {
        const inPackage = isInPackage(
          importerFilename,
          decl.getSourceFile().fileName,
          packageOptions,
        );
        return inPackage ? undefined : "package";
      }
    }
  }
  const access = getAccessOfJsDocs(jsDocs, packageOptions.defaultImportability);
  if (access === "public") {
    // no restriction
    return;
  }
  if (access === "private") {
    // no import of private stuff! (why is this exported?)
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
