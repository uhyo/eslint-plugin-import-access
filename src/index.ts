import jsdoc from "./rules/jsdoc";
import { tsServerPluginInit } from "./ts-server-plugin";

const eslintRule = {
  rules: {
    jsdoc: jsdoc as unknown,
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

export = plugin;
