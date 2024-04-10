import jsdoc from "./rules/jsdoc";

/**
 * ESLint Plugin object of eslint-plugin-import-access.
 */
const eslintPlugin = {
  rules: {
    jsdoc: jsdoc as unknown,
  },
  configs: {
    all: {} as unknown,
  },
};

eslintPlugin.configs.all = {
  plugins: { "import-access": eslintPlugin },
  rules: {
    "import-access/jsdoc": "error",
  },
};

export = eslintPlugin;
