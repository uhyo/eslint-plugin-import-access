import { getESLintTester } from "./fixtures/eslint";

const tester = getESLintTester();

describe("default export", () => {
  it("Cannot import a package-default-export from sub directory", async () => {
    const result = await tester.lintFile("src/default-export/foo.ts");
    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "column": 8,
          "endColumn": 12,
          "endLine": 1,
          "line": 1,
          "message": "Cannot import a package-private export 'default'",
          "messageId": "package",
          "nodeType": "ImportDefaultSpecifier",
          "ruleId": "import-access/jsdoc",
          "severity": 2,
        },
        Object {
          "column": 10,
          "endColumn": 25,
          "endLine": 4,
          "line": 4,
          "message": "Cannot import a package-private export 'default'",
          "messageId": "package",
          "nodeType": "ImportSpecifier",
          "ruleId": "import-access/jsdoc",
          "severity": 2,
        },
      ]
    `);
  });
});
