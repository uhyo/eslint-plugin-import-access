import { getESLintTester } from "./fixtures/eslint";

const tester = getESLintTester();

describe("export * syntax", () => {
  it("Can import a re-exported variable", async () => {
    const result = await tester.lintFile("src/export-star/main.ts");
    expect(result).toMatchInlineSnapshot(`Array []`);
  });
});
