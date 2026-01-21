import { defineConfig, devices } from "@playwright/test";

// Determine if we should use production build
const useProductionBuild = process.env.CI || process.env.TEST_PROD;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: useProductionBuild ? "http://localhost:4173" : "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
    {
      name: "Tablet",
      use: { ...devices["iPad Pro"] },
    },
  ],
  webServer: {
    command: useProductionBuild
      ? "npm run build && npm run preview -- --port 4173"
      : "npm run dev -- --port 3000",
    url: useProductionBuild ? "http://localhost:4173" : "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // Longer timeout for production builds
  },
});
