import { getESLintTester } from "./fixtures/eslint.js";

const tester = getESLintTester();

it("Self-reference via package.json exports is treated as external by default", async () => {
  const result = await tester.lintFile("src/self-reference/user.ts", {
    jsdoc: {
      defaultImportability: "private",
    },
  });
  expect(result).toMatchInlineSnapshot(`Array []`);
});

it("Self-reference via package.json exports is treated as internal when treatSelfReferenceAs: internal", async () => {
  const result = await tester.lintFile("src/self-reference/user.ts", {
    jsdoc: {
      defaultImportability: "private",
      treatSelfReferenceAs: "internal",
    },
  });
  expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "column": 10,
    "endColumn": 23,
    "endLine": 1,
    "line": 1,
    "message": "Cannot import a private export 'exportedValue'",
    "messageId": "private",
    "nodeType": "ImportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
]
`);
});

it("Self-reference via package.json exports is treated as external when treatSelfReferenceAs: external", async () => {
  const result = await tester.lintFile("src/self-reference/user.ts", {
    jsdoc: {
      defaultImportability: "private",
      treatSelfReferenceAs: "external",
    },
  });
  expect(result).toMatchInlineSnapshot(`Array []`);
});
