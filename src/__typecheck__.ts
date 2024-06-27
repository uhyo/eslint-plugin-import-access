import { config } from "typescript-eslint";
import importAccess from "./flat-config.cjs";

// File to ensure that types are compatible with
// typescript-eslint.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ = config(
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
);
