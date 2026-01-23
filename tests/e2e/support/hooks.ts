import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { chromium, Browser } from "@playwright/test";
import { CustomWorld } from "./world";
import { spawn, ChildProcess } from "child_process";
import { setTimeout, clearTimeout } from "timers";

let browser: Browser;
let devServer: ChildProcess;

BeforeAll({ timeout: 30000 }, async function () {
  // Determine if we're running production tests
  const isProduction = process.env.TEST_PROD === "true";

  if (isProduction) {
    // Start Vite preview server for production build
    devServer = spawn("npm", ["run", "build"], {
      stdio: "pipe",
      shell: true,
    });

    // Wait for build to complete
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Build failed to complete within 25 seconds"));
      }, 25000);

      devServer.stdout?.on("data", (data) => {
        const output = data.toString();
        if (output.includes("built in") || output.includes("dist/")) {
          clearTimeout(timeout);
          resolve();
        }
      });

      devServer.stderr?.on("data", (data) => {
        console.error("Build error:", data.toString());
      });

      devServer.on("close", (code) => {
        if (code === 0) {
          clearTimeout(timeout);
          resolve();
        }
      });
    });

    // Start preview server
    devServer = spawn("npm", ["run", "preview", "--", "--port", "4173"], {
      stdio: "pipe",
      shell: true,
    });

    // Wait for preview server to be ready
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Preview server failed to start within 10 seconds"));
      }, 10000);

      devServer.stdout?.on("data", (data) => {
        const output = data.toString();
        if (output.includes("Local:") || output.includes("4173")) {
          clearTimeout(timeout);
          resolve();
        }
      });

      devServer.stderr?.on("data", (data) => {
        console.error("Preview server error:", data.toString());
      });
    });
  } else {
    // Start Vite dev server
    devServer = spawn("npm", ["run", "dev"], {
      stdio: "pipe",
      shell: true,
    });

    // Wait for server to be ready with timeout fallback
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Dev server failed to start within 25 seconds"));
      }, 25000);

      devServer.stdout?.on("data", (data) => {
        if (data.toString().includes("Local:")) {
          clearTimeout(timeout);
          resolve();
        }
      });

      devServer.stderr?.on("data", (data) => {
        console.error("Dev server error:", data.toString());
      });
    });
  }

  // Give server a moment to fully initialize
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Launching browser...");
  browser = await chromium.launch();
  console.log("Browser launched successfully");
});

Before(async function (this: CustomWorld) {
  this.context = await browser.newContext();
  this.page = await this.context.newPage();

  // Clear localStorage before each test to ensure clean state
  const baseURL =
    process.env.TEST_PROD === "true" ? "http://localhost:4173" : "http://localhost:3000";
  await this.page.goto(baseURL);
  await this.page.evaluate(() => localStorage.clear());
});

After(async function (this: CustomWorld) {
  await this.page?.close();
  await this.context?.close();
});

AfterAll(async function () {
  await browser?.close();
  devServer?.kill();
});
