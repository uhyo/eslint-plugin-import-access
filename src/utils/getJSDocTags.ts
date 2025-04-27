import { canHaveJsDoc, getJsDoc } from "tsutils";
import type { Node } from "typescript";

export type Tag = {
  name: string;
  text: string;
};

export function getJSDocTags(node: Node): Tag[] | undefined {
  if (!canHaveJsDoc(node)) {
    return undefined;
  }
  return getJsDoc(node).flatMap((jsdoc) => {
    return (
      jsdoc.tags?.map((tag) => {
        return {
          name: tag.tagName.text,
          text:
            typeof tag.comment === "string"
              ? tag.comment
              : tag.comment?.[0].text || "",
        };
      }) ?? []
    );
  });
}
