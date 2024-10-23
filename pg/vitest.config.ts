import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 5000,
    server: {
      deps: {
        inline: [
          "@powerhousedao/analytics-engine-core",
          "@powerhousedao/analytics-engine-knex",
        ],
      },
    },
    setupFiles: "./test/vitest.setup.ts",
    passWithNoTests: true,
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
});
