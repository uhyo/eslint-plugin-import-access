import { getESLintTester } from "./fixtures/eslint";

const tester = getESLintTester();

describe("enums and namespaces", () => {
  it("Can import from same directory", async () => {
    const result = await tester.lintFile("src/enum-namespace/fooUser.ts");
    expect(result).toEqual([]);
  });
  it("Cannot import from sub directory", async () => {
    const result = await tester.lintFile("src/enum-namespace/barUser.ts");
    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "column": 3,
          "endColumn": 10,
          "endLine": 2,
          "line": 2,
          "message": "Cannot import a package-private export 'barEnum'",
          "messageId": "package",
          "ruleId": "import-access/jsdoc",
          "severity": 2,
        },
        Object {
          "column": 3,
          "endColumn": 15,
          "endLine": 3,
          "line": 3,
          "message": "Cannot import a package-private export 'barNamespace'",
          "messageId": "package",
          "ruleId": "import-access/jsdoc",
          "severity": 2,
        },
        Object {
          "column": 3,
          "endColumn": 17,
          "endLine": 4,
          "line": 4,
          "message": "Cannot import a private export 'barPrivateEnum'",
          "messageId": "private",
          "ruleId": "import-access/jsdoc",
          "severity": 2,
        },
        Object {
          "column": 3,
          "endColumn": 22,
          "endLine": 5,
          "line": 5,
          "message": "Cannot import a private export 'barPrivateNamespace'",
          "messageId": "private",
          "ruleId": "import-access/jsdoc",
          "severity": 2,
        },
        Object {
          "column": 3,
          "endColumn": 15,
          "endLine": 6,
          "line": 6,
          "message": "Cannot import a package-private export 'barConstEnum'",
          "messageId": "package",
          "ruleId": "import-access/jsdoc",
          "severity": 2,
        },
        Object {
          "column": 3,
          "endColumn": 23,
          "endLine": 7,
          "line": 7,
          "message": "Cannot import a package-private export 'barDeclaredNamespace'",
          "messageId": "package",
          "ruleId": "import-access/jsdoc",
          "severity": 2,
        },
        Object {
          "column": 3,
          "endColumn": 12,
          "endLine": 8,
          "line": 8,
          "message": "Cannot import a package-private export 'barDotted'",
          "messageId": "package",
          "ruleId": "import-access/jsdoc",
          "severity": 2,
        },
      ]
    `);
  });
  it("Unannotated enums and namespaces are public by default", async () => {
    const result = await tester.lintFile(
      "src/enum-namespace/unannotatedUser.ts",
    );
    expect(result).toEqual([]);
  });
  it("Unannotated enums and namespaces respect defaultImportability=package", async () => {
    const result = await tester.lintFile(
      "src/enum-namespace/unannotatedUser.ts",
      { jsdoc: { defaultImportability: "package" } },
    );
    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "column": 10,
          "endColumn": 28,
          "endLine": 1,
          "line": 1,
          "message": "Cannot import a package-private export 'barUnannotatedEnum'",
          "messageId": "package",
          "ruleId": "import-access/jsdoc",
          "severity": 2,
        },
        Object {
          "column": 30,
          "endColumn": 53,
          "endLine": 1,
          "line": 1,
          "message": "Cannot import a package-private export 'barUnannotatedNamespace'",
          "messageId": "package",
          "ruleId": "import-access/jsdoc",
          "severity": 2,
        },
      ]
    `);
  });
  it("Unannotated enums and namespaces respect defaultImportability=private", async () => {
    const result = await tester.lintFile(
      "src/enum-namespace/unannotatedUser.ts",
      { jsdoc: { defaultImportability: "private" } },
    );
    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "column": 10,
          "endColumn": 28,
          "endLine": 1,
          "line": 1,
          "message": "Cannot import a private export 'barUnannotatedEnum'",
          "messageId": "private",
          "ruleId": "import-access/jsdoc",
          "severity": 2,
        },
        Object {
          "column": 30,
          "endColumn": 53,
          "endLine": 1,
          "line": 1,
          "message": "Cannot import a private export 'barUnannotatedNamespace'",
          "messageId": "private",
          "ruleId": "import-access/jsdoc",
          "severity": 2,
        },
      ]
    `);
  });
});
