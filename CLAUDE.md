# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `eslint-plugin-import-access`, an ESLint plugin that provides TypeScript package-private import restrictions via JSDoc `@package` annotations. The plugin prevents imports of package-private exports from outside their directory and includes a TypeScript Language Service Plugin for IDE integration.

## Development Commands

### Building
```bash
npm run build          # Compile TypeScript to dist/
npm run build:watch    # Watch mode compilation
```

### Testing
```bash
npm test               # Run all tests with type checking
npm run test:watch     # Watch mode testing
```

### Linting
```bash
npm run lint           # ESLint check on src/**/*.ts
```

## Architecture

### Core Components

- **ESLint Rule**: `src/rules/jsdoc.ts` - Main ESLint rule implementation that checks import/export statements
- **Symbol Checker**: `src/core/checkSymbolmportability.ts` - Core logic for determining if a symbol can be imported based on JSDoc annotations
- **TypeScript Plugin**: `src/ts-plugin.ts` and `src/ts-server-plugin/` - Language service plugin for IDE integration
- **Configuration**: 
  - `src/flat-config.cts` - ESLint flat config export
  - `src/flat-config.mts` - ESLint flat config export (MJS)
  - `src/index.ts` - Main plugin export combining ESLint and TS server functionality

### Key Utilities

- `src/utils/getAccessOfJsDocs.ts` - Extracts access level from JSDoc comments
- `src/utils/isInPackage.ts` - Determines package relationships between files
- `src/utils/findExportableDeclaration.ts` - Locates exportable declarations in TypeScript AST

### Configuration Options

The plugin supports several options via the JSDoc rule:
- `indexLoophole`: Allow imports from `index.ts` in subdirectories (default: true)  
- `filenameLoophole`: Allow imports from files with matching directory names (default: false)
- `defaultImportability`: Default access level for exports ("public" | "package" | "private", default: "public")
- `treatSelfReferenceAs`: Handle self-references as "internal" or "external" (default: "external")
- `excludeSourcePatterns`: Glob patterns to exclude from checks (default: [])

### Test Structure

Tests are located in `src/__tests__/` with extensive fixture packages in `src/__tests__/fixtures/packages/` and `src/__tests__/fixtures/project/`. The test suite uses Vitest and includes both workspace and third-party package scenarios.

### Build Outputs

The plugin exports multiple entry points:
- `dist/index.js` - Main plugin (CommonJS)
- `dist/flat-config.cjs` / `dist/flat-config.mjs` - ESLint flat config formats
- `dist/ts-plugin.js` - TypeScript server plugin

### Development Notes

- Uses TypeScript with strict mode and Node 16 module resolution
- ESLint flat config for self-linting with the plugin's own jsdoc rule
- Vitest for testing with 10s timeout for TypeScript compilation tests
- Package includes workspace dependencies for testing scenarios