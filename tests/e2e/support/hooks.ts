import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { chromium, Browser } from "@playwright/test";
import { CustomWorld } from "./world";
import { spawn, ChildProcess } from "child_process";
import { waitForPort, clearPort, incrementWorkerCount, decrementWorkerCount } from "./port-manager.js";

let browser: Browser;
let devServer: ChildProcess | null = null;
export let serverPort: number;

BeforeAll({ timeout: 60000 }, async function () {
  // Register this worker
  const workerCount = incrementWorkerCount();
  const isFirstWorker = workerCount === 1;

  if (isFirstWorker) {
    // Clear any stale port file (first worker only)
    clearPort();

    // Determine if we're running production tests
    const isProduction = process.env.TEST_PROD === "true";

    if (isProduction) {
      // Start preview server WITHOUT hardcoded port, let Vite choose
      // Enable PORT_CAPTURE so the plugin writes the actual port
      devServer = spawn("npm", ["run", "preview"], {
        stdio: "pipe",
        detached: true,
        env: { ...process.env, PORT_CAPTURE: "true" },
      });

      // Log output for debugging
      devServer.stdout?.on("data", (data) => {
        // eslint-disable-next-line no-console
        console.log("Preview server output:", data.toString());
      });

      devServer.stderr?.on("data", (data) => {
        console.error("Preview server stderr:", data.toString());
      });
    } else {
      // Start Vite dev server WITHOUT hardcoded port, let Vite choose
      // Enable PORT_CAPTURE so the plugin writes the actual port
      devServer = spawn("npm", ["run", "dev"], {
        stdio: "pipe",
        detached: true,
        env: { ...process.env, PORT_CAPTURE: "true" },
      });

      // Log output for debugging
      devServer.stdout?.on("data", (data) => {
        // eslint-disable-next-line no-console
        console.log("Dev server output:", data.toString());
      });

      devServer.stderr?.on("data", (data) => {
        console.error("Dev server stderr:", data.toString());
      });
    }
  }

  // All workers wait for the port file (first worker creates it, others wait)
  serverPort = await waitForPort();
  // eslint-disable-next-line no-console
  console.log(`Server is ready on port ${serverPort}!`);

  browser = await chromium.launch();
});

Before(async function (this: CustomWorld) {
  // Enable touch support for mobile tests
  this.context = await browser.newContext({
    hasTouch: true,
  });
  this.page = await this.context.newPage();

  // Clear localStorage before each test to ensure clean state
  const baseURL = `http://localhost:${serverPort}`;
  await this.page.goto(baseURL);
  await this.page.evaluate(() => localStorage.clear());
});

After(async function (this: CustomWorld) {
  await this.page?.close();
  await this.context?.close();
});

AfterAll(async function () {
  await browser?.close();

  // Unregister this worker
  const remainingWorkers = decrementWorkerCount();

  // Only shut down the server when ALL workers are done
  if (remainingWorkers === 0 && devServer && devServer.pid) {
    // Clear the port file
    clearPort();

    // Kill the dev/preview server and all its child processes
    try {
      // When detached:true, we need to kill the process group
      // The negative PID tells the system to kill the entire process group
      process.kill(-devServer.pid, "SIGTERM");

      // Give it a moment to terminate gracefully
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Force kill the process group if still running
      try {
        process.kill(-devServer.pid, "SIGKILL");
      } catch {
        // Already dead, ignore
      }

      // eslint-disable-next-line no-console
      console.log("Server processes terminated successfully");
    } catch (error) {
      // Process might already be dead
      // eslint-disable-next-line no-console
      console.log("Server cleanup completed: " + error);
    }
  }
});