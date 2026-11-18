import { expect, type Locator, type Page } from "@playwright/test";
import { waitForCharacterSheetReady } from "./app-ready.js";
import { BASE_URL } from "./serverUrl.js";

export const TRANSLATED_ELEMENTS = [
  "page title",
  "load button",
  "new button",
  "stats heading",
  "might stat",
  "speed stat",
  "intellect stat",
  "pool label",
  "edge label",
  "current label",
  "cyphers heading",
  "cypher level",
  "artifacts heading",
  "artifact level",
  "oddities heading",
  "background label",
  "notes label",
  "empty cyphers message",
  "empty artifacts message",
  "empty oddities message",
  "empty equipment message",
  "empty abilities message",
] as const;

export type TranslatedElement = (typeof TRANSLATED_ELEMENTS)[number];

// A level badge also shows the level itself, so only its start is translated text.
const LEADING_TEXT: TranslatedElement[] = ["cypher level", "artifact level"];

/** The translated text the sheet shows and the language it declares. */
export interface LanguageDriver {
  open(queryString: string): Promise<void>;
  expectText(element: TranslatedElement, text: string): Promise<void>;
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
      case "pool label":
        return this.page.getByTestId("stat-might").locator(".stat-pool-sublabel");
      case "edge label":
        return byTestId("label-might-edge");
      case "current label":
        return byTestId("label-might-current");
      case "cypher level":
        return this.page.locator('[data-testid^="cypher-level-"]').first();
      case "artifact level":
        return this.page.locator('[data-testid^="artifact-level-"]').first();
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
    const shown = expect(this.locatorFor(element));
    await (LEADING_TEXT.includes(element) ? shown.toContainText(text) : shown.toHaveText(text));
  }

  async expectDeclaredLanguage(language: string): Promise<void> {
    await expect(this.page.locator("html")).toHaveAttribute("lang", language);
  }
}
