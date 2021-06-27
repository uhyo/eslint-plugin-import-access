# `import-access/jsdoc` rule

_Note: although this rule does not seem related to types, this rule requires [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint) settings and also [a type information enabled](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#parseroptionsproject)._

When this rule is enabled, `export` declaration can have a JSDoc `@package` annotation. Such exports can be imported only from files in the same directory or sub directories in that directory.

As a bonus feature, importing exports annotated with `@private` is always forbidden.

**Example settings in .eslintrc.js**:

```js
  "rules": {
    "import-access/jsdoc": ["error", {
      "indexLoophole": true,
      "filenameLoophole": false
    }],
  }
```

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

## Options

The `import-access/jsdoc` rule has following options and default values:

```ts
type JSDocRuleOptions = {
  indexLoophole: boolean;
  filenameLoophole: boolean;
};
```

### `indexLoophole`

_Default value: `true`_

Enables the **index loophole** feature. When this option is enabled, `sub/index.ts` is treated similarly to `sub.ts`. That is, package-private exports exported from `index.ts` can be imported from files in the parent directory.

**Example:**

```ts
// ----- sub/sub2/index.ts

/**
 * @package
 */
export const pika = "chu";

// ----- sub/foo.ts
// This is correct
import { pika } from "./sub2/index";

// ----- bar.ts
// This is still INCORRECT
import { pika } from "./sub/sub2/index`;
```

### `filenameLoophole`

_Default value: `false`_

Enables the **filename loophole** feature. When this option is enabled, package-private exports in a directory can be imported from a file with the same name as the directory.

**Example:**

```ts
// ----- sub/foo.ts

/**
 * @package
 */
export const pika = "chu";

// ----- sub.ts
// This is correct to import a package-private exports
// from the directory named `sub`
import { pika } from "./sub/foo";

// ----- pika.ts
// This is still INCORRECT because file name does not match
// the directory name
import { pika } from "./sub/foo";
```
