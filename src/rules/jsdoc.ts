import { TSESLint, TSESTree } from "@typescript-eslint/experimental-utils";
import { Declaration, Node, Symbol, TypeChecker } from "typescript";
import { assertNever } from "../utils/assertNever";
import { concatArrays } from "../utils/concatArrays";
import { findExportedDeclaration } from "../utils/findExportableDeclaration";
import { getAccessOfJsDocs } from "../utils/getAccessOfJsDocs";
import { getImmediateAliasedSymbol } from "../utils/getImmediateAliasedSymbol";
import { getJSDocTags, Tag } from "../utils/getJSDocTags";
import { isInPackage, PackageOptions } from "../utils/isInPackage";

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
  const declTuple = findDeclaredSymbolAlias(checker, symbol);
  if (!declTuple) {
    return;
  }
  const [exsy, rawDecl] = declTuple;
  const decl = findExportedDeclaration(rawDecl);
  if (!decl) {
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
    decl.getSourceFile().fileName,
    packageOptions
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

function findDeclaredSymbolAlias(
  checker: TypeChecker,
  symbol: Symbol
): [symb: Symbol, decl: Declaration] | undefined {
  let s: Symbol | undefined = symbol;

  do {
    s = getImmediateAliasedSymbol(checker, s);
    if (s) {
      const decl = s.declarations?.[0];
      if (decl) {
        return [s, decl];
      }
    }
  } while (s);
}
