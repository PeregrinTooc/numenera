import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

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
        HTMLButtonElement: "readonly",
        HTMLImageElement: "readonly",
        HTMLSelectElement: "readonly",
        HTMLTextAreaElement: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        window: "readonly",
        URLSearchParams: "readonly",
        File: "readonly",
        Event: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        DragEvent: "readonly",
        CustomEvent: "readonly",
        FileReader: "readonly",
        Blob: "readonly",
        URL: "readonly",
        EventListener: "readonly",
        alert: "readonly",
        // File System Access API
        FileSystemFileHandle: "readonly",
        FileSystemWritableFileStream: "readonly",
        // IndexedDB
        IDBDatabase: "readonly",
        IDBOpenDBRequest: "readonly",
        indexedDB: "readonly",
        Storage: "readonly",
        // Standard browser APIs
        DOMException: "readonly",
        PermissionState: "readonly",
        MediaQueryList: "readonly",
        // Crypto and encoding
        crypto: "readonly",
        TextEncoder: "readonly",
        Uint8Array: "readonly",
        // Node globals
        process: "readonly",
        global: "readonly",
        Buffer: "readonly",
        // Vitest globals
        globalThis: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        vi: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
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
  {
    files: ["tests/e2e/**/*.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },
  {
    files: ["tests/e2e/step-definitions/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "NewExpression[callee.name=/DOMHelpers|TestStorageHelper/]",
          message:
            "Use this.dom / this.storageHelper from CustomWorld instead of instantiating a new helper — see docs/rules/testing.md, E2E World DSL.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../step-definitions/*", "./*.steps"],
              message:
                "Step files must not import from each other. Move shared logic into tests/e2e/support/.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["tests/unit/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration[id.name=/create(Mock|Base)Character|makeCharacter/]",
          message:
            "Use createTestCharacter (or a preset) from tests/factories/character.ts instead of a local character factory.",
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      "coverage",
      "*.config.js",
      "scripts",
      "stryker-tmp",
      ".claude",
    ],
  },
];
