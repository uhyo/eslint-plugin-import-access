import { TSESLint, TSESTree } from "@typescript-eslint/experimental-utils";
import { Node, Symbol, SyntaxKind, TypeChecker } from "typescript";
import { assertNever } from "../utils/assertNever";
import { concatArrays } from "../utils/concatArrays";
import { findExportableDeclaration } from "../utils/findExportableDeclaration";
import { getAccessOfJsDocs } from "../utils/getAccessOfJsDocs";
import { getJSDocTags, Tag } from "../utils/getJSDocTags";
import { isInPackage } from "../utils/isInPackage";

type MessageId = "package" | "private";

type RuleOptions = {};

const jsdocRule: Omit<
  TSESLint.RuleModule<MessageId, [Partial<RuleOptions>?]>,
  "docs"
> = {
  meta: {
    type: "problem",
    docs: {
      category: "Possible Errors",
      description: "Prohibit importing private exports.",
      recommended: "error",
      url: "TODO",
    },
    messages: {
      package: "Cannot import a package-private export '{{ identifier }}'",
      private: "Cannot import a private export '{{ identifier }}'",
    },
    schema: [{}],
  },
  create(context) {
    const { parserServices } = context;
    if (!parserServices) {
      return {};
    }

    return {
      ImportSpecifier(node) {
        const checker = parserServices.program.getTypeChecker();

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const symbol = checker.getSymbolAtLocation(tsNode.name);
        if (symbol) {
          checkSymbol(context, checker, node, tsNode, symbol);
        }
      },
      ImportDefaultSpecifier(node) {
        const checker = parserServices.program.getTypeChecker();

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        if (!tsNode.name) {
          return;
        }
        const symbol = checker.getSymbolAtLocation(tsNode.name);
        if (symbol) {
          checkSymbol(context, checker, node, tsNode, symbol);
        }
      },
    };
  },
};

export default jsdocRule;

function checkSymbol(
  context: Readonly<TSESLint.RuleContext<MessageId, unknown[]>>,
  checker: TypeChecker,
  originalNode: TSESTree.Node,
  tsNode: Node,
  symbol: Symbol
) {
  const exsy = checker.getAliasedSymbol(symbol);
  const rawDecl = exsy.declarations?.[0];
  if (!rawDecl) {
    return;
  }
  const decl = findExportableDeclaration(rawDecl);
  if (!decl) {
    return;
  }

  if (!decl.modifiers?.find((m) => m.kind === SyntaxKind.ExportKeyword)) {
    return;
  }
  // found an export declaration
  const jsDocs = concatArrays<Tag>(
    exsy.getJsDocTags(checker).map((tag) => ({
      name: tag.name,
      text: tag.text?.[0].text || "",
    })),
    getJSDocTags(decl)
  );
  if (exsy.name === "barDestructed") {
    console.log(exsy.name, jsDocs);
  }
  if (!jsDocs) {
    return;
  }
  const access = getAccessOfJsDocs(jsDocs);
  if (access === "public") {
    // no restriction
    return;
  }
  if (access === "private") {
    // no import of private stuff! (why is this exported?)
    context.report({
      node: originalNode,
      messageId: "private",
      data: {
        identifier: exsy.name,
      },
    });
    return;
  }
  if (access !== "package") {
    assertNever(access);
  }
  // for package-exports, check relation of this and that files
  const inPackage = isInPackage(
    tsNode.getSourceFile().fileName,
    decl.getSourceFile().fileName
  );
  if (!inPackage) {
    context.report({
      node: originalNode,
      messageId: "package",
      data: {
        identifier: exsy.name,
      },
    });
  }
}
