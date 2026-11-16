import { expect, type Page } from "@playwright/test";
import type { ClockDriver } from "./clockDriver.js";
import { importFile } from "./fileImport.js";

const testId = (id: string): string => `[data-testid="${id}"]`;

/** Importing a character file and the layout prompt the app shows for it. */
export interface LayoutImportDriver {
  importFile(filename: string, content: unknown): Promise<void>;
  importNote(): string | undefined;
  expectPromptShown(): Promise<void>;
  expectNoPrompt(): Promise<void>;
  expectKeepAndUseOptions(keep: string, use: string): Promise<void>;
  expectOptionFocused(option: string): Promise<void>;
  chooseOption(option: string): Promise<void>;
  dismissWithEscape(): Promise<void>;
  expectCharacterShown(name: string): Promise<void>;
}

export class PlaywrightLayoutImportDriver implements LayoutImportDriver {
  private note?: string;

  constructor(
    private page: Page,
    private clock: ClockDriver
  ) {}

  async importFile(filename: string, content: unknown): Promise<void> {
    this.page.once("dialog", (dialog) => {
      this.note = dialog.message();
      void dialog.dismiss();
    });
    await importFile(this.page, this.clock, filename, content);
  }

  importNote(): string | undefined {
    return this.note;
  }

  async expectPromptShown(): Promise<void> {
    await expect(this.page.locator(testId("layout-choice-modal"))).toBeVisible();
  }

  async expectNoPrompt(): Promise<void> {
    await expect(this.page.locator(testId("layout-choice-modal"))).toHaveCount(0);
  }

  async expectKeepAndUseOptions(keep: string, use: string): Promise<void> {
    await expect(this.page.locator(testId("keep-current-layout"))).toHaveText(keep);
    await expect(this.page.locator(testId("use-imported-layout"))).toHaveText(use);
  }

  async expectOptionFocused(option: string): Promise<void> {
    await expect(this.page.getByRole("button", { name: option })).toBeFocused();
  }

  async chooseOption(option: string): Promise<void> {
    await this.page.getByRole("button", { name: option }).click();
  }

  // The modal takes keys only once focus has moved into it, a task after it renders.
  async dismissWithEscape(): Promise<void> {
    await expect(this.page.locator(testId("keep-current-layout"))).toBeFocused();
    await this.page.keyboard.press("Escape");
  }

  async expectCharacterShown(name: string): Promise<void> {
    await expect(this.page.getByTestId("character-name")).toContainText(name);
  }
}
