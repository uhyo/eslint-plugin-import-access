import type { TSESLint } from "@typescript-eslint/utils";

/**
 * ESLint Plugin object of eslint-plugin-import-access.
 */
const eslintPlugin: TSESLint.FlatConfig.Plugin = {
  rules: {
    get jsdoc() {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./rules/jsdoc.js").default;
    },
  },
};

export = eslintPlugin;
