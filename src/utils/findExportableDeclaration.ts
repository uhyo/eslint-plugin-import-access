import {
  isClassDeclaration,
  isExportDeclaration,
  isFunctionDeclaration,
  isSourceFile,
  isVariableStatement,
  Node,
  SyntaxKind,
} from "typescript";

/**
 * Go up AST nodes until it reaches an exported statement-like node.
 */
export function findExportedDeclaration(node: Node) {
  const decl = findExportableDeclaration(node);
  if (!decl) {
    return;
  }

  if (isExportDeclaration(decl)) {
    return decl;
  }

  if (!decl.modifiers?.find((m) => m.kind === SyntaxKind.ExportKeyword)) {
    return;
  }
  return decl;
}

function findExportableDeclaration(node: Node) {
  while (node && !isSourceFile(node)) {
    if (
      isFunctionDeclaration(node) ||
      isClassDeclaration(node) ||
      isVariableStatement(node) ||
      isExportDeclaration(node)
    ) {
      return node;
    }
    node = node.parent;
  }
  return undefined;
}
