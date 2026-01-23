import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { chromium, Browser } from "@playwright/test";
import { CustomWorld } from "./world";
import { spawn, ChildProcess } from "child_process";
import { setTimeout, clearTimeout } from "timers";

let browser: Browser;
let devServer: ChildProcess;

BeforeAll(async function () {
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

  // Give server a moment to fully initialize
  await new Promise((resolve) => setTimeout(resolve, 1000));

  browser = await chromium.launch();
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
