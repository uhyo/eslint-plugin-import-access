import {
  isClassDeclaration,
  isFunctionDeclaration,
  isSourceFile,
  isVariableStatement,
  Node,
} from "typescript";

/**
 * Go up AST nodes until it reaches a statement-like node.
 */
export function findExportableDeclaration(node: Node) {
  while (node && !isSourceFile(node)) {
    if (
      isFunctionDeclaration(node) ||
      isClassDeclaration(node) ||
      isVariableStatement(node)
    ) {
      return node;
    }
    node = node.parent;
  }
  return undefined;
}
