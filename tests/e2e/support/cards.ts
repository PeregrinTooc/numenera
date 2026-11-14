import { expect } from "@playwright/test";
import type { CustomWorld } from "./world.js";
import { CARD_CONFIGS } from "./cardTestFixtures.js";

export class CardsDsl {
  constructor(private world: CustomWorld) {}

  private get page() {
    return this.world.page;
  }

  /** Asserts the rendered card count, retrying until it matches. */
  async expectHasCount(cardType: string, count: number): Promise<void> {
    const config = CARD_CONFIGS[cardType];
    await expect(this.page.locator(config.itemTestId)).toHaveCount(count);
  }

  async clickAddButton(cardType: string): Promise<void> {
    const config = CARD_CONFIGS[cardType];
    await this.page.locator(config.addButtonTestId).click();
    await this.page.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
  }

  async clickEditButton(cardType: string, identifier: string): Promise<void> {
    const config = CARD_CONFIGS[cardType];
    const card = this.page.locator(config.itemTestId).filter({ hasText: identifier });
    const editButton = card.locator(`[data-testid^="${config.editButtonPrefix}"]`);
    await editButton.click();
    await this.page.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
  }
}
