import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { chromium, Browser } from "@playwright/test";
import { CustomWorld } from "./world";
import { spawn, ChildProcess } from "child_process";
import { setTimeout, clearTimeout } from "timers";

let browser: Browser;
let devServer: ChildProcess;

BeforeAll({ timeout: 60000 }, async function () {
  console.log("Starting Vite dev server...");

  // Start Vite dev server
  devServer = spawn("npm", ["run", "dev"], {
    stdio: "pipe",
    shell: true,
  });

  // Wait for server to be ready with timeout fallback
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Dev server failed to start within 55 seconds"));
    }, 55000);

    devServer.stdout?.on("data", (data) => {
      const output = data.toString();
      console.log("Dev server stdout:", output);
      if (output.includes("Local:")) {
        console.log("Dev server is ready!");
        clearTimeout(timeout);
        resolve();
      }
    });

    devServer.stderr?.on("data", (data) => {
      console.error("Dev server stderr:", data.toString());
    });

    devServer.on("error", (error) => {
      console.error("Dev server spawn error:", error);
      clearTimeout(timeout);
      reject(error);
    });
  });

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
  await this.page.goto("http://localhost:3000");
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
