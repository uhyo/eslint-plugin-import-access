import { Tag } from "./getJSDocTags";

export type JSDocAccess = "public" | "package" | "private";

/**
 * Get access for given JSDoc.
 */
export function getAccessOfJsDocs(tags: readonly Tag[]): JSDocAccess {
  for (const tag of tags) {
    const tagName = tag.name;
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
      const text = tag.text;
      if (text === "package") {
        // @access package
        return "package";
      }
      if (text === "private") {
        // @access private
        return "private";
      }
    }
  }
  return "public";
}
