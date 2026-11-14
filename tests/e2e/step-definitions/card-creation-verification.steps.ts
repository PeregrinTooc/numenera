import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { CARD_CONFIGS } from "../support/cardTestFixtures.js";

Then("I should see {int} cypher card(s)", async function (this: CustomWorld, count: number) {
  await this.cards.expectHasCount("cypher", count);
});

Then("I should see {int} ability cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectHasCount("ability", count);
});

Then(
  "I should see an oddity card with text {string}",
  async function (this: CustomWorld, text: string) {
    const card = this.page.locator(CARD_CONFIGS.oddity.itemTestId).filter({ hasText: text });
    await expect(card).toBeVisible();
  }
);

Then(
  "I should see an ability card with name {string}",
  async function (this: CustomWorld, name: string) {
    const card = this.page.locator(CARD_CONFIGS.ability.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);
