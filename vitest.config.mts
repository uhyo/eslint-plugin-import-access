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
    testTimeout: 30000,
    // Run tests sequentially and isolated to avoid projectService caching issues
    fileParallelism: false,
    isolate: true,
    pool: "forks",
    poolOptions: {
      forks: {
        isolate: true,
      },
    },
  },
});
