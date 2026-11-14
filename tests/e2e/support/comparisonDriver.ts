import { expect, type Locator, type Page } from "@playwright/test";
import type { CharacterVersion } from "@/types/versionHistory";
import { englishText } from "./i18nKeys.js";
import type { TestStorageHelper } from "./testStorageHelper.js";

export type Pane = "left" | "right";
export type Highlight = "yellow" | "green" | "red";

/** The side-by-side view of two versions, with the differences highlighted. */
export interface ComparisonDriver {
  switchOn(): Promise<void>;
  expectSwitchedOn(): Promise<void>;
  expectShown(shown: boolean): Promise<void>;
  stepPane(pane: Pane, direction: "back" | "forward"): Promise<void>;
  movePaneTo(pane: Pane, version: number): Promise<void>;
  expectPaneShowsVersion(pane: Pane, version: number): Promise<void>;
  expectPaneShowsCharacterNamed(pane: Pane, name: string): Promise<void>;
  restore(pane: Pane): Promise<void>;
  expectRestoreAvailable(pane: Pane, available: boolean): Promise<void>;
  expectNewestVersionRestoredFrom(storedDescription: string): Promise<void>;
  exit(): Promise<void>;
  expectHeaderListsExactly(changes: string[]): Promise<void>;
  expectHeaderSaysNoDifferences(): Promise<void>;
  expectBasicInfoHighlighted(pane: Pane, field: string): Promise<void>;
  expectBasicInfoNotHighlighted(pane: Pane, field: string): Promise<void>;
  expectCypherHighlighted(pane: Pane, name: string, colour: Highlight): Promise<void>;
  expectCypherAbsent(pane: Pane, name: string): Promise<void>;
  expectReadOnly(): Promise<void>;
}

// The outline each kind of difference is drawn with (src/styles/components/compare-view.css).
const OUTLINE: Record<Highlight, string> = {
  yellow: "rgb(234, 179, 8)",
  green: "rgb(22, 163, 74)",
  red: "rgb(220, 38, 38)",
};

const BASIC_INFO_TEST_IDS: Record<string, string> = {
  name: "character-name",
  tier: "character-tier",
  descriptor: "character-descriptor",
  type: "character-type",
  focus: "character-focus",
};

// How the app stores the description of a restore: the key, then what was restored.
const RESTORED_PREFIX = "versionHistory.changes.restored: ";

