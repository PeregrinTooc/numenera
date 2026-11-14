import { expect, type Locator, type Page } from "@playwright/test";
import { waitForCharacterSheetReady } from "./app-ready.js";
import { CARD_CONFIGS, CARD_TYPE_TO_PROPERTY } from "./cardTestFixtures.js";
import { getTestId } from "./fields.js";
import { englishText } from "./i18nKeys.js";
import { waitForSaveComplete } from "./save.js";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Screen = "wide screen" | "phone";
export type CardTheme = "red" | "teal";

const SCREEN_WIDTH: Record<Screen, number> = { "wide screen": 1280, phone: 390 };

// Tailwind gradient class that carries each theme's colour on a card.
const THEME_CLASS: Record<CardTheme, RegExp> = { red: /from-red-50/, teal: /from-cyan-50/ };

// A card kind's section is "<kebab-case collection>-section" in the page,
// its empty state "empty-<kebab-case collection>".
function kebab(camelCase: string): string {
  return camelCase.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export interface SheetDriver {
  discard(name: string): Promise<void>;
  expectEntries(kind: string, names: string[]): Promise<void>;
  expectNoEntry(name: string): Promise<void>;
  expectEntryCount(kind: string, count: number): Promise<void>;
  expectEntry(kind: string, name: string): Promise<void>;
  expectEntryShows(kind: string, name: string, value: string): Promise<void>;
  expectAddControlThemed(kind: string): Promise<void>;
  reopen(): Promise<void>;
  expectNoConfirmationAsked(): Promise<void>;
  expectDiscardControlInTopLeftCorner(name: string): Promise<void>;
  expectEntryField(kind: string, name: string, field: string, value: string): Promise<void>;
  expectEntryWithoutField(kind: string, name: string, field: string): Promise<void>;
  expectEntryThemed(kind: string, name: string, theme: CardTheme): Promise<void>;
  expectEmptyState(kind: string): Promise<void>;
  expectArmorInAttacksSection(armor: number): Promise<void>;
  viewOn(screen: Screen): Promise<void>;
  expectSectionLeftOf(kind: string, other: string): Promise<void>;
  expectSectionAbove(kind: string, other: string): Promise<void>;
  expectFirstEntryBadgesAtRightEdge(kind: string): Promise<void>;
  expectValueShows(valueName: string, value: string): Promise<void>;
}

const ANY_ENTRY = Object.values(CARD_CONFIGS)
  .map((config) => config.itemTestId)
  .join(", ");

export class PlaywrightSheetDriver implements SheetDriver {
  constructor(private page: Page) {}

  private entry(name: string): Locator {
    return this.page.locator(ANY_ENTRY).filter({ hasText: name });
  }

  private kindEntry(kind: string, name: string): Locator {
    return this.page.locator(CARD_CONFIGS[kind].itemTestId).filter({ hasText: name });
  }

  private discardControl(name: string): Locator {
    return this.entry(name).getByRole("button", { name: englishText("cards.delete") });
  }

  async discard(name: string): Promise<void> {
    await this.discardControl(name).click();
    await this.expectNoEntry(name);
  }

  async expectEntries(kind: string, names: string[]): Promise<void> {
    const entries = this.page.locator(CARD_CONFIGS[kind].itemTestId);
    await expect(entries).toHaveCount(names.length);
    for (const name of names) {
      await expect(entries.filter({ hasText: name })).toHaveCount(1);
    }
  }

  async expectNoEntry(name: string): Promise<void> {
    await expect(this.entry(name)).toHaveCount(0);
  }

  async expectEntryCount(kind: string, count: number): Promise<void> {
    await expect(this.page.locator(CARD_CONFIGS[kind].itemTestId)).toHaveCount(count);
  }

  async expectEntry(kind: string, name: string): Promise<void> {
    await expect(this.kindEntry(kind, name)).toBeVisible();
  }

  async expectEntryShows(kind: string, name: string, value: string): Promise<void> {
    await expect(this.kindEntry(kind, name)).toContainText(value);
  }

  // Tailwind only generates CSS for class names it finds as literal text, so
  // an interpolated theme class renders fully transparent. Only the computed
  // style catches that.
  async expectAddControlThemed(kind: string): Promise<void> {
    const control = this.page.locator(CARD_CONFIGS[kind].addButtonTestId);
    await expect(control).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(control).not.toHaveCSS("background-color", "transparent");
  }

  async reopen(): Promise<void> {
    await waitForSaveComplete(this.page);
    await this.page.reload();
    await waitForCharacterSheetReady(this.page);
  }

  async expectNoConfirmationAsked(): Promise<void> {
    await expect(this.page.getByTestId("card-modal-backdrop")).toBeHidden();
  }

  async expectDiscardControlInTopLeftCorner(name: string): Promise<void> {
    const control = this.discardControl(name);
    await expect(control).toBeVisible();
    const controlBox = await control.boundingBox();
    const entryBox = await this.entry(name).boundingBox();
    if (!controlBox || !entryBox) throw new Error(`"${name}" is not laid out on the page`);
    expect(controlBox.x - entryBox.x).toBeLessThan(entryBox.width / 2);
    expect(controlBox.y - entryBox.y).toBeLessThan(entryBox.height / 2);
  }

  private field(kind: string, name: string, field: string): Locator {
    return this.kindEntry(kind, name).locator(`[data-testid^="${kind}-${field}-"]`);
  }

  private section(kind: string): Locator {
    return this.page.getByTestId(`${kebab(CARD_TYPE_TO_PROPERTY[kind])}-section`);
  }

  async expectEntryField(kind: string, name: string, field: string, value: string): Promise<void> {
    const shown = this.field(kind, name, field);
    await expect(shown).toBeVisible();
    await expect(shown).toContainText(value);
  }

  async expectEntryWithoutField(kind: string, name: string, field: string): Promise<void> {
    await expect(this.kindEntry(kind, name)).toBeVisible();
    await expect(this.field(kind, name, field)).toBeHidden();
  }

  async expectEntryThemed(kind: string, name: string, theme: CardTheme): Promise<void> {
    await expect(this.kindEntry(kind, name).first()).toHaveClass(THEME_CLASS[theme]);
  }

  async expectEmptyState(kind: string): Promise<void> {
    const collection = CARD_TYPE_TO_PROPERTY[kind];
    await expect(this.page.getByTestId(`empty-${kebab(collection)}`)).toHaveText(
      englishText(`${collection}.empty`)
    );
  }

  async expectArmorInAttacksSection(armor: number): Promise<void> {
    const armorValue = this.section("attack").getByTestId("armor-badge").getByTestId("armor-value");
    await expect(armorValue).toHaveText(String(armor));
  }

  async viewOn(screen: Screen): Promise<void> {
    const width = SCREEN_WIDTH[screen];
    await this.page.setViewportSize({ width, height: 800 });
    await expect.poll(() => this.page.evaluate(() => window.innerWidth)).toBe(width);
  }

  async expectSectionLeftOf(kind: string, other: string): Promise<void> {
    await expect
      .poll(async () => {
        const [first, second] = await this.boxesOf(kind, other);
        return second.x - (first.x + first.width);
      })
      .toBeGreaterThanOrEqual(0);
  }

  async expectSectionAbove(kind: string, other: string): Promise<void> {
    await expect
      .poll(async () => {
        const [first, second] = await this.boxesOf(kind, other);
        return second.y - (first.y + first.height);
      })
      .toBeGreaterThanOrEqual(0);
  }

  private async boxesOf(kind: string, other: string): Promise<[Box, Box]> {
    const first = await this.section(kind).boundingBox();
    const second = await this.section(other).boundingBox();
    if (!first || !second) throw new Error(`The ${kind} and ${other} sections are not laid out`);
    return [first, second];
  }

  async expectFirstEntryBadgesAtRightEdge(kind: string): Promise<void> {
    const card = this.page.locator(CARD_CONFIGS[kind].itemTestId).first();
    await expect(card).toBeVisible();
    const cardBox = await card.boundingBox();
    const badgeBox = await card.locator(`.${kind}-badges`).boundingBox();
    if (!cardBox || !badgeBox) throw new Error(`The ${kind} card or its badges are not rendered`);
    // pr-8 (2rem) leaves room for the edit/delete buttons; allow that plus border/padding.
    expect(cardBox.x + cardBox.width - (badgeBox.x + badgeBox.width)).toBeLessThanOrEqual(56);
  }

  async expectValueShows(valueName: string, value: string): Promise<void> {
    await expect(this.page.getByTestId(getTestId(valueName))).toHaveText(value);
  }
}
