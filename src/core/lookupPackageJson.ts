import { readFileSync } from "node:fs";
import path from "node:path";

// Debug logging function
function debugLog(...args: any[]): void {
  console.log("[DEBUG:lookupPackageJson.ts]", ...args);
}

export function lookupPackageJson(file: string) {
  debugLog("lookupPackageJson called for file:", file);

  const absolutePath = path.resolve(file);
  debugLog("Absolute path:", absolutePath);

  const { root } = path.parse(absolutePath);
  debugLog("Root directory:", root);

  let dir = path.dirname(absolutePath);
  debugLog("Starting directory:", dir);

  let depth = 0;
  while (root !== dir) {
    debugLog(`Checking directory (depth ${depth}):`, dir);

    const packageJsonPath = path.join(dir, "package.json");
    debugLog("Looking for package.json at:", packageJsonPath);

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      debugLog("Found package.json with name:", packageJson.name);

      return {
        packageJson,
        packageJsonPath,
        dir,
      };
    } catch (e) {
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        e.code !== "ENOENT"
      ) {
        debugLog("Error reading package.json:", e);
        throw e;
      }

      debugLog("No package.json found in this directory");
    }

    dir = path.dirname(dir);
    depth++;
  }

  debugLog("Reached root directory without finding package.json");
  return null;
}
