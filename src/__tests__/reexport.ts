import { getESLintTester } from "./fixtures/eslint";

const tester = getESLintTester();

describe("reexports", () => {
  it("Can import a re-exported variable", async () => {
    const result = await tester.lintFile("src/reexport/useFoo.ts");
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "column": 18,
    "endColumn": 31,
    "endLine": 1,
    "line": 1,
    "message": "Cannot import a private export 'subFooPrivate'",
    "messageId": "private",
    "nodeType": "ImportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
]
`);
  });
});
