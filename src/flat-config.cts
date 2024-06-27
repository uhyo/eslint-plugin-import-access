import type { TSESLint } from "@typescript-eslint/utils";
import {} from "@typescript-eslint/utils";
import jsdoc from "./rules/jsdoc";

/**
 * ESLint Plugin object of eslint-plugin-import-access.
 */
const eslintPlugin: TSESLint.FlatConfig.Plugin = {
  rules: {
    jsdoc,
  },
};

export = eslintPlugin;
