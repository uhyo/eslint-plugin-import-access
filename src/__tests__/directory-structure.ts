import * as assert from "node:assert";
import { describe, it } from "node:test";
import { getESLintTester } from "./fixtures/eslint.js";

const tester = getESLintTester();

describe("directory structure", () => {
  it("Canot import from subsub directory", async () => {
    const result = await tester.lintFile(
      "src/directory-structure/subsubUser.ts",
    );
    assert.deepStrictEqual(result, [
      {
        column: 10,
        endColumn: 19,
        endLine: 1,
        line: 1,
        message: "Cannot import a package-private export 'subsubVar'",
        messageId: "package",
        nodeType: "ImportSpecifier",
        ruleId: "import-access/jsdoc",
        severity: 2,
      },
    ]);
  });
  it("Can import from sub/index.ts", async () => {
    const result = await tester.lintFile(
      "src/directory-structure/subIndexUser.ts",
    );
    assert.deepStrictEqual(result, []);
  });
  it("Can import from ../pkg", async () => {
    const result = await tester.lintFile(
      "src/directory-structure/sub/sub2/parentUser.ts",
    );
    assert.deepStrictEqual(result, []);
  });
  it("Cannot import from sibling sub-package", async () => {
    const result = await tester.lintFile(
      "src/directory-structure/sub/sub3/siblingUser.ts",
    );
    assert.deepStrictEqual(result, [
      {
        column: 10,
        endColumn: 19,
        endLine: 1,
        line: 1,
        message: "Cannot import a package-private export 'subsubVar'",
        messageId: "package",
        nodeType: "ImportSpecifier",
        ruleId: "import-access/jsdoc",
        severity: 2,
      },
    ]);
  });
});
