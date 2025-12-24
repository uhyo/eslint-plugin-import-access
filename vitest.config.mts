import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/__tests__/fixtures/**"],
    setupFiles: ["./src/__tests__/fixtures/setup.ts"],
    globals: true,
    snapshotFormat: {
      escapeString: true,
      printBasicPrototype: true,
    },
    testTimeout: 30000,
    // Run each test file in a separate process to avoid caching issues
    // that can occur with typescript-eslint's project service across
    // different TypeScript version combinations
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: false,
        isolate: true,
      },
    },
    // Disable file parallelism to ensure tests run sequentially
    fileParallelism: false,
  },
});
