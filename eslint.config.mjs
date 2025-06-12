import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jsdocRule = require('./dist/rules/jsdoc.js').default;

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        browser: true,
        es2021: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'local-rules': {
        rules: {
          jsdoc: jsdocRule,
        },
      },
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/ban-types': 'off',
      'local-rules/jsdoc': 'error',
    },
  }
);