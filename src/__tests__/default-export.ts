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
  it("Cannot import package when jsDoc is not declared from sub directory with defaultImportability=package", async () => {
    const result = await tester.lintFile("src/default-export/foo.ts", {
      jsdoc: {
        defaultImportability: "package",
      },
    });
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
          "column": 8,
          "endColumn": 11,
          "endLine": 2,
          "line": 2,
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
  it("Cannot import package when jsDoc is not declared from sub directory with defaultImportability=private", async () => {
    const result = await tester.lintFile("src/default-export/foo.ts", {
      jsdoc: {
        defaultImportability: "private",
      },
    });
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
          "column": 8,
          "endColumn": 11,
          "endLine": 2,
          "line": 2,
          "message": "Cannot import a private export 'default'",
          "messageId": "private",
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
  it("No error for node_modules with defaultImportability=package", async () => {
    const result = await tester.lintFile("src/default-export2/foo.ts", {
      jsdoc: {
        defaultImportability: "package",
      },
    });
    expect(result).toMatchInlineSnapshot(`Array []`);
  });
});
