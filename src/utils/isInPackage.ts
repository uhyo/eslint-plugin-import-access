import { minimatch } from "minimatch";
import path from "path";

export type PackageOptions = {
  readonly indexLoophole: boolean;
  readonly filenameLoophole: boolean;
  readonly defaultImportability: "public" | "package" | "private";
  readonly treatSelfReferenceAs: "internal" | "external";
  readonly excludeSourcePatterns?: readonly string[];
  readonly packageDirectory?: readonly string[];
};

const indexFileRegExp = new RegExp(`\\/index\\.[cm]?[jt]sx?$`);

/**
 * Checks if a directory matches the packageDirectory patterns.
 * Returns true if the directory should be treated as a package boundary.
 */
function isPackageDirectory(
  dir: string,
  patterns: readonly string[],
): boolean {
  const dirName = path.basename(dir);
  let matched = false;

  for (const pattern of patterns) {
    if (pattern.startsWith("!")) {
      // Negation pattern - if it matches, this is NOT a package directory
      const positivePattern = pattern.slice(1);
      if (minimatch(dirName, positivePattern) || minimatch(dir, positivePattern)) {
        return false;
      }
    } else {
      // Positive pattern - if it matches, this might be a package directory
      if (minimatch(dirName, pattern) || minimatch(dir, pattern)) {
        matched = true;
      }
    }
  }

  return matched;
}

/**
 * Finds the package directory for a given file path.
 * Returns the closest ancestor directory that matches the packageDirectory patterns.
 */
function findPackageDirectory(
  filePath: string,
  patterns: readonly string[],
): string {
  let dir = path.dirname(filePath);
  const root = path.parse(dir).root;

  // Traverse up the directory tree
  while (dir !== root) {
    if (isPackageDirectory(dir, patterns)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      // Reached the root without finding a package directory
      break;
    }
    dir = parent;
  }

  // If no package directory found, return the root or the original directory
  return path.dirname(filePath);
}

/**
 * Gets the package directory for a file based on configuration.
 * If packageDirectory patterns are specified, uses them to find the package boundary.
 * Otherwise, returns the file's directory.
 */
function getPackageDirectory(
  filePath: string,
  packageOptions: PackageOptions,
): string {
  if (packageOptions.packageDirectory && packageOptions.packageDirectory.length > 0) {
    return findPackageDirectory(filePath, packageOptions.packageDirectory);
  }
  return path.dirname(filePath);
}

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

  const importerPackageDir = getPackageDirectory(importer, packageOptions);
  const exporterPackageDir = getPackageDirectory(exporter, packageOptions);

  // Check if both files are in the same package directory
  if (importerPackageDir === exporterPackageDir) {
    return true;
  }

  // Check filenameLoophole: importing foo/bar.ts from foo.ts
  if (packageOptions.filenameLoophole) {
    const rel = path.relative(path.dirname(importer), path.dirname(exporter));
    if (rel === path.basename(importer, path.extname(importer))) {
      // Example: importing foo/bar.ts from foo.ts
      return true;
    }
  }

  // Check if importer's package is a descendant of exporter's package
  // (i.e., exporter is in an ancestor package)
  const rel = path.relative(exporterPackageDir, importerPackageDir);
  // rel should not start with '..' (not going up) and should not be empty
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}
