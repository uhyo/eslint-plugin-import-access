import { getESLintTester } from "./fixtures/eslint";

const tester = getESLintTester();

describe("reexports indexLoophole = false", () => {
  it("Cannot import a package-private variable from sub/index.ts", async () => {
    const result = await tester.lintFile("src/reexport/useFoo.ts", {
      jsdoc: {
        indexLoophole: false,
      },
    });
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "column": 10,
    "endColumn": 16,
    "endLine": 1,
    "line": 1,
    "message": "Cannot import a package-private export 'subFoo'",
    "messageId": "package",
    "nodeType": "ImportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
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
  it("Cannot re-export a package-private variable", async () => {
    const result = await tester.lintFile(
      "src/reexport4/indexLoophole/reexportFromSubIndex.ts",
      {
        jsdoc: {
          indexLoophole: false,
        },
      },
    );
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "column": 10,
    "endColumn": 16,
    "endLine": 1,
    "line": 1,
    "message": "Cannot re-export a package-private export 'subFoo'",
    "messageId": "package:reexport",
    "nodeType": "ExportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
]
`);
  });
});
