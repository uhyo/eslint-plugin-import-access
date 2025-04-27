import * as assert from "node:assert";
import { describe, it } from "node:test";
import { getESLintTester } from "./fixtures/eslint.js";

const tester = getESLintTester();

describe("types", () => {
  it("Can import from same directory", async () => {
    const result = await tester.lintFile("src/type/fooUser.ts");
    assert.deepStrictEqual(result, []);
  });
  it("Cannot import from sub directory", async () => {
    const result = await tester.lintFile("src/type/barUser.ts");
    assert.deepStrictEqual(result, [
      {
        column: 10,
        endColumn: 22,
        endLine: 1,
        line: 1,
        message: "Cannot import a package-private export 'barInterface'",
        messageId: "package",
        nodeType: "ImportSpecifier",
        ruleId: "import-access/jsdoc",
        severity: 2,
      },
      {
        column: 24,
        endColumn: 31,
        endLine: 1,
        line: 1,
        message: "Cannot import a package-private export 'barType'",
        messageId: "package",
        nodeType: "ImportSpecifier",
        ruleId: "import-access/jsdoc",
        severity: 2,
      },
    ]);
  });
});
