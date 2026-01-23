import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { chromium, Browser } from "@playwright/test";
import { CustomWorld } from "./world";
import { spawn, exec, ChildProcess } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

let browser: Browser;
let devServer: ChildProcess | null = null;

BeforeAll({ timeout: 60000 }, async function () {
  // Determine if we're running production tests
  const isProduction = process.env.TEST_PROD === "true";

  if (isProduction) {
    // Start preview server
    devServer = spawn("npm", ["run", "preview", "--", "--port", "4173"], {
      stdio: "pipe",
      detached: false,
    });

    // Log output for debugging
    devServer.stdout?.on("data", (data) => {
      // eslint-disable-next-line no-console
      console.log("Preview server output:", data.toString());
    });

    devServer.stderr?.on("data", (data) => {
      console.error("Preview server stderr:", data.toString());
    });

    // Poll the server until it's ready
    const maxAttempts = 30; // 30 attempts * 1 second = 30 seconds max
    let attempts = 0;
    let serverReady = false;

    while (attempts < maxAttempts && !serverReady) {
      attempts++;
      try {
        // Try to fetch from the server
        // eslint-disable-next-line no-undef
        const response = await fetch("http://localhost:4173/numenera/");
        if (response.ok) {
          serverReady = true;
          // eslint-disable-next-line no-console
          console.log(`Preview server is ready after ${attempts} attempts!`);
          break;
        }
      } catch {
        // Server not ready yet, wait and try again
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!serverReady) {
      throw new Error(`Preview server failed to start after ${maxAttempts} seconds`);
    }
  } else {
    // Start Vite dev server
    devServer = spawn("npm", ["run", "dev"], {
      stdio: "pipe",
      detached: false,
    });

    // Log output for debugging
    devServer.stdout?.on("data", (data) => {
      // eslint-disable-next-line no-console
      console.log("Dev server output:", data.toString());
    });

    devServer.stderr?.on("data", (data) => {
      console.error("Dev server stderr:", data.toString());
    });

    // Poll the server until it's ready
    const maxAttempts = 60; // 60 attempts * 1 second = 60 seconds max
    let attempts = 0;
    let serverReady = false;

    while (attempts < maxAttempts && !serverReady) {
      attempts++;
      try {
        // Try to fetch from the server
        // eslint-disable-next-line no-undef
        const response = await fetch("http://localhost:3000/numenera/");
        if (response.ok) {
          serverReady = true;
          // eslint-disable-next-line no-console
          console.log(`Dev server is ready after ${attempts} attempts!`);
          break;
        }
      } catch {
        // Server not ready yet, wait and try again
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!serverReady) {
      throw new Error(`Dev server failed to start after ${maxAttempts} seconds`);
    }
  }

  browser = await chromium.launch();
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

  // Kill the dev/preview server using pkill to ensure all vite processes are terminated
  try {
    // First try to kill the spawned process
    if (devServer) {
      devServer.kill("SIGTERM");
    }

    // Give it a moment
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Use pkill to ensure all vite processes are killed (same as npm run kill)
    // This is more reliable across platforms than process group killing
    await execAsync("pkill -9 -f vite || true");

    // eslint-disable-next-line no-console
    console.log("Server processes terminated successfully");
  } catch (error) {
    // Process might already be dead or pkill not available
    // eslint-disable-next-line no-console
    console.log("Server cleanup completed: " + error);
  }
});
