import { getESLintTester } from "./fixtures/eslint";

const tester = getESLintTester();

describe("types", () => {
  it("Can import from same directory", async () => {
    const result = await tester.lintFile("src/type/fooUser.ts");
    expect(result).toEqual([]);
  });
  it("Cannot import from sub directory", async () => {
    const result = await tester.lintFile("src/type/barUser.ts");
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "column": 10,
    "endColumn": 22,
    "endLine": 1,
    "line": 1,
    "message": "Cannot import a package-private export 'barInterface'",
    "messageId": "package",
    "nodeType": "ImportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
  Object {
    "column": 24,
    "endColumn": 31,
    "endLine": 1,
    "line": 1,
    "message": "Cannot import a package-private export 'barType'",
    "messageId": "package",
    "nodeType": "ImportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
]
`);
  });
});
