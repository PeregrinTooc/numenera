import { expect, type Locator, type Page } from "@playwright/test";
import { waitForCharacterSheetReady } from "./app-ready.js";
import { CARD_CONFIGS } from "./cardTestFixtures.js";
import { englishText } from "./i18nKeys.js";
import { waitForSaveComplete } from "./save.js";

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
}
