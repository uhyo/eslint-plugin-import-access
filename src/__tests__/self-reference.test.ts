import * as assert from "node:assert";
import { it } from "node:test";
import { getESLintTester } from "./fixtures/eslint.js";

const tester = getESLintTester();

it("Self-reference via package.json exports is treated as external by default", async () => {
  const result = await tester.lintFile("src/self-reference/user.ts", {
    jsdoc: {
      defaultImportability: "private",
    },
  });
  assert.deepStrictEqual(result, []);
});

it("Self-reference via package.json exports is treated as internal when treatSelfReferenceAs: internal", async () => {
  const result = await tester.lintFile("src/self-reference/user.ts", {
    jsdoc: {
      defaultImportability: "private",
      treatSelfReferenceAs: "internal",
    },
  });
  assert.deepStrictEqual(result, [
    {
      column: 10,
      endColumn: 23,
      endLine: 1,
      line: 1,
      message: "Cannot import a private export 'exportedValue'",
      messageId: "private",
      nodeType: "ImportSpecifier",
      ruleId: "import-access/jsdoc",
      severity: 2,
    },
  ]);
});

it("Self-reference via package.json exports is treated as external when treatSelfReferenceAs: external", async () => {
  const result = await tester.lintFile("src/self-reference/user.ts", {
    jsdoc: {
      defaultImportability: "private",
      treatSelfReferenceAs: "external",
    },
  });
  assert.deepStrictEqual(result, []);
});
