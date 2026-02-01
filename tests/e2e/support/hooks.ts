import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { chromium, Browser } from "@playwright/test";
import { CustomWorld } from "./world";
import { TestStorageHelper } from "./testStorageHelper.js";

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

  // Navigate to the server and clear both localStorage and IndexedDB for clean state
  await this.page.goto(BASE_URL);
  await this.page.evaluate(async () => {
    localStorage.clear();

    // Clear IndexedDB with retry logic
    const dbName = "NumeneraCharacterDB";
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        // First, try to close any open connections
        const openRequest = indexedDB.open(dbName);
        await new Promise<void>((resolve) => {
          openRequest.onsuccess = () => {
            openRequest.result.close();
            resolve();
          };
          openRequest.onerror = () => resolve();
        });

        // Then delete the database
        const deleted = await new Promise<boolean>((resolve) => {
          const request = indexedDB.deleteDatabase(dbName);
          request.onsuccess = () => resolve(true);
          request.onerror = () => resolve(false);
          request.onblocked = () => {
            console.warn(`IndexedDB deletion blocked (attempt ${attempts + 1}/${maxAttempts})`);
            // Wait a bit and try again
            setTimeout(() => resolve(false), 100);
          };
        });

        if (deleted) {
          break;
        }

        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error clearing IndexedDB (attempt ${attempts + 1}/${maxAttempts}):`, error);
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    }
  });

  // Wait for the page to be fully loaded after clearing storage
  await this.page.waitForLoadState("networkidle");

  // Initialize storage helper
  this.storageHelper = new TestStorageHelper(this.page);
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
