import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { Node, Program, Symbol } from "typescript";
import { isStringLiteral } from "typescript";
import { checkSymbolImportability } from "../core/checkSymbolmportability.js";
import type { PackageOptions } from "../utils/isInPackage.js";

// Debug logging function
function debugLog(...args: any[]): void {
  console.log("[DEBUG:jsdoc.ts]", ...args);
}

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
    } = jsDocRuleDefaultOptions(options[0]);

    const packageOptions: PackageOptions = {
      indexLoophole,
      filenameLoophole,
      defaultImportability,
      treatSelfReferenceAs,
      excludeSourcePatterns,
    };

    return {
      ImportSpecifier(node) {
        debugLog("ImportSpecifier handler called", {
          filename: context.filename,
          node: node.type,
          imported: node.imported?.name,
          local: node.local?.name,
        });

        const sourceFilename = context.filename;
        if (!sourceFilename) {
          debugLog("No source filename, returning");
          return;
        }

        if (parserServices.program == null) {
          debugLog("No program in parserServices");
          context.report({
            node,
            messageId: "no-program",
          });
          return;
        }

        const checker = parserServices.program.getTypeChecker();

        if (parserServices.esTreeNodeToTSNodeMap == null) {
          debugLog("No esTreeNodeToTSNodeMap in parserServices");
          throw new Error(
            "This rule requires the parser to provide the esTreeNodeToTSNodeMap in parserServices",
          );
        }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        debugLog("Got TS node", { kind: tsNode.kind });

        const symbol = checker.getSymbolAtLocation(tsNode.name);
        if (symbol) {
          debugLog("Found symbol", { name: symbol.name, flags: symbol.flags });

          const moduleSpecifier = tsNode.parent.parent.parent.moduleSpecifier;
          if (!isStringLiteral(moduleSpecifier)) {
            // Should not happen (as of TS 5.1)
            debugLog("Module specifier is not a string literal");
            return;
          }

          debugLog("Module specifier", moduleSpecifier.text);

          checkSymbol(
            context,
            packageOptions,
            parserServices.program,
            node,
            tsNode,
            moduleSpecifier.text,
            symbol,
          );
        } else {
          debugLog("No symbol found for node");
        }
      },
      ImportDefaultSpecifier(node) {
        debugLog("ImportDefaultSpecifier handler called", {
          filename: context.filename,
          node: node.type,
          local: node.local?.name,
        });

        const sourceFilename = context.filename;
        if (!sourceFilename) {
          debugLog("No source filename, returning");
          return;
        }

        if (parserServices.program == null) {
          debugLog("No program in parserServices");
          context.report({
            node,
            messageId: "no-program",
          });
          return;
        }

        const checker = parserServices.program.getTypeChecker();

        if (parserServices.esTreeNodeToTSNodeMap == null) {
          debugLog("No esTreeNodeToTSNodeMap in parserServices");
          throw new Error(
            "This rule requires the parser to provide the esTreeNodeToTSNodeMap in parserServices",
          );
        }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        debugLog("Got TS node", { kind: tsNode.kind });

        if (!tsNode.name) {
          debugLog("No name in TS node");
          return;
        }

        const symbol = checker.getSymbolAtLocation(tsNode.name);
        if (symbol) {
          debugLog("Found symbol", { name: symbol.name, flags: symbol.flags });

          const moduleSpecifier = tsNode.parent.moduleSpecifier;
          if (!isStringLiteral(moduleSpecifier)) {
            // Should not happen (as of TS 5.1)
            debugLog("Module specifier is not a string literal");
            return;
          }

          debugLog("Module specifier", moduleSpecifier.text);

          checkSymbol(
            context,
            packageOptions,
            parserServices.program,
            node,
            tsNode,
            moduleSpecifier.text,
            symbol,
          );
        } else {
          debugLog("No symbol found for node");
        }
      },
      ExportSpecifier(node) {
        debugLog("ExportSpecifier handler called", {
          filename: context.filename,
          node: node.type,
          exported: node.exported?.name,
          local: node.local?.name,
        });

        const sourceFilename = context.filename;
        if (!sourceFilename) {
          debugLog("No source filename, returning");
          return;
        }

        if (parserServices.program == null) {
          debugLog("No program in parserServices");
          context.report({
            node,
            messageId: "no-program",
          });
          return;
        }

        const checker = parserServices.program.getTypeChecker();

        if (parserServices.esTreeNodeToTSNodeMap == null) {
          debugLog("No esTreeNodeToTSNodeMap in parserServices");
          throw new Error(
            "This rule requires the parser to provide the esTreeNodeToTSNodeMap in parserServices",
          );
        }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        debugLog("Got TS node", { kind: tsNode.kind });

        const symbol = checker.getSymbolAtLocation(tsNode.name);
        if (symbol) {
          debugLog("Found symbol", { name: symbol.name, flags: symbol.flags });

          const moduleSpecifier = tsNode.parent.parent.moduleSpecifier;
          if (!moduleSpecifier || !isStringLiteral(moduleSpecifier)) {
            debugLog("No module specifier or not a string literal");
            return;
          }

          debugLog("Module specifier", moduleSpecifier.text);

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
        } else {
          debugLog("No symbol found for node");
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
  } = options || {};
  return {
    indexLoophole,
    filenameLoophole,
    defaultImportability,
    treatSelfReferenceAs,
    excludeSourcePatterns,
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
  debugLog("checkSymbol called", {
    filename: context.filename,
    moduleSpecifier,
    symbolName: symbol.name,
    reexport,
  });

  const checker = program.getTypeChecker();
  const exsy = checker.getImmediateAliasedSymbol(symbol);

  if (!exsy) {
    debugLog("No aliased symbol found for", symbol.name);
    return;
  }

  debugLog("Aliased symbol found", {
    name: exsy.name,
    flags: exsy.flags,
    declarations: exsy.declarations?.length,
  });

  const checkResult = checkSymbolImportability(
    packageOptions,
    program,
    tsNode.getSourceFile().fileName,
    moduleSpecifier,
    exsy,
  );

  debugLog("checkSymbolImportability result", {
    result: checkResult,
    symbolName: exsy.name,
    importerFile: tsNode.getSourceFile().fileName,
    moduleSpecifier,
  });

  switch (checkResult) {
    case "package": {
      debugLog("Reporting package error for", exsy.name);
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
      debugLog("Reporting private error for", exsy.name);
      context.report({
        node: originalNode,
        messageId: reexport ? "private:reexport" : "private",
        data: {
          identifier: exsy.name,
        },
      });
      break;
    }
    default: {
      debugLog("Symbol is importable:", exsy.name);
    }
  }
}
