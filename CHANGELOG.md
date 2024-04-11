## Changelog

### 2.2.0

- Support Flat Config (#20)

### 2.1.2

- fix bug check package incorrect on Windows (#15)

### 2.1.1

- Fixed the `treatSelfReferenceAs` option to support scoped packages. (#13)

### 2.1.0

- Added a `treatSelfReferenceAs` option which allows you to treat self-references either like internal file or like external module. (#12)

### 2.0.0

#### :warning: BREAKING CHANGES

- Minimum supported TypeScript version is now 4.7 (previously 4.4)
- Minimum supported Node.js version is now 16 (previously 14)

#### Other Changes

- Added check for the `export { ... } from` syntax. Previously you could export a private symbol by using this syntax, but now it is also checked. (#9)
- Fixed the handling of symlinked external modules. (#10)

### 1.1.2

- Fixed the issue where one could not import from type-only packages. (#7)
- Fixed the issue where one could not import from Node.js built-in modules. (#8)

### 1.1.1

- Removed check against imports from inside `node_modules`. (#6)

### 1.1.0

- Added a `defaultImportability` option with which you can use `@package` or `@private` as default importability of all exports in the project. (#5)

### 1.0.2

- Fix a bug that `export default` is not checked. (#2)
- Extend the file name pattern to consider as an index file. Previously only `index.ts` and `index.tsx` were considered as an index file. Now `index.js`, `index.mts`, etc. are also considered.

### 1.0.1

- Upgrade TypeScript to 4.5 (https://github.com/uhyo/eslint-plugin-import-access/pull/1)

### 1.0.0

No change from 1.0.0-beta.

### 1.0.0-beta

Initial release.
