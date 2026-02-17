import { defineConfig } from "vitest/config";
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  assetsInclude: ["*.sql"],
  test: {
    browser: {
      provider: playwright(),
      enabled: true,
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
