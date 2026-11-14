import { expect, type Locator, type Page } from "@playwright/test";
import { getTestId } from "./fields.js";
import { waitForSaveComplete } from "./save.js";

/** The small editor that opens over the sheet to change a single value. */
export interface ValueEditorDriver {
  open(valueName: string): Promise<void>;
  setValue(value: string): Promise<void>;
  confirm(): Promise<void>;
  confirmWithEnter(): Promise<void>;
  cancel(): Promise<void>;
  dismissWithEscape(): Promise<void>;
  expectOpenShowing(value: string): Promise<void>;
  expectInputFocused(): Promise<void>;
  expectClosed(): Promise<void>;
}

export class PlaywrightValueEditorDriver implements ValueEditorDriver {
  constructor(private page: Page) {}

  private get editor(): Locator {
    return this.page.getByTestId("edit-modal");
  }

  private get input(): Locator {
    return this.page.getByTestId("edit-modal-input");
  }

  async open(valueName: string): Promise<void> {
    await this.page.getByTestId(getTestId(valueName)).click();
    await expect(this.editor).toBeVisible();
    await expect(this.input).toBeFocused();
  }

  async setValue(value: string): Promise<void> {
    await this.input.fill(value);
    await expect(this.input).toHaveValue(value);
  }

  async confirm(): Promise<void> {
    await this.page.getByTestId("modal-confirm-button").click();
    await this.expectSaved();
  }

  async confirmWithEnter(): Promise<void> {
    await this.page.keyboard.press("Enter");
    await this.expectSaved();
  }

  async cancel(): Promise<void> {
    await this.page.getByTestId("modal-cancel-button").click();
    await this.expectClosed();
  }

  async dismissWithEscape(): Promise<void> {
    await this.page.keyboard.press("Escape");
    await this.expectClosed();
  }

  async expectOpenShowing(value: string): Promise<void> {
    await expect(this.editor).toBeVisible();
    await expect(this.input).toHaveValue(value);
  }

  async expectInputFocused(): Promise<void> {
    await expect(this.input).toBeFocused();
  }

  async expectClosed(): Promise<void> {
    await expect(this.editor).toBeHidden();
  }

  private async expectSaved(): Promise<void> {
    await this.expectClosed();
    await waitForSaveComplete(this.page);
  }
}
