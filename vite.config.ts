import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { portCapturePlugin } from "./vite-plugins/port-capture.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [portCapturePlugin()],
  base: "/numenera/",
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
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          i18n: ["i18next", "i18next-browser-languagedetector"],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
