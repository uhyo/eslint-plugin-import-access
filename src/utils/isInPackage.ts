import path from "path";

// Debug logging function
function debugLog(...args: any[]): void {
  console.log("[DEBUG:isInPackage.ts]", ...args);
}

export type PackageOptions = {
  readonly indexLoophole: boolean;
  readonly filenameLoophole: boolean;
  readonly defaultImportability: "public" | "package" | "private";
  readonly treatSelfReferenceAs: "internal" | "external";
  readonly excludeSourcePatterns?: readonly string[];
};

// ../ or ../../ or ...
const ancestorDirRegExp = new RegExp(`^(?:\\.\\.\\${path.sep})*(?:\\.\\.)?$`);

const indexFileRegExp = new RegExp(`\\/index\\.[cm]?[jt]sx?$`);

/**
 * Checks whether importer is in the same 'package' as exporter.
 */
export function isInPackage(
  importer: string,
  exporter: string,
  packageOptions: PackageOptions,
): boolean {
  debugLog("isInPackage called", {
    importer,
    exporter,
    packageOptions,
  });

  if (packageOptions.indexLoophole) {
    const match = exporter.match(indexFileRegExp);
    if (match) {
      // import from `sub/index.ts` can be treated as `sub.ts` so that `index.ts` can be used as export point of a sub package.
      const originalExporter = exporter;
      exporter = exporter.slice(0, -match[0].length);
      debugLog("Applied indexLoophole", {
        originalExporter,
        newExporter: exporter,
      });
    }
  }

  const importerDir = path.dirname(importer);
  const exporterDir = path.dirname(exporter);
  const rel = path.relative(importerDir, exporterDir);

  debugLog("Relative path calculation", {
    importerDir,
    exporterDir,
    relativePath: rel,
  });

  if (
    packageOptions.filenameLoophole &&
    rel === path.basename(importer, path.extname(importer))
  ) {
    // Example: importing foo/bar.ts from foo.ts
    debugLog("filenameLoophole applies, returning true");
    return true;
  }

  const isAncestorDir = ancestorDirRegExp.test(rel);
  debugLog("ancestorDirRegExp test result", {
    relativePath: rel,
    isAncestorDir,
    ancestorDirRegExp: ancestorDirRegExp.toString(),
  });

  return isAncestorDir;
}
