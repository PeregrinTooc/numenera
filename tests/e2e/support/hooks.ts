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
    // Optional escape hatch for environments where Playwright's pinned
    // browser download isn't reachable. Unset by default (undefined), so
    // normal local/CI runs are unaffected and use Playwright's own browser.
    executablePath: process.env.PW_EXEC_PATH || undefined,
  });
});

Before(async function (this: CustomWorld) {
  // Create a new context and page for each test
  this.context = await browser.newContext({
    hasTouch: true,
  });
  this.page = await this.context.newPage();

  // Capture console messages for debugging
  this.page.on("console", (msg) => {
    const text = msg.text();
    // Only log messages related to version history or squashing or debug
    if (
      text.includes("[VersionHistoryService]") ||
      text.includes("[performSquash]") ||
      text.includes("[save-completed]") ||
      text.includes("[UNDO]") ||
      text.includes("[renderCharacterSheet]") ||
      text.includes("[character-updated]") ||
      text.includes("[Abilities.render]") ||
      text.includes("[collection-updated]")
    ) {
      console.log(`[Browser Console] ${text}`);
    }
  });

  // Inject test configuration and TestTimer BEFORE navigation
  // Set squash delay to 1000ms for faster tests
  await this.page.addInitScript(() => {
    // Import and create TestTimer
    class TestTimer {
      private timers = new Map<number, () => void>();
      private nextHandle = 1;

      setTimeout(callback: () => void, _delay: number): number {
        const handle = this.nextHandle++;
        this.timers.set(handle, callback);

        // Emit event for test observability
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("test-timer-scheduled", {
              detail: { handle },
            })
          );
        }

        return handle;
      }

      clearTimeout(handle: number): void {
        this.timers.delete(handle);
      }

      trigger(handle: number): void {
        const callback = this.timers.get(handle);
        if (callback) {
          this.timers.delete(handle);
          callback();
        }
      }

      triggerAll(): void {
        const callbacks = Array.from(this.timers.values());
        this.timers.clear();
        callbacks.forEach((cb) => cb());
      }

      getPendingCount(): number {
        return this.timers.size;
      }

      clearAll(): void {
        this.timers.clear();
      }
    }

    // Create and expose test timer
    (window as any).__testTimer = new TestTimer();

    // Set squash delay for tests (1000ms instead of production 5000ms)
    (window as any).__SQUASH_DELAY_MS__ = 1000;
  });

  // Navigate to the server and clear both localStorage and IndexedDB for clean state.
  //
  // This clears through the app's own test APIs (window.__testStorage /
  // window.__testVersionHistory) rather than indexedDB.deleteDatabase(),
  // because the page we just navigated to has already booted the app and
  // opened its own connections to these exact databases. A delete request
  // against a database the same page holds open fires "blocked" instead of
  // succeeding, and previously that was masked only because the delete
  // targeted the wrong database name ("NumeneraCharacterDB", which nothing
  // ever opens) and so never actually blocked. Clearing through the already-
  // open connections avoids the blocked-delete problem entirely.
  await this.page.goto(BASE_URL);
  await this.page.evaluate(async () => {
    localStorage.clear();
    await window.__testStorage?.clearCharacterState();
    await window.__testVersionHistory?.clearVersions();
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
