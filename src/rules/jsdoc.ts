import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { Node, Program, Symbol, isStringLiteral } from "typescript";
import { checkSymbolImportability } from "../core/checkSymbolmportability";
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
  /**
   * Whether to treat self-reference as internal or external.
   * When `external`, imports using the self-referencing feature of Node.js are
   * treated as imports from external packages, meaning that they bypass
   * the importability check.
   */
  treatSelfReferenceAs: "internal" | "external";
  /**
   * Array of glob patterns for source paths to exclude from the importability check.
   * Useful for excluding generated files or auto-generated type definitions.
   */
  excludeSourcePatterns?: string[];
  /**
   * Array of glob patterns that specify which directories should be treated as package boundaries.
   * By default, all directories are treated as package boundaries.
   * Use negation patterns (e.g., "!**\/_internal") to exclude certain directories from being package boundaries.
   * Example: ["**", "!**\/_internal"] treats all directories as packages except those named "_internal".
   */
  packageDirectory?: string[];
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
      "no-program":
        "Type information is not available for this file. See https://typescript-eslint.io/getting-started/typed-linting/ for how to set this up.",
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
          treatSelfReferenceAs: {
            type: "string",
            enum: ["external", "internal"],
          },
          excludeSourcePatterns: {
            type: "array",
            items: {
              type: "string",
            },
          },
          packageDirectory: {
            type: "array",
            items: {
              type: "string",
            },
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
      treatSelfReferenceAs: "external",
      excludeSourcePatterns: [],
      packageDirectory: undefined,
    },
  ],
  create(context) {
    const { options, sourceCode } = context;
    const { parserServices } = sourceCode;
    if (!parserServices) {
      return {};
    }
    const {
      indexLoophole,
      filenameLoophole,
      defaultImportability,
      treatSelfReferenceAs,
      excludeSourcePatterns,
      packageDirectory,
    } = jsDocRuleDefaultOptions(options[0]);

    const packageOptions: PackageOptions = {
      indexLoophole,
      filenameLoophole,
      defaultImportability,
      treatSelfReferenceAs,
      excludeSourcePatterns,
      packageDirectory,
      projectDirectory: parserServices.program?.getCurrentDirectory(),
    };

    return {
      ImportSpecifier(node) {
        const sourceFilename = context.filename;
        if (!sourceFilename) {
          return;
        }

        if (parserServices.program == null) {
          context.report({
            node,
            messageId: "no-program",
          });
          return;
        }

        const checker = parserServices.program.getTypeChecker();

        if (parserServices.esTreeNodeToTSNodeMap == null) {
          throw new Error(
            "This rule requires the parser to provide the esTreeNodeToTSNodeMap in parserServices",
          );
        }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        const symbol = checker.getSymbolAtLocation(tsNode.name);
        if (symbol) {
          const moduleSpecifier = tsNode.parent.parent.parent.moduleSpecifier;
          if (!isStringLiteral(moduleSpecifier)) {
            // Should not happen (as of TS 5.1)
            return;
          }

          checkSymbol(
            context,
            packageOptions,
            parserServices.program,
            node,
            tsNode,
            moduleSpecifier.text,
            symbol,
          );
        }
      },
      ImportDefaultSpecifier(node) {
        const sourceFilename = context.filename;
        if (!sourceFilename) {
          return;
        }

        if (parserServices.program == null) {
          context.report({
            node,
            messageId: "no-program",
          });
          return;
        }

        const checker = parserServices.program.getTypeChecker();

        if (parserServices.esTreeNodeToTSNodeMap == null) {
          throw new Error(
            "This rule requires the parser to provide the esTreeNodeToTSNodeMap in parserServices",
          );
        }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        if (!tsNode.name) {
          return;
        }
        const symbol = checker.getSymbolAtLocation(tsNode.name);
        if (symbol) {
          const moduleSpecifier = tsNode.parent.moduleSpecifier;
          if (!isStringLiteral(moduleSpecifier)) {
            // Should not happen (as of TS 5.1)
            return;
          }

          checkSymbol(
            context,
            packageOptions,
            parserServices.program,
            node,
            tsNode,
            moduleSpecifier.text,
            symbol,
          );
        }
      },
      ExportSpecifier(node) {
        const sourceFilename = context.filename;
        if (!sourceFilename) {
          return;
        }

        if (parserServices.program == null) {
          context.report({
            node,
            messageId: "no-program",
          });
          return;
        }

        const checker = parserServices.program.getTypeChecker();

        if (parserServices.esTreeNodeToTSNodeMap == null) {
          throw new Error(
            "This rule requires the parser to provide the esTreeNodeToTSNodeMap in parserServices",
          );
        }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        const symbol = checker.getSymbolAtLocation(tsNode.name);
        if (symbol) {
          const moduleSpecifier = tsNode.parent.parent.moduleSpecifier;
          if (!moduleSpecifier || !isStringLiteral(moduleSpecifier)) {
            return;
          }

          checkSymbol(
            context,
            packageOptions,
            parserServices.program,
            node,
            tsNode,
            moduleSpecifier.text,
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
    treatSelfReferenceAs = "external",
    excludeSourcePatterns = [],
    packageDirectory = undefined,
  } = options || {};
  return {
    indexLoophole,
    filenameLoophole,
    defaultImportability,
    treatSelfReferenceAs,
    excludeSourcePatterns,
    packageDirectory,
  };
}

function checkSymbol(
  context: Readonly<TSESLint.RuleContext<MessageId, unknown[]>>,
  packageOptions: PackageOptions,
  program: Program,
  originalNode: TSESTree.Node,
  tsNode: Node,
  moduleSpecifier: string,
  symbol: Symbol,
  reexport = false,
) {
  const checker = program.getTypeChecker();
  // Try getImmediateAliasedSymbol first, fall back to getAliasedSymbol
  // This fallback helps in certain TypeScript project service edge cases
  let exsy = checker.getImmediateAliasedSymbol(symbol);
  if (!exsy) {
    // Fallback: try getAliasedSymbol which follows the full chain
    exsy = checker.getAliasedSymbol(symbol);
  }
  if (!exsy) {
    return;
  }
  const checkResult = checkSymbolImportability(
    packageOptions,
    program,
    tsNode.getSourceFile().fileName,
    moduleSpecifier,
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
