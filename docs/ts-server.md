# TypeScript Server Plugin Reference

The TypeScript server plugin can be enabled by the following settings in **tsconfig.json**:

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

In addition, options can be provided to the plugin:

```json
{
  "compilerOptions": {
    // ...
    "plugins": [
      // ...
      {
        "name": "eslint-plugin-import-access",
        "jsdoc": {
          "indexLoophole": false,
          "filenameLoophole": true
        }
      }
    ]
  }
}
```

See details of the `indexLoophole` and `filenameLoophole` options at [the reference of the import-access/jsdoc rule](./rule-jsdoc.md).
