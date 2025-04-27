import * as assert from "node:assert";
import { describe, it } from "node:test";
import { getESLintTester } from "./fixtures/eslint.js";

const tester = getESLintTester();

describe("function declaration", () => {
  it("Can import from same directory", async () => {
    const result = await tester.lintFile("src/function/fooUser.ts");
    assert.deepStrictEqual(result, []);
  });
  it("Cannot import from sub directory", async () => {
    const result = await tester.lintFile("src/function/barUser.ts");
    assert.deepStrictEqual(result, [
      {
        column: 10,
        endColumn: 26,
        endLine: 1,
        line: 1,
        message: "Cannot import a package-private export 'barAccessPackage'",
        messageId: "package",
        nodeType: "ImportSpecifier",
        ruleId: "import-access/jsdoc",
        severity: 2,
      },
      {
        column: 28,
        endColumn: 38,
        endLine: 1,
        line: 1,
        message: "Cannot import a package-private export 'barPackage'",
        messageId: "package",
        nodeType: "ImportSpecifier",
        ruleId: "import-access/jsdoc",
        severity: 2,
      },
      {
        column: 40,
        endColumn: 61,
        endLine: 1,
        line: 1,
        message: "Cannot import a package-private export 'barPackage'",
        messageId: "package",
        nodeType: "ImportSpecifier",
        ruleId: "import-access/jsdoc",
        severity: 2,
      },
    ]);
  });
  it("Cannot default-import package-private function", async () => {
    const result = await tester.lintFile("src/function/bazUser.ts");
    assert.deepStrictEqual(result, [
      {
        column: 8,
        endColumn: 18,
        endLine: 1,
        line: 1,
        message: "Cannot import a package-private export 'default'",
        messageId: "package",
        nodeType: "ImportDefaultSpecifier",
        ruleId: "import-access/jsdoc",
        severity: 2,
      },
    ]);
  });
});
