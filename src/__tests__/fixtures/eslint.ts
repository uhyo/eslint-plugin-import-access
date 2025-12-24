import * as parser from "@typescript-eslint/parser";
import { TSESLint } from "@typescript-eslint/utils";
import { readFile } from "fs/promises";
import path from "path";
import { Program } from "typescript";
import jsdocRule, { JSDocRuleOptions } from "../../rules/jsdoc";

const flatPlugin = {
  rules: {
    jsdoc: jsdocRule,
  },
};

interface ESLintTester {
  /**
   * Lint file in the project (relative to project root).
   */
  lintFile(
    filePath: string,
    rules?: Partial<{ jsdoc: Partial<JSDocRuleOptions> }>,
  ): Promise<TSESLint.Linter.LintMessage[]>;
}

class FlatESLintTester implements ESLintTester {
  #projectRoot: string;
  #linter: TSESLint.Linter;
  #program: Program;
  constructor(projectRoot: string) {
    this.#projectRoot = projectRoot;
    this.#linter = new TSESLint.Linter({
      cwd: this.#projectRoot,
      configType: "flat",
    });
    this.#program = parser.createProgram("./tsconfig.json", projectRoot);
  }
  async lintFile(
    filePath: string,
    rules?: Partial<{ jsdoc: Partial<JSDocRuleOptions> }>,
  ) {
    const fileAbsolutePath = path.join(this.#projectRoot, filePath);
    const code = await readFile(fileAbsolutePath, {
      encoding: "utf8",
    });

    return this.#linter.verify(
      code,
      {
        files: ["**/*.ts"],
        languageOptions: {
          parser,
          parserOptions: {
            ecmaVersion: 2020,
            tsconfigRootDir: this.#projectRoot,
            projectService: true,
            sourceType: "module",
            program: this.#program,
          },
        },
        plugins: {
          "import-access": flatPlugin,
        },
        rules: {
          "import-access/jsdoc": ["error", rules?.jsdoc ?? {}],
        },
      },
      {
        filename: fileAbsolutePath,
      },
    );
  }
}

class LegacyESLintTester implements ESLintTester {
  #projectRoot: string;
  #linter: TSESLint.Linter;
  #program: Program;
  constructor(projectRoot: string) {
    this.#projectRoot = projectRoot;
    this.#linter = new TSESLint.Linter({
      cwd: this.#projectRoot,
      configType: "eslintrc",
    });
    this.#program = parser.createProgram("./tsconfig.json", projectRoot);

    this.#linter.defineParser("@typescript-eslint/parser", parser);

    this.#linter.defineRule("import-access/jsdoc", jsdocRule);
  }
  async lintFile(
    filePath: string,
    rules?: Partial<{ jsdoc: Partial<JSDocRuleOptions> }>,
  ) {
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
          projectService: true,
          sourceType: "module",
          program: this.#program,
        },
        rules: {
          "import-access/jsdoc": ["error", rules?.jsdoc ?? {}],
        },
      },
      {
        filename: fileAbsolutePath,
      },
    );
  }
}

const flatConfig = !!process.env.TEST_FLAT_CONFIG;
let cache: ESLintTester | undefined;
/**
 * get an ESLint instance for testing.
 */
export function getESLintTester(): ESLintTester {
  const projectRoot = path.resolve(__dirname, "project");
  if (flatConfig) {
    return (cache ||= new FlatESLintTester(projectRoot));
  } else {
    return (cache ||= new LegacyESLintTester(projectRoot));
  }
}
