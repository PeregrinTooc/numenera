import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import i18next from "eslint-plugin-i18next";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        // Browser globals
        console: "readonly",
        document: "readonly",
        localStorage: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        setTimeout: "readonly",
        window: "readonly",
        URLSearchParams: "readonly",
        // Node globals
        process: "readonly",
        global: "readonly",
        // Vitest globals
        globalThis: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      i18next,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  // i18n rules - ONLY for src/components (user-facing code)
  // Note: Disabled for now - eslint-plugin-i18next is too aggressive with lit-html templates
  // We rely on code review and manual checking instead
  // {
  //   files: ["src/components/**/*.ts", "src/components/**/*.tsx"],
  //   rules: {
  //     "i18next/no-literal-string": [
  //       "warn", // Changed to warn instead of error
  //       {
  //         mode: "all",
  //         "should-validate-template": true,
  //         ignore: [
  //           "^[0-9]+$", // Allow numbers
  //           "^[a-z-]+$", // Allow kebab-case (CSS classes, testids)
  //           "<!--.*-->", // Allow HTML comments
  //         ],
  //         ignoreAttribute: ["data-testid", "class", "className", "type", "role", "aria-label"],
  //         ignoreCallee: ["html"], // Ignore lit-html templates
  //       },
  //     ],
  //   },
  // },
  {
    ignores: ["node_modules", "dist", "build", "coverage", "*.config.js"],
  },
];
