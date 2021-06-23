import { JSDocTagInfo } from "typescript";

export type JSDocAccess = "public" | "package" | "private";

/**
 * Get access for given JSDoc.
 * @access package
 */
export function getAccessOfJsDocs(tags: readonly JSDocTagInfo[]): JSDocAccess {
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
      const text = tag.text?.[0];
      if (text?.kind === "text") {
        if (text.text === "package") {
          // @access package
          return "package";
        }
        if (text.text === "private") {
          // @access private
          return "private";
        }
      }
    }
  }
  return "public";
}
