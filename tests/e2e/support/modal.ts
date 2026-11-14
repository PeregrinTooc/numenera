import { Page } from "@playwright/test";
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
}
