import path from "path";

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
  if (packageOptions.indexLoophole) {
    const match = exporter.match(indexFileRegExp);
    if (match) {
      // import from `sub/index.ts` can be treated as `sub.ts` so that `index.ts` can be used as export point of a sub package.
      exporter = exporter.slice(0, -match[0].length);
    }
  }
  const rel = path.relative(path.dirname(importer), path.dirname(exporter));
  if (
    packageOptions.filenameLoophole &&
    rel === path.basename(importer, path.extname(importer))
  ) {
    // Example: importing foo/bar.ts from foo.ts
    return true;
  }
  return ancestorDirRegExp.test(rel);
}
