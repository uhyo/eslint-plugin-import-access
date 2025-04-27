// for eslint-plugin-local-rules
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  module.exports = require("./dist/index.js").default.rules;
  // eslint-disable-next-line no-empty
} catch (e) {
  console.warn(e);
}
