import {
  AST_NODE_TYPES,
  TSESTree,
} from "@typescript-eslint/experimental-utils";

export function isExportDeclartation(
  node: TSESTree.Node | undefined
): node is TSESTree.ExportNamedDeclaration | TSESTree.ExportDefaultDeclaration {
  return (
    node?.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
    node?.type === AST_NODE_TYPES.ExportNamedDeclaration
  );
}
