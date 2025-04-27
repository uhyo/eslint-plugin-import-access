import { canHaveJsDoc, getJsDoc } from "tsutils";
import type { Node } from "typescript";

// Debug logging function
function debugLog(...args: any[]): void {
  console.log("[DEBUG:getJSDocTags.ts]", ...args);
}

export type Tag = {
  name: string;
  text: string;
};

export function getJSDocTags(node: Node): Tag[] | undefined {
  debugLog("getJSDocTags called for node kind:", node.kind);

  if (!canHaveJsDoc(node)) {
    debugLog("Node cannot have JSDoc, returning undefined");
    return undefined;
  }

  const jsDocs = getJsDoc(node);
  debugLog("Found JSDoc count:", jsDocs.length);

  const result = jsDocs.flatMap((jsdoc) => {
    debugLog("Processing JSDoc:", jsdoc.getText?.());

    const tags =
      jsdoc.tags?.map((tag) => {
        const name = tag.tagName.text;
        const text =
          typeof tag.comment === "string"
            ? tag.comment
            : tag.comment?.[0].text || "";

        debugLog("Found tag:", { name, text });

        return {
          name,
          text,
        };
      }) ?? [];

    debugLog("Tags extracted from this JSDoc:", tags.length);
    return tags;
  });

  debugLog("Total tags found:", result.length);
  return result.length > 0 ? result : undefined;
}
