# eslint-plugin-import-access

## What?

This package provides a [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint) rule that restricts importing variables marked as `@package` from a file outside the same directory. Also, this package serves as a TypeScript Language Service Plugin that prevents auto-completion of such imports.

![Illustration of how `@package` works.](./docs/images/concept.png)

## Why?

The largest encapsulation unit available for a TypeScript project is a file. That is, variables not exported from a file is only visible to code in the same file. Once a variable is exported, it is visible from the entire project.

Sometimes this is insufficient. A rational effort for proper encapsulation may result in a large file that is hard to maintain.

This package solves this problem by providing a new directory-level layer and enabling a “package-private” export that is only visible to files in the same directory.

## Installation

```sh
npm i -D eslint-plugin-import-access
```

Depending on how you configure ESLint, use either Flat Config or eslintrc to configure eslint-plugin-import-access.

Also, you can enable the TypeScript Language Service Plugin by adding it to the `plugins` array in `tsconfig.json`.

### Flat Config

In **eslint.config.js**:

```js
import importAccess from "eslint-plugin-import-access/flat-config";

export default [
  // other settings...
  // (you also need to set up typescript-eslint)
  {
    plugins: {
      "import-access": importAccess,
    },
  },
  {
    rules: {
      "import-access/jsdoc": ["error"],
    },
  },
];
```

_Note: currently you need to import the plugin from the `/flat-config` subpath. In a future version, this will be simplified._

### eslintrc

In **.eslintrc.js**:

```js
  "plugins": [
    "import-access",
    // ...
  ],
  "rules": {
    "import-access/jsdoc": ["error"],
  }
```

### TypeScript Language Service Plugin

In **tsconfig.json**:

```json
{
  "compilerOptions": {
    // ...
    "plugins": [
      // ...
      {
        "name": "eslint-plugin-import-access"
      }
    ]
  }
}
```

_Note: to enable TypeScript language service plugins installed locally, you must use TypeScript in `node_modules`, not the one bundled with VSCode._

## Example

```ts
// ----- sub/foo.ts -----

/**
 * @package
 */
export const fooPackageVariable = "I am package-private export";

// ----- sub/bar.ts -----
// This is correct because foo.ts is in the same directory
import { fooPackageVariable } from "./foo";

// ----- baz.ts -----
// This is INCORRECT because package-private exports
// cannot be imported from outside the sub directory
import { fooPackageVariable } from "./sub/foo";
```

## Rule References

- [import-access/jsdoc](./docs/rule-jsdoc.md)

- [Language Service Plugin](./docs/ts-server.md)

## Contributing

Welcome

## License

MIT
