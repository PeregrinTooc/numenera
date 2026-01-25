import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { chromium, Browser } from "@playwright/test";
import { CustomWorld } from "./world";

let browser: Browser;

// Server is managed by concurrently + wait-on in package.json scripts
// We just need to know which port to connect to
const SERVER_PORT = process.env.TEST_PROD === "true" ? 4173 : 3000;
const BASE_URL = `http://localhost:${SERVER_PORT}`;

BeforeAll({ timeout: 60000 }, async function () {
  // Server is already running (started by concurrently, verified by wait-on)
  // Just launch the browser
  browser = await chromium.launch({
    headless: !process.env.HEADED,
  });
});

Before(async function (this: CustomWorld) {
  // Create a new context and page for each test
  this.context = await browser.newContext({
    hasTouch: true,
  });
  this.page = await this.context.newPage();

  // Navigate to the server and clear localStorage for clean state
  await this.page.goto(BASE_URL);
  await this.page.evaluate(() => localStorage.clear());
});

After(async function (this: CustomWorld) {
  // Clean up page and context after each test
  await this.page?.close();
  await this.context?.close();
});

AfterAll(async function () {
  // Close the browser
  await browser?.close();
  // No server cleanup needed - Playwright handles it automatically!
});
