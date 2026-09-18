import { Page, expect } from "@playwright/test";
import { waitForSaveComplete } from "./save.js";

export class ModalDsl {
  constructor(private page: Page) {}

  async confirm(): Promise<void> {
    await this.page.click('[data-testid="modal-confirm-button"]');
    await this.page
      .waitForSelector('[data-testid="edit-modal"]', { state: "hidden", timeout: 2000 })
      .catch(() => {
        // Modal might already be hidden
      });
    await waitForSaveComplete(this.page);
  }

  async cancel(): Promise<void> {
    await this.page.click('[data-testid="modal-cancel-button"]');
    await this.page
      .waitForSelector('[data-testid="edit-modal"]', { state: "hidden", timeout: 2000 })
      .catch(() => {
        // Modal might already be hidden
      });
  }

  async tapConfirm(): Promise<void> {
    await this.page.tap('[data-testid="modal-confirm-button"]');
    await this.page
      .waitForSelector('[data-testid="edit-modal"]', { state: "hidden", timeout: 2000 })
      .catch(() => {
        // Modal might already be hidden
      });
    await waitForSaveComplete(this.page);
  }

  async type(value: string): Promise<void> {
    const input = this.page.locator('[data-testid="edit-modal-input"]');
    await input.clear();

    // For non-numeric values in number inputs, use pressSequentially to simulate keyboard
    const inputType = await input.getAttribute("type");
    if (inputType === "number" && !/^\d+$/.test(value)) {
      await input.pressSequentially(value);
    } else {
      await input.fill(value);
    }
  }

  async clearInput(): Promise<void> {
    const input = this.page.locator('[data-testid="edit-modal-input"]');
    await input.clear();
  }

  async expectOpen(): Promise<void> {
    const modal = this.page.locator('[data-testid="edit-modal"]');
    await expect(modal).toBeVisible();
  }

  async expectClosed(): Promise<void> {
    const modal = this.page.locator('[data-testid="edit-modal"]');
    await expect(modal).not.toBeVisible();
  }

  async expectInputValue(value: string): Promise<void> {
    const input = this.page.locator('[data-testid="edit-modal-input"]');
    await expect(input).toHaveValue(value);
  }

  async expectInputFocused(): Promise<void> {
    const input = this.page.locator('[data-testid="edit-modal-input"]');
    await expect(input).toBeFocused();
  }
}
