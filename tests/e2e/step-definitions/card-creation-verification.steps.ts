import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { CARD_CONFIGS } from "../support/cardTestFixtures.js";

Then("I should see {int} cypher card(s)", async function (this: CustomWorld, count: number) {
  await this.cards.expectHasCount("cypher", count);
});

Then("I should see {int} artifact cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectHasCount("artifact", count);
});

Then("I should see {int} oddity cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectHasCount("oddity", count);
});

Then("I should see {int} ability cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectHasCount("ability", count);
});

Then("I should see {int} special ability cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectHasCount("special-ability", count);
});

Then(
  "I should see an artifact card with name {string}",
  async function (this: CustomWorld, name: string) {
    const card = this.page.locator(CARD_CONFIGS.artifact.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the artifact {string} should have level {string}",
  async function (this: CustomWorld, name: string, level: string) {
    const card = this.page.locator(CARD_CONFIGS.artifact.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(level);
  }
);

Then(
  "the artifact {string} should have effect {string}",
  async function (this: CustomWorld, name: string, effect: string) {
    const card = this.page.locator(CARD_CONFIGS.artifact.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(effect);
  }
);

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

Then(
  "the ability {string} should have cost {string}",
  async function (this: CustomWorld, name: string, cost: string) {
    const card = this.page.locator(CARD_CONFIGS.ability.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(cost);
  }
);

Then(
  "the ability {string} should have pool {string}",
  async function (this: CustomWorld, name: string, pool: string) {
    const card = this.page.locator(CARD_CONFIGS.ability.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(pool);
  }
);

Then(
  "I should see a special ability card with name {string}",
  async function (this: CustomWorld, name: string) {
    const card = this.page.locator(CARD_CONFIGS["special-ability"].itemTestId).filter({
      hasText: name,
    });
    await expect(card).toBeVisible();
  }
);

Then(
  "the special ability {string} should have source {string}",
  async function (this: CustomWorld, name: string, source: string) {
    const card = this.page.locator(CARD_CONFIGS["special-ability"].itemTestId).filter({
      hasText: name,
    });
    await expect(card).toContainText(source);
  }
);
