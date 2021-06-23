import jsdoc from "./rules/jsdoc";

export = {
  rules: {
    jsdoc
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
