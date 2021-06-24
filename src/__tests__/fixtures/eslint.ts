import { TSESLint } from "@typescript-eslint/experimental-utils";
import * as parser from "@typescript-eslint/parser";
import { readFile } from "fs/promises";
import path from "path";
import { Program } from "typescript";
import jsdocRule from "../../rules/jsdoc";

class ESLintTester {
  #projectRoot: string;
  #linter: TSESLint.Linter;
  #program: Program;
  constructor(projectRoot: string) {
    this.#projectRoot = projectRoot;
    this.#linter = new TSESLint.Linter({
      cwd: this.#projectRoot,
    });
    this.#program = parser.createProgram("./tsconfig.json", projectRoot);

    this.#linter.defineParser("@typescript-eslint/parser", parser);

    this.#linter.defineRule("import-access/jsdoc", jsdocRule);
  }
  /**
   * Lint file in the project (relative to project root).
   */
  async lintFile(filePath: string) {
    const fileAbsolutePath = path.join(this.#projectRoot, filePath);
    const code = await readFile(fileAbsolutePath, {
      encoding: "utf8",
    });

    return this.#linter.verify(
      code,
      {
        parser: "@typescript-eslint/parser",
        parserOptions: {
          ecmaVersion: 2020,
          tsconfigRootDir: this.#projectRoot,
          project: "./tsconfig.json",
          sourceType: "module",
          program: this.#program,
        },
        rules: {
          "import-access/jsdoc": ["error", {}],
        },
      },
      {
        filename: fileAbsolutePath,
      }
    );
  }
}

/**
 * get an ESLint instance for testing.
 */
export function getESLintTester(): ESLintTester {
  const projectRoot = path.resolve(__dirname, "project");
  return new ESLintTester(projectRoot);
}
