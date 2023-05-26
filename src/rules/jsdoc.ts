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
  /**
   * Whether packages importability is restricted to public exports only or not.
   */
  defaultImportability: "public" | "package" | "private";
};

const jsdocRule: Omit<
  TSESLint.RuleModule<MessageId, [Partial<JSDocRuleOptions>?]>,
  "docs"
> = {
  meta: {
    type: "problem",
    docs: {
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
          defaultImportability: {
            type: "string",
            enum: ["public", "package", "private"],
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
    const { indexLoophole, filenameLoophole, defaultImportability } =
      jsDocRuleDefaultOptions(options[0]);

    const packageOptions: PackageOptions = {
      indexLoophole,
      filenameLoophole,
      defaultImportability,
    };

    return {
      ImportSpecifier(node) {
        const isNodeModules = checkNodeModulesPackageOrNot(node);
        // ignore node_modules
        if (isNodeModules) {
          return;
        }

        const checker = parserServices.program.getTypeChecker();

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        const symbol = checker.getSymbolAtLocation(tsNode.name);
        if (symbol) {
          checkSymbol(context, packageOptions, checker, node, tsNode, symbol);
        }
      },
      ImportDefaultSpecifier(node) {
        const isNodeModules = checkNodeModulesPackageOrNot(node);
        // ignore node_modules
        if (isNodeModules) {
          return;
        }
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

export function jsDocRuleDefaultOptions(
  options: Partial<JSDocRuleOptions> | undefined
): JSDocRuleOptions {
  const {
    indexLoophole = true,
    filenameLoophole = false,
    defaultImportability = "public",
  } = options || {};
  return { indexLoophole, filenameLoophole, defaultImportability };
}

function checkNodeModulesPackageOrNot(
  node: TSESTree.ImportSpecifier | TSESTree.ImportDefaultSpecifier
) {
  if (node.parent?.type === "ImportDeclaration") {
    const packageName = node.parent.source.value;

    try {
      const packagePath = require.resolve(packageName);
      if (packagePath.includes("node_modules")) {
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }
}

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
