import { expect, type Page } from "@playwright/test";
import type { Character } from "@/types/character";
import { waitForCharacterSheetReady, waitForInitialVersionSaved } from "./app-ready.js";
import { installExportCapture, waitForExportCapture } from "./exportCapture.js";
import { englishText } from "./i18nKeys.js";
import type { TestStorageHelper } from "./testStorageHelper.js";
import {
  clickAndAwaitNavigation,
  forceSquash,
  readVersionPosition,
} from "./versionHistoryHelpers.js";
import type { ExportedCharacterFile } from "./world.js";

/** A version to store: what changed, and the description the history records for it. */
export interface VersionSeed {
  description: string;
  changes: Partial<Character>;
}

/** What leaving the app with the current view produced. */
export interface ExportedView {
  expectCharacterNamed(name: string): void;
  expectNoVersionHistory(): void;
  expectPortrait(portrait: string): void;
}

declare global {
  interface Window {
    __releaseVersionSave?: () => void;
    __heldSquash?: Promise<void>;
  }
}

// The service keeps its VersionHistoryManager private; the race needs a save
// that stays pending, so the driver reaches in and gates saveVersion.
interface GatedManager {
  saveVersion: (...args: unknown[]) => Promise<unknown>;
}

/** The version navigator, its warning banner, and the stored history behind them. */
export interface VersionHistoryDriver {
  storeVersions(seeds: VersionSeed[]): Promise<void>;
  settleEdits(): Promise<void>;
  holdVersionSaves(): Promise<void>;
  beginSavingVersion(): Promise<void>;
  releaseHeldVersionSave(): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
  redoWithShift(): Promise<void>;
  reopen(): Promise<void>;
  stepBack(): Promise<void>;
  stepForward(): Promise<void>;
  stepBackInQuickSuccession(times: number): Promise<void>;
  goToVersion(version: number): Promise<void>;
  restore(): Promise<void>;
  returnToLatest(): Promise<void>;
  exportWhatIsShown(): Promise<ExportedView>;
  expectNavigatorHidden(): Promise<void>;
  expectImportAvailable(available: boolean): Promise<void>;
  expectEditable(): Promise<void>;
  expectPosition(current: number, total: number): Promise<void>;
  expectCanStepBack(possible: boolean): Promise<void>;
  expectCanStepForward(possible: boolean): Promise<void>;
  expectOldVersionWarning(shown: boolean): Promise<void>;
  expectRestoreControl(): Promise<void>;
  expectDescriptionShown(): Promise<void>;
  expectDescriptionContains(text: string): Promise<void>;
  expectTimestampShown(): Promise<void>;
  expectTimestampRelative(): Promise<void>;
  expectOriginalVersionDropped(originalName: string): Promise<void>;
  expectPortraitShows(portrait: string): Promise<void>;
}

const BACK = "version-nav-backward";
const FORWARD = "version-nav-forward";
const RESTORE = "version-restore-button";
const LATEST = "version-return-button";

interface Chord {
  key: string;
  code: string;
  shiftKey: boolean;
}

const UNDO: Chord = { key: "z", code: "KeyZ", shiftKey: false };
const REDO: Chord = { key: "y", code: "KeyY", shiftKey: false };
// Browsers report the key as "Z" while Shift is held.
const REDO_WITH_SHIFT: Chord = { key: "Z", code: "KeyZ", shiftKey: true };

class CapturedExportedView implements ExportedView {
  constructor(private file: ExportedCharacterFile) {}

  expectCharacterNamed(name: string): void {
    expect(this.file.character.name).toBe(name);
  }

  expectNoVersionHistory(): void {
    expect(this.file.versionHistory).toBeUndefined();
  }

  expectPortrait(portrait: string): void {
    expect(this.file.character.portrait).toBe(portrait);
  }
}

export class PlaywrightVersionHistoryDriver implements VersionHistoryDriver {
  constructor(
    private page: Page,
    private storage: TestStorageHelper
  ) {}

  /**
   * Rewrites the whole history while the app is idle, then reloads so it boots
   * on a history whose latest version is the stored character. Writing versions
   * into a running app, or leaving a stale version from an earlier boot in
   * place, makes reconcileVersionHistory record an extra version at boot.
   */
  async storeVersions(seeds: VersionSeed[]): Promise<void> {
    await waitForInitialVersionSaved(this.page);
    const base = await this.storage.getCharacter();
    const [initial] = await this.storage.getAllVersions();
    await this.storage.clearVersions();
    await this.storage.createVersion(base, initial.description);
    for (const { description, changes } of seeds) {
      await this.storage.createVersion({ ...base, ...changes }, description);
    }
    await this.reopen();
    await this.expectPosition(seeds.length + 1, seeds.length + 1);
  }

  async settleEdits(): Promise<void> {
    await forceSquash(this.page);
  }

  async holdVersionSaves(): Promise<void> {
    await this.page.evaluate(() => {
      const service = window.__versionHistoryService as unknown as { manager: GatedManager };
      const manager = service.manager;
      const save = manager.saveVersion.bind(manager);
      const gate = new Promise<void>((resolve) => {
        window.__releaseVersionSave = resolve;
      });
      manager.saveVersion = async (...args: unknown[]) => {
        await gate;
        return save(...args);
      };
    });
  }