const SETTINGS_GEAR = "settings-gear-button";
const SETTINGS_PANEL = "settings-panel";
const COMPARISON_TOGGLE = "settings-comparison-view-toggle";

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class PlaywrightComparisonDriver implements ComparisonDriver {
  constructor(
    private page: Page,
    private storage: TestStorageHelper
  ) {}

  async switchOn(): Promise<void> {
    await this.openSettings();
    const toggle = this.page.getByTestId(COMPARISON_TOGGLE);
    if (!(await toggle.isChecked())) await toggle.click();
    await expect(toggle).toBeChecked();
    await this.closeSettings();
  }

  async expectSwitchedOn(): Promise<void> {
    await this.openSettings();
    await expect(this.page.getByTestId(COMPARISON_TOGGLE)).toBeChecked();
    await this.closeSettings();
  }

  async expectShown(shown: boolean): Promise<void> {
    const view = this.page.getByTestId("comparison-view");
    if (shown) await expect(view).toBeVisible();
    else await expect(view).toHaveCount(0);
  }

  async stepPane(pane: Pane, direction: "back" | "forward"): Promise<void> {
    const counter = this.control(pane, "counter");
    const before = await counter.textContent();
    await this.control(pane, direction === "back" ? "backward" : "forward").click();
    await expect(counter).not.toHaveText(before ?? "");
  }

  async movePaneTo(pane: Pane, version: number): Promise<void> {
    const text = (await this.control(pane, "counter").textContent()) ?? "";
    const current = Number(text.match(/\d+/)?.[0]);
    for (let step = 0; step < Math.abs(current - version); step++) {
      await this.stepPane(pane, version < current ? "back" : "forward");
    }
    await this.expectPaneShowsVersion(pane, version);
  }

  async expectPaneShowsVersion(pane: Pane, version: number): Promise<void> {
    const counter = escapeRegExp(englishText("versionHistory.versionCounter"))
      .replace(escapeRegExp("{{current}}"), String(version))
      .replace(escapeRegExp("{{total}}"), "\\d+");
    await expect(this.control(pane, "counter")).toHaveText(new RegExp(`^${counter}$`));
  }

  async expectPaneShowsCharacterNamed(pane: Pane, name: string): Promise<void> {
    await expect(this.pane(pane).getByTestId("character-name")).toHaveText(name);
  }

  async restore(pane: Pane): Promise<void> {
    const before = await this.newestVersionId();
    await this.control(pane, "restore").click();
    await expect.poll(() => this.newestVersionId()).not.toBe(before);
  }

  async expectRestoreAvailable(pane: Pane, available: boolean): Promise<void> {
    const button = this.control(pane, "restore");
    if (available) await expect(button).toBeEnabled();
    else await expect(button).toBeDisabled();
  }

  async expectNewestVersionRestoredFrom(storedDescription: string): Promise<void> {
    await expect
      .poll(async () => (await this.newestVersion())?.description)
      .toBe(`${RESTORED_PREFIX}${storedDescription}`);
  }

  async exit(): Promise<void> {
    await this.page.getByTestId("comparison-exit-button").click();
  }

  async expectHeaderListsExactly(changes: string[]): Promise<void> {
    await expect(this.page.getByTestId("comparison-header").locator("li")).toHaveText(changes);
  }

  async expectHeaderSaysNoDifferences(): Promise<void> {
    await expect(this.page.getByTestId("comparison-view-no-changes")).toBeVisible();
  }

  async expectBasicInfoHighlighted(pane: Pane, field: string): Promise<void> {
    await expect(this.basicInfo(pane, field)).toHaveCSS("outline-color", OUTLINE.yellow);
  }

  async expectBasicInfoNotHighlighted(pane: Pane, field: string): Promise<void> {
    await expect(this.basicInfo(pane, field)).toHaveCSS("outline-style", "none");
  }

  async expectCypherHighlighted(pane: Pane, name: string, colour: Highlight): Promise<void> {
    await expect(this.cypher(pane, name)).toHaveCSS("outline-color", OUTLINE[colour]);
  }

  async expectCypherAbsent(pane: Pane, name: string): Promise<void> {
    await expect(this.cypher(pane, name)).toHaveCount(0);
  }

  async expectReadOnly(): Promise<void> {
    const sheets = this.page.getByTestId("diff-character-sheet");
    await expect(sheets).toHaveCount(2);
    await expect(sheets.locator("input, textarea, select")).toHaveCount(0);
    await expect(sheets.locator("button")).toHaveCount(0);
  }

  private pane(pane: Pane): Locator {
    return this.page.getByTestId(`compare-pane-${pane}`);
  }

  private control(pane: Pane, control: string): Locator {
    return this.page.getByTestId(`compare-pane-${pane}-${control}`);
  }

  private basicInfo(pane: Pane, field: string): Locator {
    const testId = BASIC_INFO_TEST_IDS[field];
    if (!testId) throw new Error(`No basic info field called "${field}"`);
    return this.pane(pane).getByTestId(testId);
  }

  private cypher(pane: Pane, name: string): Locator {
    return this.pane(pane).getByTestId("cypher-item").filter({ hasText: name });
  }

  private async newestVersionId(): Promise<string | undefined> {
    return (await this.newestVersion())?.id;
  }

  private async newestVersion(): Promise<CharacterVersion | undefined> {
    const versions = await this.storage.getAllVersions();
    return versions[versions.length - 1];
  }

  private async openSettings(): Promise<void> {
    await this.page.getByTestId(SETTINGS_GEAR).click();
    await expect(this.page.getByTestId(SETTINGS_PANEL)).toBeVisible();
  }

  private async closeSettings(): Promise<void> {
    await this.page.getByTestId(SETTINGS_GEAR).click();
    await expect(this.page.getByTestId(SETTINGS_PANEL)).not.toBeVisible();
  }
}
