import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { CARD_CONFIGS } from "../support/cardTestFixtures.js";

// ============================================================================
// CARD COUNT VERIFICATION STEPS
// ============================================================================

// Cypher cards (singular and plural)
Then("I should see {int} cypher card(s)", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("cypher", count);
});

// Equipment cards
Then("I should see {int} equipment cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("equipment", count);
});

// Artifact cards
Then("I should see {int} artifact cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("artifact", count);
});

// Oddity cards
Then("I should see {int} oddity cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("oddity", count);
});

// Attack cards
Then("I should see {int} attack cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("attack", count);
});

// Ability cards
Then("I should see {int} ability cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("ability", count);
});

// Special ability cards
Then("I should see {int} special ability cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("special-ability", count);
});

// ============================================================================
// CARD CONTENT VERIFICATION STEPS
// ============================================================================

Then(
  "I should see a cypher card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page.waitForTimeout(100);
    const card = this.page.locator(CARD_CONFIGS.cypher.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the cypher {string} should have level {string}",
  async function (this: CustomWorld, name: string, level: string) {
    const card = this.page.locator(CARD_CONFIGS.cypher.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(level);
  }
);

Then(
  "the cypher {string} should have effect {string}",
  async function (this: CustomWorld, name: string, effect: string) {
    const card = this.page.locator(CARD_CONFIGS.cypher.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(effect);
  }
);

Then(
  "I should see an equipment card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page.waitForTimeout(100);
    const card = this.page.locator(CARD_CONFIGS.equipment.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the equipment {string} should have description {string}",
  async function (this: CustomWorld, name: string, description: string) {
    const card = this.page.locator(CARD_CONFIGS.equipment.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(description);
  }
);

Then(
  "I should see an artifact card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page.waitForTimeout(100);
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
    await this.page.waitForTimeout(100);
    const card = this.page.locator(CARD_CONFIGS.oddity.itemTestId).filter({ hasText: text });
    await expect(card).toBeVisible();
  }
);

Then(
  "I should see an attack card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page.waitForTimeout(100);
    const card = this.page.locator(CARD_CONFIGS.attack.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the attack {string} should have modifier {string}",
  async function (this: CustomWorld, name: string, modifier: string) {
    const card = this.page.locator(CARD_CONFIGS.attack.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(modifier);
  }
);

Then(
  "the attack {string} should have damage {string}",
  async function (this: CustomWorld, name: string, damage: string) {
    const card = this.page.locator(CARD_CONFIGS.attack.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(damage);
  }
);

Then(
  "I should see an ability card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page.waitForTimeout(100);
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
    await this.page.waitForTimeout(100);
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
