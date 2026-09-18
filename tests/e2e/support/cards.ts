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

  private deleteButtonSelector(cardType: string, index?: number): string {
    return index === undefined
      ? `[data-testid^="${cardType}-delete-button-"]`
      : `[data-testid="${cardType}-delete-button-${index}"]`;
  }

  /** Sets up a character with the given card count via storage + reload. */
  async setupWithCount(cardType: string, count: number): Promise<void> {
    const config = CARD_CONFIGS[cardType];
    if (!config) {
      throw new Error(`Unknown card type: ${cardType}`);
    }

    // Special case for ability 0 count
    if (cardType === "ability" && count === 0) {
      await this.page.evaluate(() => localStorage.clear());
      await this.world.storageHelper.clearVersions();
      await this.world.storageHelper.setCharacter(createEmptyAbilitiesCharacter());
      await this.page.reload();
      await this.page.waitForLoadState("networkidle");
      await this.page.waitForTimeout(500);
      return;
    }

    if (count > config.sampleCards.length) {
      throw new Error(
        `Requested ${count} ${cardType} cards but only ${config.sampleCards.length} sample cards available`
      );
    }

    if (count > 0) {
      const character = createTestCharacterWithCardCount(cardType, count);
      await this.page.waitForTimeout(500);
      await this.world.storageHelper.setCharacter(character);
      await this.page.waitForTimeout(500);
      await this.page.reload();
      await this.page.waitForLoadState("networkidle");
      await this.page.waitForTimeout(200);
      await this.page.waitForSelector(config.itemTestId, { timeout: 5000 });
    }
  }

  /** Asserts the rendered card count with no extra wait. */
  async expectHasCount(cardType: string, count: number): Promise<void> {
    const config = CARD_CONFIGS[cardType];
    await expect(this.page.locator(config.itemTestId)).toHaveCount(count);
  }

  /** Asserts the rendered card count after a short settle wait. */
  async expectVisibleCount(cardType: string, count: number): Promise<void> {
    await this.page.waitForTimeout(100);
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

  /** Records the pre-delete count on the World (for expectRemoved) and clicks delete. */
  async clickDeleteButton(cardType: string, index = 0): Promise<void> {
    this.world.previousCardCount = await this.count(cardType);
    await this.page.locator(this.deleteButtonSelector(cardType, index)).click();
    await this.page.waitForTimeout(100);
  }

  async count(cardType: string): Promise<number> {
    return this.page.locator(this.deleteButtonSelector(cardType)).count();
  }

  async expectRemoved(cardType: string): Promise<void> {
    const previousCount = this.world.previousCardCount ?? 0;
    await expect(this.page.locator(this.deleteButtonSelector(cardType))).toHaveCount(
      previousCount - 1
    );
  }
}
