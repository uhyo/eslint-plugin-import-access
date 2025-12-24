import { getESLintTester } from "./fixtures/eslint";

const tester = getESLintTester();

it("Self-reference via package.json exports is treated as external by default", async () => {
  const result = await tester.lintFile("src/self-reference/user.ts", {
    jsdoc: {
      defaultImportability: "private",
    },
  });
  expect(result).toMatchInlineSnapshot(`Array []`);
});

it("Self-reference via package.json exports is treated as external when treatSelfReferenceAs: external", async () => {
  const result = await tester.lintFile("src/self-reference/user.ts", {
    jsdoc: {
      defaultImportability: "private",
      treatSelfReferenceAs: "external",
    },
  });
  expect(result).toMatchInlineSnapshot(`Array []`);
});
