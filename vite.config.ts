import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "url";
import en from "./src/i18n/locales/en.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// `npm run dev:lan`: other devices on the network reach the dev server over
// HTTPS, a secure origin as in production (plain HTTP at a network address
// hides crypto.subtle, which version history needs)
export default defineConfig(({ mode }) => ({
  plugins: [
    ...(mode === "lan" ? [basicSsl()] : []),
    VitePWA({
      manifest: {
        name: en.app.title,
        short_name: "Numenera",
        lang: "en",
        display: "standalone",
        theme_color: "#1a5490",
        background_color: "#f5e6d3",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
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
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: "i18n", test: /node_modules[\\/]i18next/ }],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
}));
