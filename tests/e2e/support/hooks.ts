import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { chromium, Browser } from "@playwright/test";
import { CustomWorld } from "./world";
import { spawn, ChildProcess } from "child_process";
import { setTimeout, clearTimeout } from "timers";

let browser: Browser;
let devServer: ChildProcess;

BeforeAll({ timeout: 60000 }, async function () {
  // Determine if we're running production tests
  const isProduction = process.env.TEST_PROD === "true";

  if (isProduction) {
    console.log("Building for production...");

    // Start Vite build for production
    devServer = spawn("npm", ["run", "build"], {
      stdio: "pipe",
      shell: true,
    });

    // Wait for build to complete
    let resolved = false;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!resolved) {
          reject(new Error("Build failed to complete within 25 seconds"));
        }
      }, 25000);

      const checkAndResolve = (output: string) => {
        console.log("Build output:", output);
        if (!resolved && (output.includes("built in") || output.includes("dist/"))) {
          resolved = true;
          clearTimeout(timeout);
          console.log("Build complete!");
          resolve();
        }
      };

      devServer.stdout?.on("data", (data) => {
        checkAndResolve(data.toString());
      });

      devServer.stderr?.on("data", (data) => {
        const output = data.toString();
        console.error("Build stderr:", output);
        checkAndResolve(output);
      });

      devServer.on("close", (code) => {
        if (!resolved && code === 0) {
          resolved = true;
          clearTimeout(timeout);
          resolve();
        }
      });
    });

    console.log("Starting preview server...");

    // Start preview server
    devServer = spawn("npm", ["run", "preview", "--", "--port", "4173"], {
      stdio: "pipe",
      shell: true,
    });

    // Wait for preview server to be ready
    resolved = false;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!resolved) {
          reject(new Error("Preview server failed to start within 10 seconds"));
        }
      }, 10000);

      const checkAndResolve = (output: string) => {
        console.log("Preview server output:", output);
        if (!resolved && (output.includes("Local:") || output.includes("4173"))) {
          resolved = true;
          clearTimeout(timeout);
          console.log("Preview server is ready!");
          resolve();
        }
      };

      devServer.stdout?.on("data", (data) => {
        checkAndResolve(data.toString());
      });

      devServer.stderr?.on("data", (data) => {
        const output = data.toString();
        console.error("Preview server stderr:", output);
        checkAndResolve(output);
      });
    });
  } else {
    console.log("Starting Vite dev server...");

    // Start Vite dev server
    devServer = spawn("npm", ["run", "dev"], {
      stdio: "pipe",
      shell: true,
    });

    // Wait for server to be ready with timeout fallback
    let resolved = false;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!resolved) {
          reject(new Error("Dev server failed to start within 55 seconds"));
        }
      }, 55000);

      const checkAndResolve = (output: string) => {
        console.log("Dev server output:", output);
        if (!resolved && output.includes("Local:")) {
          resolved = true;
          clearTimeout(timeout);
          console.log("Dev server is ready!");
          resolve();
        }
      };

      devServer.stdout?.on("data", (data) => {
        checkAndResolve(data.toString());
      });

      devServer.stderr?.on("data", (data) => {
        const output = data.toString();
        console.error("Dev server stderr:", output);
        // Sometimes Vite outputs to stderr, check there too
        checkAndResolve(output);
      });

      devServer.on("error", (error) => {
        console.error("Dev server spawn error:", error);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          reject(error);
        }
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
