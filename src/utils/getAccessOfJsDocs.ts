import type { Tag } from "./getJSDocTags.js";

// Debug logging function
function debugLog(...args: any[]): void {
  console.log("[DEBUG:getAccessOfJSDocs.ts]", ...args);
}

export type JSDocAccess = "public" | "package" | "private";

/**
 * Get access for given JSDoc.
 */
export function getAccessOfJsDocs(
  tags: readonly Tag[],
  defaultImportability: JSDocAccess,
): JSDocAccess {
  debugLog("getAccessOfJsDocs called", {
    tagsCount: tags.length,
    defaultImportability,
  });
  debugLog("Tags to process", tags);

  for (const tag of tags) {
    const tagName = tag.name;
    debugLog("Processing tag", { tagName, text: tag.text });

    if (tagName === "package") {
      // @package
      debugLog("Found @package tag, returning 'package'");
      return "package";
    }
    if (tagName === "private") {
      // @private
      debugLog("Found @private tag, returning 'private'");
      return "private";
    }
    if (tagName === "public") {
      // @public
      debugLog("Found @public tag, returning 'public'");
      return "public";
    }
    if (tagName === "access") {
      // @access
      const text = tag.text;
      debugLog("Found @access tag with text:", text);

      if (text === "package") {
        // @access package
        debugLog("@access package, returning 'package'");
        return "package";
      }
      if (text === "private") {
        // @access private
        debugLog("@access private, returning 'private'");
        return "private";
      }
      if (text === "public") {
        // @access public
        debugLog("@access public, returning 'public'");
        return "public";
      }
    }
  }

  debugLog(
    "No access tags found, returning defaultImportability:",
    defaultImportability,
  );
  return defaultImportability;
}
