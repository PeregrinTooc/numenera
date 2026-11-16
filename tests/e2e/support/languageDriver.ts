import { expect, type Locator, type Page } from "@playwright/test";
import { waitForCharacterSheetReady } from "./app-ready.js";
import { BASE_URL } from "./serverUrl.js";

export type TranslatedElement =
  | "page title"
  | "load button"
  | "new button"
  | "stats heading"
  | "might stat"
  | "speed stat"
  | "intellect stat"
  | "cyphers heading"
  | "artifacts heading"
  | "oddities heading"
  | "background label"
  | "notes label"
  | "empty cyphers message"
  | "empty artifacts message"
  | "empty oddities message"
  | "empty equipment message"
  | "empty abilities message";

export type LevelLabelled = "cypher" | "artifact";
export type TextField = "background" | "notes";

/** The translated text the sheet shows and the language it declares. */
export interface LanguageDriver {
  open(queryString: string): Promise<void>;
  expectText(element: TranslatedElement, text: string): Promise<void>;
  expectStatsSectionMentions(text: string): Promise<void>;
  expectStatsLabel(text: string): Promise<void>;
  expectLevelLabel(card: LevelLabelled, text: string): Promise<void>;
  expectEmptyTextField(field: TextField): Promise<void>;
  expectDeclaredLanguage(language: string): Promise<void>;
}

const STAT_LABELS = '[data-testid^="stat-"][data-testid$="-label"]';

export class PlaywrightLanguageDriver implements LanguageDriver {
  constructor(private page: Page) {}

  private locatorFor(element: TranslatedElement): Locator {
    const byTestId = (id: string): Locator => this.page.getByTestId(id);
    switch (element) {
      case "page title":
        return byTestId("page-title");
      case "load button":
        return byTestId("load-button");
      case "new button":
        return byTestId("new-button");
      case "stats heading":
        return byTestId("stats-heading");
      case "might stat":
        return this.page.locator(STAT_LABELS).nth(0);
      case "speed stat":
        return this.page.locator(STAT_LABELS).nth(1);
      case "intellect stat":
        return this.page.locator(STAT_LABELS).nth(2);
      case "cyphers heading":
        return byTestId("cyphers-heading");
      case "artifacts heading":
        return byTestId("artifacts-heading");
      case "oddities heading":
        return byTestId("oddities-heading");
      case "background label":
        return this.page.locator('[data-testid="background-section"] h3');
      case "notes label":
        return this.page.locator('[data-testid="notes-section"] h3');
      case "empty cyphers message":
        return byTestId("empty-cyphers");
      case "empty artifacts message":
        return byTestId("empty-artifacts");
      case "empty oddities message":
        return byTestId("empty-oddities");
      case "empty equipment message":
        return byTestId("empty-equipment");
      case "empty abilities message":
        return byTestId("empty-abilities");
    }
  }

  async open(queryString: string): Promise<void> {
    await this.page.goto(`${BASE_URL}${queryString}`);
    await waitForCharacterSheetReady(this.page);
  }

  async expectText(element: TranslatedElement, text: string): Promise<void> {
    await expect(this.locatorFor(element)).toHaveText(text);
  }

  async expectStatsSectionMentions(text: string): Promise<void> {
    await expect(
      this.page.locator('[data-testid="stats-section"]', { hasText: text }).first()
    ).toBeVisible();
  }

  async expectStatsLabel(text: string): Promise<void> {
    await expect(
      this.page.locator('[data-testid="stats-section"] label', { hasText: text }).first()
    ).toBeVisible();
  }

  async expectLevelLabel(card: LevelLabelled, text: string): Promise<void> {
    await expect(this.page.locator(`[data-testid^="${card}-level-"]`).first()).toContainText(text);
  }

  async expectEmptyTextField(field: TextField): Promise<void> {
    await expect(this.page.locator(`[data-testid="character-${field}"]`)).toHaveValue("");
    await expect(this.page.locator(`[data-testid="${field}-section"] h3`)).toBeVisible();
  }

  async expectDeclaredLanguage(language: string): Promise<void> {
    await expect(this.page.locator("html")).toHaveAttribute("lang", language);
  }
}
