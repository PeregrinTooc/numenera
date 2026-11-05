import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// `npm run dev:lan`: other devices on the network reach the dev server over
// HTTPS, a secure origin as in production (plain HTTP at a network address
// hides crypto.subtle, which version history needs)
export default defineConfig(({ mode }) => ({
  plugins: mode === "lan" ? [basicSsl()] : [],
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
    open: false,
  },
}));
