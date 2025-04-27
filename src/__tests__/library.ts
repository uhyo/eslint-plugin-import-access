import * as assert from "node:assert";
import { describe, it } from "node:test";
import { getESLintTester } from "./fixtures/eslint.js";

const tester = getESLintTester();

describe("library", () => {
  describe("Node.js builtin modules", () => {
    it("No error with defaultImportability=package ", async () => {
      const result = await tester.lintFile(
        "src/library/nodeBuiltinModules.ts",
        {
          jsdoc: {
            defaultImportability: "package",
          },
        },
      );
      assert.deepStrictEqual(result, []);
    });
  });
  describe("Third party modules", () => {
    it("No error with defaultImportability=package", async () => {
      const result = await tester.lintFile("src/library/thirdPartyModules.ts", {
        jsdoc: {
          defaultImportability: "package",
        },
      });
      assert.deepStrictEqual(result, []);
    });
    describe("Entrypoint is missing", () => {
      it("No error with defaultImportability=package", async () => {
        const result = await tester.lintFile(
          "src/library/thirdPartyModules/missingEntrypoint.ts",
          {
            jsdoc: {
              defaultImportability: "package",
            },
          },
        );
        assert.deepStrictEqual(result, []);
      });
    });
    describe("Importing sub module", () => {
      it("No error with defaultImportability=package", async () => {
        const result = await tester.lintFile(
          "src/library/thirdPartyModules/hasSubModule.ts",
          {
            jsdoc: {
              defaultImportability: "package",
            },
          },
        );
        assert.deepStrictEqual(result, []);
      });
    });
    describe("With exports field", () => {
      it("No error with defaultImportability=package", async () => {
        const result = await tester.lintFile(
          "src/library/thirdPartyModules/withExportsField.ts",
          {
            jsdoc: {
              defaultImportability: "package",
            },
          },
        );
        assert.deepStrictEqual(result, []);
      });
    });
  });
  describe("Workspace modules (symlink)", () => {
    it("No error with defaultImportability=package", async () => {
      const result = await tester.lintFile("src/library/workspaceModules.ts", {
        jsdoc: {
          defaultImportability: "package",
        },
      });
      assert.deepStrictEqual(result, []);
    });
    describe("Entrypoint is missing", () => {
      it("No error with defaultImportability=package", async () => {
        const result = await tester.lintFile(
          "src/library/workspaceModules/missingEntrypoint.ts",
          {
            jsdoc: {
              defaultImportability: "package",
            },
          },
        );
        assert.deepStrictEqual(result, []);
      });
    });
    describe("Importing sub module", () => {
      it("No error with defaultImportability=package", async () => {
        const result = await tester.lintFile(
          "src/library/workspaceModules/hasSubModule.ts",
          {
            jsdoc: {
              defaultImportability: "package",
            },
          },
        );
        assert.deepStrictEqual(result, []);
      });
    });
    describe("With exports field", () => {
      it("No error with defaultImportability=package", async () => {
        const result = await tester.lintFile(
          "src/library/workspaceModules/withExportsField.ts",
          {
            jsdoc: {
              defaultImportability: "package",
            },
          },
        );
        assert.deepStrictEqual(result, []);
      });
    });
  });
});
