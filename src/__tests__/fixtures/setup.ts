import * as parser from "@typescript-eslint/parser";
import { afterEach, beforeEach } from "vitest";

// Clear caches before and after each test to ensure complete isolation
beforeEach(() => {
  parser.clearCaches();
});

afterEach(() => {
  parser.clearCaches();
});
