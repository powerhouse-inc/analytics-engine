import { defineConfig } from "vitest/config";

export default defineConfig({
  assetsInclude: ["node_modules/wa-sqlite/dist/*.wasm", "*.sql"],
  test: {
    browser: {
      provider: "playwright",
      enabled: true,
      name: "firefox",
    },
    testTimeout: 5000,
    server: {
      deps: {
        inline: ["@powerhouse/analytics-engine-core", "events"],
      },
    },
    setupFiles: "./test/vitest.setup.ts",
    passWithNoTests: true,
  },
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
});
