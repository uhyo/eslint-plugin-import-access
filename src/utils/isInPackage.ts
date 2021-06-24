import path from "path";

// ../ or ../../ or ...
const ancestorDirRegExp = new RegExp(`^(?:\\.\\.\\${path.sep})*(?:\\.\\.)?$`);

const indexFileRegExp = new RegExp(`\\${path.sep}index\\.tsx?$`);

/**
 * Checks whether importer is in the same 'package' as exporter.
 */
export function isInPackage(importer: string, exporter: string): boolean {
  const match = exporter.match(indexFileRegExp);
  if (match) {
    // import from `sub/index.ts` can be treated as `sub.ts` so that `index.ts` can be used as export point of a sub package.
    exporter = exporter.slice(0, -match[0].length);
  }
  const rel = path.relative(path.dirname(importer), path.dirname(exporter));
  return ancestorDirRegExp.test(rel);
}
