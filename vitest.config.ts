import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/unit/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "*.config.ts", "*.config.js"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/storage": path.resolve(__dirname, "./src/storage"),
      "@/i18n": path.resolve(__dirname, "./src/i18n"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
    },
  },
});
