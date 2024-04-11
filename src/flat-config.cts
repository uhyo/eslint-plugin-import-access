import jsdoc from "./rules/jsdoc";

/**
 * ESLint Plugin object of eslint-plugin-import-access.
 */
const eslintPlugin = {
  rules: {
    jsdoc: jsdoc as unknown,
  },
};

export = eslintPlugin;
