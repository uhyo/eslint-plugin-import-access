import { getESLintTester } from "./fixtures/eslint.js";

const tester = getESLintTester();

describe("variables", () => {
  it("Can import from same directory", async () => {
    const result = await tester.lintFile("src/variable/fooUser.ts");
    expect(result).toEqual([]);
  });
  it("Cannot import from sub directory", async () => {
    const result = await tester.lintFile("src/variable/barUser.ts");
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "column": 10,
    "endColumn": 23,
    "endLine": 1,
    "line": 1,
    "message": "Cannot import a package-private export 'barDestructed'",
    "messageId": "package",
    "nodeType": "ImportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
  Object {
    "column": 25,
    "endColumn": 33,
    "endLine": 1,
    "line": 1,
    "message": "Cannot import a package-private export 'barValue'",
    "messageId": "package",
    "nodeType": "ImportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
  Object {
    "column": 35,
    "endColumn": 44,
    "endLine": 1,
    "line": 1,
    "message": "Cannot import a package-private export 'barValue2'",
    "messageId": "package",
    "nodeType": "ImportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
]
`);
  });
});
