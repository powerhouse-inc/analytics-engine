// @ts-check
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import { globalIgnores } from "eslint/config";
export default defineConfig([
  globalIgnores(["**/node_modules", "**/dist", "**/build"]),
  {
    files: ["**/*.{cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "no-case-declarations": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-useless-assignment": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
    },
  },
  prettierPlugin,
]);
