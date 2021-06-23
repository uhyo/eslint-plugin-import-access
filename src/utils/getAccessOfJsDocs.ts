import { JSDoc } from "typescript";

export type JSDocAccess = "public" | "package" | "private";

/**
 * Get access for given JSDoc.
 * @private
 */
export function getAccessOfJsDocs(jsDocs: readonly JSDoc[]): JSDocAccess {
  for (const jsDoc of jsDocs) {
    if (!jsDoc.tags) {
      continue;
    }
    for (const tag of jsDoc.tags) {
      const tagName = tag.tagName.escapedText;
      if (tagName === "package") {
        // @package
        return "package";
      }
      if (tagName === "private") {
        // @private
        return "private";
      }
      if (tagName === "access") {
        // @access
        if (tag.comment === "package") {
          // @access package
          return "package";
        }
        if (tag.comment === "private") {
          // @access private
          return "private";
        }
      }
    }
  }
  return "public";
}
