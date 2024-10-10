import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 5000,
    server: {
      deps: {
        inline: ["document-analytics-core"],
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
});
