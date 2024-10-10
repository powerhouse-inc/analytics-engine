import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 5000,
    server: {
      deps: {
        inline: [
          "document-analytics-core",
          "document-analytics-knex",
          "document-analytics-pg",
          "document-analytics-memory",
        ],
      },
    },
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
