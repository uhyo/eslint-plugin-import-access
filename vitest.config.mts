import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/__tests__/fixtures/**"],
    globals: true,
    snapshotFormat: {
      escapeString: true,
      printBasicPrototype: true,
    },
    testTimeout: 10000,
  },
});
