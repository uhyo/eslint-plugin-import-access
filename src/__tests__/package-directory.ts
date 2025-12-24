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

  describe("filenameLoophole with packageDirectory", () => {
    const filenameLoopholeOption = {
      jsdoc: {
        packageDirectory: ["**", "!**/_internal"],
        filenameLoophole: true,
      },
    };

    it("Can import from directory matching filename (filenameLoophole works with packageDirectory)", async () => {
      const result = await tester.lintFile(
        "src/package-directory/filenameLoophole/sub.ts",
        filenameLoopholeOption,
      );
      expect(result).toEqual([]);
    });
  });

  describe("with packageDirectory: ['src/package-directory/packages/*'] (specific directory pattern)", () => {
    const packagesOption = {
      jsdoc: {
        packageDirectory: ["src/package-directory/packages/*"],
      },
    };

    it("Can import from deep subdirectory within same package", async () => {
      const result = await tester.lintFile(
        "src/package-directory/packages/packageA/user.ts",
        packagesOption,
      );
      expect(result).toEqual([]);
    });

    it("Cannot import from sibling package", async () => {
      const result = await tester.lintFile(
        "src/package-directory/packages/packageB/crossUser.ts",
        packagesOption,
      );
      expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "column": 10,
    "endColumn": 24,
    "endLine": 2,
    "line": 2,
    "message": "Cannot import a package-private export 'packageAHelper'",
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
