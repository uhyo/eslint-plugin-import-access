import path from "path";

// ../ or ../../ or ...
const parentDirRegExp = new RegExp(`^(?:\\.\\.\\${path.sep})+$`);

/**
 * Checks whether importer is in the same 'package' as exporter.
 */
export function isInPackage(importer: string, exporter: string): boolean {
  console.log({ importer, exporter });
  const rel = path.relative(path.dirname(importer), path.dirname(exporter));
  // ./foo/bar/
  console.log(rel);
  return parentDirRegExp.test(rel);
}
