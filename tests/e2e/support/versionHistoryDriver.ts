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

/** The version navigator, its warning banner, and the stored history behind them. */
export interface VersionHistoryDriver {
  storeVersions(seeds: VersionSeed[]): Promise<void>;
  settleEdits(): Promise<void>;
  reopen(): Promise<void>;
  stepBack(): Promise<void>;
  stepForward(): Promise<void>;
  stepBackInQuickSuccession(times: number): Promise<void>;
  goToVersion(version: number): Promise<void>;
  restore(): Promise<void>;
  returnToLatest(): Promise<void>;
  exportWhatIsShown(): Promise<ExportedView>;
  expectNavigatorHidden(): Promise<void>;
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

  async storeVersions(seeds: VersionSeed[]): Promise<void> {
    await waitForInitialVersionSaved(this.page);
    const base = await this.storage.getCharacter();
    for (const { description, changes } of seeds) {
      await this.storage.createVersion({ ...base, ...changes }, description);
    }
    if (seeds.length > 0) await this.expectPosition(seeds.length + 1, seeds.length + 1);
  }

  async settleEdits(): Promise<void> {
    await forceSquash(this.page);
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

  private async expectEnabled(testId: string, enabled: boolean): Promise<void> {
    const control = this.page.getByTestId(testId);
    if (enabled) await expect(control).toBeEnabled();
    else await expect(control).toBeDisabled();
  }
}
