import { defineConfig } from "vitest/config";

export default defineConfig({
  assetsInclude: ["*.sql"],
  test: {
    browser: {
      provider: "playwright",
      enabled: true,
      name: "firefox",
    },
    testTimeout: 5000,
    server: {
      deps: {
        inline: [
          "@powerhousedao/analytics-engine-core",
          "@powerhousedao/analytics-engine-knex",
          "events",
        ],
      },
    },
    setupFiles: "./test/vitest.setup.ts",
    passWithNoTests: true,
  },
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
  define: {
    "process.env": {},
  },
});
