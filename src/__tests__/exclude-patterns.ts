import { getESLintTester } from "./fixtures/eslint.js";

const tester = getESLintTester();

it("Importing from generated package is disallowed by default", async () => {
  const result = await tester.lintFile(
    "src/exclude-patterns/generated-type-user.ts",
    {
      jsdoc: {
        defaultImportability: "package",
      },
    },
  );
  expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "column": 10,
    "endColumn": 19,
    "endLine": 1,
    "line": 1,
    "message": "Cannot import a package-private export 'someValue'",
    "messageId": "package",
    "nodeType": "ImportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
]
`);
});

it("Importing from generated package is allowed with excludeSourcePatterns targeting the file path (relative path)", async () => {
  const result = await tester.lintFile(
    "src/exclude-patterns/generated-type-user.ts",
    {
      jsdoc: {
        defaultImportability: "package",
        excludeSourcePatterns: [
          // exclude the types file
          "src/__tests__/fixtures/project/src/exclude-patterns/types/**",
        ],
      },
    },
  );
  expect(result).toMatchInlineSnapshot(`Array []`);
});
