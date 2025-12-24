import { minimatch } from "minimatch";
import path from "path";
import { Program, Symbol } from "typescript";
import { assertNever } from "../utils/assertNever";
import { concatArrays } from "../utils/concatArrays";
import { findExportedDeclaration } from "../utils/findExportableDeclaration";
import { getAccessOfJsDocs } from "../utils/getAccessOfJsDocs";
import { Tag, getJSDocTags } from "../utils/getJSDocTags";
import { PackageOptions, isInPackage } from "../utils/isInPackage";
import { lookupPackageJson } from "./lookupPackageJson";

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
    console.log("[DEBUG] No rawDecl for symbol:", exportedSymbol.name);
    return;
  }
  const decl = findExportedDeclaration(rawDecl);
  if (!decl) {
    console.log("[DEBUG] No decl found for symbol:", exportedSymbol.name);
    return;
  }

  // Get the actual file name of the exported declaration
  const exporterFilename = decl.getSourceFile().fileName;
  console.log("[DEBUG] Checking symbol:", exportedSymbol.name, "from:", exporterFilename, "options:", JSON.stringify(packageOptions));

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
        console.log("[DEBUG] Skipping due to excludeSourcePatterns");
        return;
      }
    }
  }

  // If declaration is from external module, treat as importable
  if (program.isSourceFileFromExternalLibrary(decl.getSourceFile())) {
    console.log("[DEBUG] Skipping external library:", exporterFilename);
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
