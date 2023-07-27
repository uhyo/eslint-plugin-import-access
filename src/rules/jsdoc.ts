import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { Node, Program, Symbol } from "typescript";
import { checkSymbolImportability } from "../core/checkSymbolmportability";
import { getImmediateAliasedSymbol } from "../utils/getImmediateAliasedSymbol";
import { PackageOptions } from "../utils/isInPackage";

type MessageId =
  | "no-program"
  | "package"
  | "package:reexport"
  | "private"
  | "private:reexport";

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
      url: "TODO",
    },
    messages: {
      "no-program": "Cannot retrieve TypeScript program for this file.",
      package: "Cannot import a package-private export '{{ identifier }}'",
      "package:reexport":
        "Cannot re-export a package-private export '{{ identifier }}'",
      private: "Cannot import a private export '{{ identifier }}'",
      "private:reexport":
        "Cannot re-export a private export '{{ identifier }}'",
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
  defaultOptions: [
    {
      indexLoophole: true,
      filenameLoophole: false,
      defaultImportability: "public",
    },
  ],
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
        const sourceFilename = context.getFilename();
        if (!sourceFilename) {
          return;
        }

        if (parserServices.program === null) {
          context.report({
            node,
            messageId: "no-program",
          });
          return;
        }

        const checker = parserServices.program.getTypeChecker();

        // const shouldSkip = shouldSkipSymbolCheck(node, sourceFilename);
        // if (shouldSkip) {
        //   return;
        // }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        const symbol = checker.getSymbolAtLocation(tsNode.name);
        if (symbol) {
          checkSymbol(
            context,
            packageOptions,
            parserServices.program,
            node,
            tsNode,
            symbol,
          );
        }
      },
      ImportDefaultSpecifier(node) {
        const sourceFilename = context.getFilename();
        if (!sourceFilename) {
          return;
        }

        if (parserServices.program === null) {
          context.report({
            node,
            messageId: "no-program",
          });
          return;
        }

        const checker = parserServices.program.getTypeChecker();

        // const shouldSkip = shouldSkipSymbolCheck(node, sourceFilename);
        // if (shouldSkip) {
        //   return;
        // }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        if (!tsNode.name) {
          return;
        }
        const symbol = checker.getSymbolAtLocation(tsNode.name);
        if (symbol) {
          checkSymbol(
            context,
            packageOptions,
            parserServices.program,
            node,
            tsNode,
            symbol,
          );
        }
      },
      ExportSpecifier(node) {
        const sourceFilename = context.getFilename();
        if (!sourceFilename) {
          return;
        }

        if (parserServices.program === null) {
          context.report({
            node,
            messageId: "no-program",
          });
          return;
        }

        const checker = parserServices.program.getTypeChecker();

        // const shouldSkip = shouldSkipSymbolCheck(node, sourceFilename);
        // if (shouldSkip) {
        //   return;
        // }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        const symbol = checker.getSymbolAtLocation(tsNode.name);
        if (symbol) {
          checkSymbol(
            context,
            packageOptions,
            parserServices.program,
            node,
            tsNode,
            symbol,
            true,
          );
        }
      },
    };
  },
};

export default jsdocRule;

export function jsDocRuleDefaultOptions(
  options: Partial<JSDocRuleOptions> | undefined,
): JSDocRuleOptions {
  const {
    indexLoophole = true,
    filenameLoophole = false,
    defaultImportability = "public",
  } = options || {};
  return { indexLoophole, filenameLoophole, defaultImportability };
}

function checkSymbol(
  context: Readonly<TSESLint.RuleContext<MessageId, unknown[]>>,
  packageOptions: PackageOptions,
  program: Program,
  originalNode: TSESTree.Node,
  tsNode: Node,
  symbol: Symbol,
  reexport = false,
) {
  const checker = program.getTypeChecker();
  const exsy = getImmediateAliasedSymbol(checker, symbol);
  if (!exsy) {
    return;
  }
  const checkResult = checkSymbolImportability(
    packageOptions,
    program,
    tsNode.getSourceFile().fileName,
    exsy,
  );
  switch (checkResult) {
    case "package": {
      context.report({
        node: originalNode,
        messageId: reexport ? "package:reexport" : "package",
        data: {
          identifier: exsy.name,
        },
      });
      break;
    }
    case "private": {
      context.report({
        node: originalNode,
        messageId: reexport ? "private:reexport" : "private",
        data: {
          identifier: exsy.name,
        },
      });
      break;
    }
  }
}
