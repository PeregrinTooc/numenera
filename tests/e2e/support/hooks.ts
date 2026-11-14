import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { chromium, webkit, devices, Browser } from "@playwright/test";
import { CustomWorld } from "./world";
import { resolveDevice } from "./device.js";
import { TestStorageHelper } from "./testStorageHelper.js";
import { DOMHelpers } from "./dom-helpers.js";
import { SetupDsl } from "./setup.js";
import { CharacterDsl } from "./character.js";
import { PlaywrightSheetDriver } from "./sheetDriver.js";
import { CardEditorDsl } from "./cardEditor.js";
import { PlaywrightCardEditorDriver } from "./cardEditorDriver.js";
import { ValueEditorDsl } from "./valueEditor.js";
import { PlaywrightValueEditorDriver } from "./valueEditorDriver.js";
import { AdditionalFieldsDsl } from "./additionalFields.js";
import { PlaywrightInlineFieldsDriver } from "./inlineFieldsDriver.js";
import { LayoutDsl } from "./layout.js";
import { MouseInput, TouchInput } from "./sectionInput.js";
import { ScreenDsl } from "./screen.js";
import { PlaywrightViewportDriver } from "./viewportDriver.js";
import { VersionHistoryDsl } from "./versionHistory.js";
import { waitForInitialVersionSaved } from "./app-ready.js";
import { PlaywrightVersionHistoryDriver } from "./versionHistoryDriver.js";
import { BASE_URL } from "./serverUrl.js";

let browser: Browser;

const DEVICE = resolveDevice(process.env.DEVICE);
const ENGINES = { chromium, webkit } as const;

BeforeAll({ timeout: 60000 }, async function () {
  browser = await ENGINES[DEVICE.engine].launch({
    headless: !process.env.HEADED,
    // Optional escape hatch for environments where Playwright's pinned
    // browser download isn't reachable. Unset by default (undefined), so
    // normal local/CI runs are unaffected and use Playwright's own browser.
    // PW_EXEC_PATH points at a Chromium binary; never hand it to WebKit.
    executablePath:
      DEVICE.engine === "chromium" ? process.env.PW_EXEC_PATH || undefined : undefined,
  });
});

Before(async function (this: CustomWorld, { pickle }) {
  // Locale is pinned to en-US: i18next's LanguageDetector falls back to
  // navigator.language, which otherwise inherits the host OS locale. Step
  // definitions assert on hardcoded English strings, so an unpinned locale
  // makes every scenario fail deterministically on a non-English machine
  // (doesn't show up in CI, which already runs en-US).
  const descriptor = devices[DEVICE.descriptor];
  if (!descriptor) throw new Error(`Playwright has no device "${DEVICE.descriptor}"`);
  this.context = await browser.newContext({
    ...descriptor,
    // The desktop profile needs touch for tap() and the Chromium touch-gesture scenarios.
    hasTouch: true,
    locale: "en-US",
  });
  this.page = await this.context.newPage();
  this.dom = new DOMHelpers(this.page);
  this.setup = new SetupDsl(this);
  const valueEditor = new PlaywrightValueEditorDriver(this.page);
  this.character = new CharacterDsl(new PlaywrightSheetDriver(this.page), this.setup, valueEditor);
  this.valueEditor = new ValueEditorDsl(valueEditor);
  this.additionalFields = new AdditionalFieldsDsl(new PlaywrightInlineFieldsDriver(this.page));
  this.cardEditor = new CardEditorDsl(new PlaywrightCardEditorDriver(this.page));
  const viewport = new PlaywrightViewportDriver(this.page);
  this.screen = new ScreenDsl(viewport);
  this.layout = new LayoutDsl(
    DEVICE.sectionInput === "touch"
      ? new TouchInput(this.page, viewport)
      : new MouseInput(this.page, viewport)
  );

  // Initialize storage helper before navigation, so the Before hook's own
  // storage clearing goes through the same adapter-backed helper every step
  // uses, instead of a one-off inline page.evaluate.
  this.storageHelper = new TestStorageHelper(this.page);
  this.history = new VersionHistoryDsl(
    new PlaywrightVersionHistoryDriver(this.page, this.storageHelper),
    this.setup,
    this.character
  );

  this.page.on("console", (msg) => {
    const text = msg.text();
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

  // tsx transpiles step definitions with esbuild's `keepNames`, which wraps
  // every named function/class in a `__name(fn, "fn")` helper. Playwright
  // serialises callbacks passed to page.evaluate/addInitScript and runs them
  // in the browser, where that helper does not exist. Define it as an
  // identity function before anything else runs. Passed as a string so the
  // shim itself is never transformed.
  await this.page.addInitScript("globalThis.__name = (fn) => fn;");

  // Scenarios tagged @fake-clock drive the app's real timers and Date with page.clock;
  // it only fakes timers created after install, so it must precede navigation.
  if (pickle.tags.some((tag) => tag.name === "@fake-clock")) {
    await this.page.clock.install();
  }

  // Inject test configuration and TestTimer BEFORE navigation
  await this.page.addInitScript(() => {
    class TestTimer {
      private timers = new Map<number, () => void>();
      private nextHandle = 1;

      setTimeout(callback: () => void, _delay: number): number {
        const handle = this.nextHandle++;
        this.timers.set(handle, callback);

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

    // Structurally the same API as the app's TestTimer; this class has to be
    // self-contained because evaluate() serialises it into the page.
    window.__testTimer = new TestTimer() as unknown as typeof window.__testTimer;

    window.__SQUASH_DELAY_MS__ = 1000;
  });

  // Clears through the app's own test APIs (window.__testStorage /
  // window.__testVersionHistory) rather than indexedDB.deleteDatabase(),
  // because the page we just navigated to has already booted the app and
  // opened its own connections to these exact databases. A delete request
  // against a database the same page holds open fires "blocked" instead of
  // succeeding; clearing through the already-open connections avoids that.
  //
  // On a fresh store the app saves its initial version after a wall-clock
  // delay. Clearing before that save lands lets it arrive afterwards as a stale
  // version, which the next boot then reconciles into an extra one.
  await this.page.goto(BASE_URL);
  await waitForInitialVersionSaved(this.page);
  await this.storageHelper.clearStorage();
  await this.storageHelper.clearVersions();

  await this.page.waitForLoadState("networkidle");
});

After(async function (this: CustomWorld) {
  await this.page?.close();
  await this.context?.close();
});

AfterAll(async function () {
  await browser?.close();
});
