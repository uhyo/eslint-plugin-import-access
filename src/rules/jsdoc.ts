import { TSESLint, TSESTree } from "@typescript-eslint/experimental-utils";
import { Node, Symbol, TypeChecker } from "typescript";
import { checkSymbolImportability } from "../core/checkSymbolmportability";
import { getImmediateAliasedSymbol } from "../utils/getImmediateAliasedSymbol";
import { PackageOptions } from "../utils/isInPackage";

type MessageId = "package" | "private";

export type JSDocRuleOptions = {
  /**
   * Whether importing a package-private exports from `index.ts` in a subdirectory.
   */
  indexLoophole: boolean;
  /**
   * Whether importing a package-private exports in a directory from a file of same name.
   */
  filenameLoophole: boolean;
};

const jsdocRule: Omit<
  TSESLint.RuleModule<MessageId, [Partial<JSDocRuleOptions>?]>,
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
    schema: [
      {
        type: "object",
        properties: {
          indexLoophole: {
            type: "boolean",
          },
          filenameLoophole: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const { parserServices, options } = context;
    if (!parserServices) {
      return {};
    }
    const [{ indexLoophole = true, filenameLoophole = false } = {}] = options;

    const packageOptions: PackageOptions = { indexLoophole, filenameLoophole };

    return {
      ImportSpecifier(node) {
        const checker = parserServices.program.getTypeChecker();

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        const symbol = checker.getSymbolAtLocation(tsNode.name);
        if (symbol) {
          checkSymbol(context, packageOptions, checker, node, tsNode, symbol);
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
          checkSymbol(context, packageOptions, checker, node, tsNode, symbol);
        }
      },
    };
  },
};

export default jsdocRule;

function checkSymbol(
  context: Readonly<TSESLint.RuleContext<MessageId, unknown[]>>,
  packageOptions: PackageOptions,
  checker: TypeChecker,
  originalNode: TSESTree.Node,
  tsNode: Node,
  symbol: Symbol
) {
  const exsy = getImmediateAliasedSymbol(checker, symbol);
  if (!exsy) {
    return;
  }
  const checkResult = checkSymbolImportability(
    packageOptions,
    checker,
    tsNode.getSourceFile().fileName,
    exsy
  );
  switch (checkResult) {
    case "package": {
      context.report({
        node: originalNode,
        messageId: "package",
        data: {
          identifier: exsy.name,
        },
      });
      break;
    }
    case "private": {
      context.report({
        node: originalNode,
        messageId: "private",
        data: {
          identifier: exsy.name,
        },
      });
      break;
    }
  }
}
