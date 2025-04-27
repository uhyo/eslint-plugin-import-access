import jsdoc from "./rules/jsdoc.js";
import { tsServerPluginInit } from "./ts-server-plugin/index.js";

const eslintRule = {
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
};

const plugin = Object.assign(tsServerPluginInit, eslintRule);

export default plugin;
