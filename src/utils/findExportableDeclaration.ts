import type { Node } from "typescript";
import {
  isClassDeclaration,
  isExportAssignment,
  isExportDeclaration,
  isFunctionDeclaration,
  isInterfaceDeclaration,
  isSourceFile,
  isTypeAliasDeclaration,
  isVariableStatement,
  SyntaxKind,
} from "typescript";

// Debug logging function
function debugLog(...args: any[]): void {
  console.log("[DEBUG:findExportableDeclaration.ts]", ...args);
}

/**
 * Go up AST nodes until it reaches an exported statement-like node.
 */
export function findExportedDeclaration(node: Node) {
  debugLog("findExportedDeclaration called for node kind:", node.kind);

  const decl = findExportableDeclaration(node);
  if (!decl) {
    debugLog("No exportable declaration found");
    return;
  }

  debugLog("Found exportable declaration of kind:", decl.kind);

  if (isExportDeclaration(decl) || isExportAssignment(decl)) {
    debugLog("Declaration is an export declaration or assignment");
    return decl;
  }

  const hasExportModifier = decl.modifiers?.find(
    (m) => m.kind === SyntaxKind.ExportKeyword,
  );
  if (!hasExportModifier) {
    debugLog("Declaration does not have export modifier");
    return;
  }

  debugLog("Found exported declaration");
  return decl;
}

function findExportableDeclaration(node: Node) {
  debugLog("findExportableDeclaration called for node kind:", node.kind);

  let currentNode = node;
  let depth = 0;

  while (currentNode && !isSourceFile(currentNode)) {
    debugLog(`Checking node at depth ${depth}, kind:`, currentNode.kind);

    if (
      isFunctionDeclaration(currentNode) ||
      isClassDeclaration(currentNode) ||
      isVariableStatement(currentNode) ||
      isExportDeclaration(currentNode) ||
      isExportAssignment(currentNode) ||
      isTypeAliasDeclaration(currentNode) ||
      isInterfaceDeclaration(currentNode)
    ) {
      debugLog("Found exportable declaration of kind:", currentNode.kind);
      return currentNode;
    }

    currentNode = currentNode.parent;
    depth++;
  }

  debugLog(
    "Reached source file or null without finding exportable declaration",
  );
  return undefined;
}
