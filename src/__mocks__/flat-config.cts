import type { TSESLint } from "@typescript-eslint/utils";

/**
 * ESLint Plugin object of eslint-plugin-import-access.
 */
const eslintPlugin: TSESLint.FlatConfig.Plugin = {
  rules: {
    jsdoc: {
      meta: {
        type: "suggestion",
        docs: {
          description: "Mock rule for testing",
        },
        schema: [],
      },
      create: () => ({}),
    },
  },
};

export = eslintPlugin;
