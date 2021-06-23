import { TSESLint, TSESTree } from "@typescript-eslint/experimental-utils";
import { canHaveJsDoc, getJsDoc } from "tsutils";
import { Symbol, SyntaxKind, TypeChecker } from "typescript";
import { getAccessOfJsDocs } from "../utils/getAccessOfJsDocs";

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
      package: "",
      private: "Cannot import a private export '{{ identifier }}'",
    },
    schema: [{}],
  },
  create(context) {
    return {
      ImportSpecifier(node) {
        const { parserServices } = context;
        if (!parserServices) {
          return;
        }
        const checker = parserServices.program.getTypeChecker();

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const symbol = checker.getSymbolAtLocation(tsNode.name);
        // console.log(symbol);
        if (symbol) {
          checkSymbol(context, checker, node, symbol);
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
  symbol: Symbol
) {
  const exsy = checker.getAliasedSymbol(symbol);
  const decl = exsy.declarations?.[0];
  if (!decl) {
    return;
  }

  if (!decl.modifiers?.find((m) => m.kind === SyntaxKind.ExportKeyword)) {
    return;
  }
  // found an export declaration
  const jsDocs = canHaveJsDoc(decl) && getJsDoc(decl);
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
  // look for packages
  console.log(symbol.name, getAccessOfJsDocs(jsDocs));
}
