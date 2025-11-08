import { getESLintTester } from "./fixtures/eslint";

const tester = getESLintTester();

describe("packageDirectory option", () => {
  describe("without packageDirectory option (default behavior)", () => {
    it("Cannot import from _internal subdirectory", async () => {
      const result = await tester.lintFile(
        "src/package-directory/user.ts",
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

    it("Cannot import from sub/_internal subdirectory", async () => {
      const result = await tester.lintFile(
        "src/package-directory/sub/subUser.ts",
      );
      expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "column": 10,
    "endColumn": 27,
    "endLine": 1,
    "line": 1,
    "message": "Cannot import a package-private export 'subInternalHelper'",
    "messageId": "package",
    "nodeType": "ImportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
]
`);
    });
  });

  describe("with packageDirectory: ['**', '!**/_internal']", () => {
    const packageDirectoryOption = {
      jsdoc: {
        packageDirectory: ["**", "!**/_internal"],
      },
    };

    it("Can import from _internal subdirectory (treated as same package)", async () => {
      const result = await tester.lintFile(
        "src/package-directory/user.ts",
        packageDirectoryOption,
      );
      expect(result).toEqual([]);
    });

    it("Can import from sub/_internal subdirectory (treated as same package)", async () => {
      const result = await tester.lintFile(
        "src/package-directory/sub/subUser.ts",
        packageDirectoryOption,
      );
      expect(result).toEqual([]);
    });

    it("Can import from ancestor package (child can import from parent)", async () => {
      const result = await tester.lintFile(
        "src/package-directory/sub/descendantUser.ts",
        packageDirectoryOption,
      );
      expect(result).toEqual([]);
    });

    it("Cannot import from different package even with _internal exclusion", async () => {
      const result = await tester.lintFile(
        "src/package-directory/crossPackageUser.ts",
        packageDirectoryOption,
      );
      expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "column": 10,
    "endColumn": 27,
    "endLine": 3,
    "line": 3,
    "message": "Cannot import a package-private export 'subInternalHelper'",
    "messageId": "package",
    "nodeType": "ImportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
]
`);
    });
  });

  describe("with packageDirectory: ['**']", () => {
    const allPackagesOption = {
      jsdoc: {
        packageDirectory: ["**"],
      },
    };

    it("Cannot import from _internal subdirectory (all dirs are packages)", async () => {
      const result = await tester.lintFile(
        "src/package-directory/user.ts",
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
});
