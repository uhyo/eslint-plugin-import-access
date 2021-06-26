import jsdoc from "./rules/jsdoc";
import { tsServerPluginInit } from "./ts-server-plugin";

export = Object.assign(tsServerPluginInit, {
  rules: {
    jsdoc,
  },
  configs: {
    all: {
      plugins: ["import-access"],
      rules: {
        "import-access/jsdoc": "error",
      },
    },
  },
});
