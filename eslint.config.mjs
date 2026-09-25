// Flat ESLint config for the Vite build. The fleet's shared
// @gravixar-sv/core/eslint preset is built around eslint-config-next,
// which no longer applies here, so this is the same intent without Next:
// the recommended JS and TypeScript rules plus the React hooks rules.
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "dist-ssr/**", "node_modules/**", ".claude/**", "shots/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    // Scripts drive headless Chrome, so page.evaluate callbacks see
    // browser globals too.
    files: ["scripts/**/*.mjs", "shots/**/*.mjs", "*.config.*"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
);
