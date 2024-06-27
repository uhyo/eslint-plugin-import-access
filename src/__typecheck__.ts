import { config } from "typescript-eslint";
import importAccess from "./flat-config.cjs";

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
