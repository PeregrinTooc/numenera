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
        window: "readonly",
        URLSearchParams: "readonly",
        File: "readonly",
        Event: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
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
        // Standard browser APIs
        DOMException: "readonly",
        PermissionState: "readonly",
        // Crypto and encoding
        crypto: "readonly",
        TextEncoder: "readonly",
        Uint8Array: "readonly",
        // Node globals
        process: "readonly",
        global: "readonly",
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
    ignores: ["node_modules", "dist", "build", "coverage", "*.config.js", "scripts", "stryker-tmp"],
  },
];
