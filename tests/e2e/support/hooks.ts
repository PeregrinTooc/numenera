import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { chromium, Browser } from "@playwright/test";
import { CustomWorld } from "./world";
import { spawn, ChildProcess } from "child_process";

let browser: Browser;
let devServer: ChildProcess;

BeforeAll(async function () {
  // Start Vite dev server
  devServer = spawn("npm", ["run", "dev"], {
    stdio: "pipe",
    shell: true,
  });

  // Wait for server to be ready
  await new Promise<void>((resolve) => {
    devServer.stdout?.on("data", (data) => {
      if (data.toString().includes("Local:")) {
        resolve();
      }
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
