import { getESLintTester } from "./fixtures/eslint";

const tester = getESLintTester();

// Uses user2.ts (duplicate of user.ts) to avoid caching issues when same file is linted with different options
describe("packageDirectory option - all directories as packages", () => {
  const allPackagesOption = {
    jsdoc: {
      packageDirectory: ["**"],
    },
  };

  it("Cannot import from _internal subdirectory (all dirs are packages)", async () => {
    const result = await tester.lintFile(
      "src/package-directory/user2.ts",
      allPackagesOption,
    );
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "column": 10,
    "endColumn": 24,
    "endLine": 1,
    "line": 1,
    "message": "Cannot import a package-private export 'internalHelper'",
    "messageId": "package",
    "nodeType": "ImportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
]
`);
  });
});
