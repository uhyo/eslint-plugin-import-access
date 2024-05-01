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
  it("Can import a re-exported value (export from)", async () => {
    const result = await tester.lintFile("src/reexport/useBar.ts");
    expect(result).toEqual([]);
  });
  it("Can import a re-exported private variable (export from)", async () => {
    const result = await tester.lintFile("src/reexport/useBaz.ts");
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "column": 10,
    "endColumn": 16,
    "endLine": 1,
    "line": 1,
    "message": "Cannot import a private export 'subBaz'",
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
      "src/reexport4/indexLoophole/reexportFromSubFoo.ts",
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
  it("Can re-export a variable exported from index.ts", async () => {
    const result = await tester.lintFile(
      "src/reexport4/indexLoophole/reexportFromSubIndex.ts",
    );
    expect(result).toMatchInlineSnapshot(`Array []`);
  });
  describe("indexLoophole = false", () => {
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
  describe("filenameLoophole = true", () => {
    it("Can import from sub directory of same name", async () => {
      const result = await tester.lintFile("src/reexport2/sub.ts", {
        jsdoc: {
          indexLoophole: false,
          filenameLoophole: true,
        },
      });
      expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "column": 10,
    "endColumn": 16,
    "endLine": 2,
    "line": 2,
    "message": "Cannot import a package-private export 'subBar'",
    "messageId": "package",
    "nodeType": "ImportSpecifier",
    "ruleId": "import-access/jsdoc",
    "severity": 2,
  },
]
`);
    });
    it("Can re-export from sub directory of same name", async () => {
      const result = await tester.lintFile(
        "src/reexport4/filenameLoophole/sub.ts",
        {
          jsdoc: {
            indexLoophole: false,
            filenameLoophole: true,
          },
        },
      );
      expect(result).toMatchInlineSnapshot(`Array []`);
    });
    it("Cannot re-export from sub directory of different name", async () => {
      const result = await tester.lintFile(
        "src/reexport4/filenameLoophole/sub2.ts",
        {
          jsdoc: {
            indexLoophole: false,
            filenameLoophole: true,
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
  describe("defaultImportability=package", () => {
    it("Cannot import no JSDocs from sub directory", async () => {
      const result = await tester.lintFile("src/reexport3/sub.ts", {
        jsdoc: {
          defaultImportability: "package",
        },
      });
      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "column": 10,
            "endColumn": 16,
            "endLine": 2,
            "line": 2,
            "message": "Cannot import a package-private export 'subBar'",
            "messageId": "package",
            "nodeType": "ImportSpecifier",
            "ruleId": "import-access/jsdoc",
            "severity": 2,
          },
        ]
      `);
    });
  });
  it("No error for node_modules with defaultImportability=package", async () => {
    const result = await tester.lintFile("src/reexport3/sub3/sub.ts", {
      jsdoc: {
        defaultImportability: "package",
      },
    });
    expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "column": 10,
            "endColumn": 16,
            "endLine": 2,
            "line": 2,
            "message": "Cannot import a package-private export 'subBar'",
            "messageId": "package",
            "nodeType": "ImportSpecifier",
            "ruleId": "import-access/jsdoc",
            "severity": 2,
          },
        ]
      `);
  });
});
