import { expect } from "@playwright/test";
import type { CustomWorld } from "./world.js";
import {
  CARD_CONFIGS,
  createTestCharacterWithCardCount,
  createEmptyAbilitiesCharacter,
} from "./cardTestFixtures.js";

export class CardsDsl {
  constructor(private world: CustomWorld) {}

  private get page() {
    return this.world.page;
  }

  async setupWithCount(cardType: string, count: number): Promise<void> {
    const config = CARD_CONFIGS[cardType];
    if (!config) {
      throw new Error(`Unknown card type: ${cardType}`);
    }

    if (cardType === "ability" && count === 0) {
      await this.page.evaluate(() => localStorage.clear());
      await this.world.storageHelper.clearVersions();
      await this.world.setup.replaceCharacter(createEmptyAbilitiesCharacter());
      return;
    }

    if (count > config.sampleCards.length) {
      throw new Error(
        `Requested ${count} ${cardType} cards but only ${config.sampleCards.length} sample cards available`
      );
    }

    if (count > 0) {
      await this.world.setup.replaceCharacter(createTestCharacterWithCardCount(cardType, count));
      await this.page.waitForSelector(config.itemTestId, { timeout: 5000 });
    }
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
