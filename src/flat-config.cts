import type { TSESLint } from "@typescript-eslint/utils";
import jsdoc = require("./rules/jsdoc.js");

/**
 * ESLint Plugin object of eslint-plugin-import-access.
 */
const eslintPlugin: TSESLint.FlatConfig.Plugin = {
  rules: {
    jsdoc: jsdoc.default,
  },
};

export = eslintPlugin;
