module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "local-rules"],
  rules: {
    "no-undef": ["off"],
    "@typescript-eslint/ban-types": ["off"],
    "local-rules/jsdoc": ["error"],
  },
};