  async beginSavingVersion(): Promise<void> {
    await this.page.evaluate(() => {
      const service = window.__versionHistoryService;
      if (!service) {
        throw new Error("Version history service not available. Make sure the app has loaded.");
      }
      // Deliberately not awaited: the squash stays suspended on the held save.
      window.__heldSquash = service.forceSquash();
    });
  }

  async releaseHeldVersionSave(): Promise<void> {
    await this.page.evaluate(async () => {
      window.__releaseVersionSave?.();
      await window.__heldSquash;
    });
  }

  async undo(): Promise<void> {
    await this.pressWithControl(UNDO);
  }

  async redo(): Promise<void> {
    await this.pressWithControl(REDO);
  }

  async redoWithShift(): Promise<void> {
    await this.pressWithControl(REDO_WITH_SHIFT);
  }

  async reopen(): Promise<void> {
    await this.page.reload();
    await waitForCharacterSheetReady(this.page);
  }

  async stepBack(): Promise<void> {
    await clickAndAwaitNavigation(this.page, BACK);
  }

  async stepForward(): Promise<void> {
    await clickAndAwaitNavigation(this.page, FORWARD);
  }

  async stepBackInQuickSuccession(times: number): Promise<void> {
    const { current, total } = await readVersionPosition(this.page);
    const back = this.page.getByTestId(BACK);
    for (let click = 0; click < times; click++) await back.click();
    await this.expectPosition(current - times, total);
  }

  async goToVersion(version: number): Promise<void> {
    const { current } = await readVersionPosition(this.page);
    const button = version < current ? BACK : FORWARD;
    for (let step = 0; step < Math.abs(version - current); step++) {
      await expect(this.page.getByTestId(button)).toBeEnabled();
      await clickAndAwaitNavigation(this.page, button);
    }
  }

  async restore(): Promise<void> {
    await clickAndAwaitNavigation(this.page, RESTORE);
  }

  async returnToLatest(): Promise<void> {
    await clickAndAwaitNavigation(this.page, LATEST);
  }

  async exportWhatIsShown(): Promise<ExportedView> {
    await installExportCapture(this.page);
    await this.page.getByTestId("export-button").click();
    const captured = await waitForExportCapture(this.page);
    return new CapturedExportedView(JSON.parse(captured.data) as ExportedCharacterFile);
  }

  async expectNavigatorHidden(): Promise<void> {
    await expect(this.page.getByTestId("version-navigator")).toHaveCount(0);
  }

  async expectImportAvailable(available: boolean): Promise<void> {
    await this.expectEnabled("import-button", available);
  }

  async expectEditable(): Promise<void> {
    await expect(this.page.locator('[data-readonly="true"]')).toHaveCount(0);
  }

  async expectPosition(current: number, total: number): Promise<void> {
    const counter = englishText("versionHistory.versionCounter")
      .replace("{{current}}", String(current))
      .replace("{{total}}", String(total));
    await expect(this.page.getByTestId("version-counter")).toHaveText(counter);
  }

  async expectCanStepBack(possible: boolean): Promise<void> {
    await this.expectEnabled(BACK, possible);
  }

  async expectCanStepForward(possible: boolean): Promise<void> {
    await this.expectEnabled(FORWARD, possible);
  }

  async expectOldVersionWarning(shown: boolean): Promise<void> {
    const banner = this.page.getByTestId("version-warning-banner");
    if (!shown) {
      await expect(banner).toHaveCount(0);
      return;
    }
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(englishText("versionHistory.warningBanner.title"));
  }

  async expectRestoreControl(): Promise<void> {
    await expect(this.page.getByTestId(RESTORE)).toBeVisible();
  }

  async expectDescriptionShown(): Promise<void> {
    await expect(this.page.getByTestId("version-change-description")).not.toBeEmpty();
  }

  async expectDescriptionContains(text: string): Promise<void> {
    await expect(this.page.getByTestId("version-change-description")).toContainText(text);
  }

  async expectTimestampShown(): Promise<void> {
    await expect(this.page.getByTestId("version-timestamp")).not.toBeEmpty();
  }

  async expectTimestampRelative(): Promise<void> {
    await expect(this.page.getByTestId("version-timestamp")).toHaveText(/ago|just now/);
  }

  async expectOriginalVersionDropped(originalName: string): Promise<void> {
    await expect
      .poll(async () => (await this.storage.getAllVersions()).map((v) => v.character.name))
      .not.toContain(originalName);
  }

  async expectPortraitShows(portrait: string): Promise<void> {
    await expect(this.page.getByTestId("portrait-image-clickable")).toHaveAttribute(
      "src",
      portrait
    );
  }

  /** Dispatched on the body, as a key press outside any input would arrive. */
  private async pressWithControl(chord: Chord): Promise<void> {
    await this.page.evaluate(
      ({ key, code, shiftKey }) =>
        document.body.dispatchEvent(
          new KeyboardEvent("keydown", {
            key,
            code,
            shiftKey,
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
            composed: true,
          })
        ),
      chord
    );
  }

  private async expectEnabled(testId: string, enabled: boolean): Promise<void> {
    const control = this.page.getByTestId(testId);
    if (enabled) await expect(control).toBeEnabled();
    else await expect(control).toBeDisabled();
  }
}
