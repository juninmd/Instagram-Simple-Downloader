import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions
      },
      sourceType: "script"
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": "error",
      "no-console": "off",
      "no-undef": "error"
    }
  },
  {
    ignores: ["playwright.config.js", "tests/**", "web-ext-artifacts/**", "eslint.config.mjs"]
  }
];
