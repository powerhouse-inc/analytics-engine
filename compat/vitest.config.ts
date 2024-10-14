import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 5000,
    server: {
      deps: {
        inline: [
          "@powerhouse/analytics-engine-core",
          "@powerhouse/analytics-engine-knex",
          "@powerhouse/analytics-engine-pg",
          "@powerhouse/analytics-engine-memory",
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
