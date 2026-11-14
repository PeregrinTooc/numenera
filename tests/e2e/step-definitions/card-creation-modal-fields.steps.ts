import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { CARD_CONFIGS } from "../support/cardTestFixtures.js";

Then("the modal should show ability fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.ability.fieldTestIds;
  await expect(this.page.locator(fields.name)).toBeVisible();
  await expect(this.page.locator(fields.cost)).toBeVisible();
  await expect(this.page.locator(fields.pool)).toBeVisible();
  await expect(this.page.locator(fields.description)).toBeVisible();
});

Then("all ability fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.ability.fieldTestIds;
  await expect(this.page.locator(fields.name)).toHaveValue("");
  await expect(this.page.locator(fields.cost)).toHaveValue("");
  await expect(this.page.locator(fields.pool)).toHaveValue("");
  await expect(this.page.locator(fields.description)).toHaveValue("");
});

Then("the modal should show special ability fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS["special-ability"].fieldTestIds;
  await expect(this.page.locator(fields.name)).toBeVisible();
  await expect(this.page.locator(fields.source)).toBeVisible();
  await expect(this.page.locator(fields.description)).toBeVisible();
});

Then("all special ability fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS["special-ability"].fieldTestIds;
  await expect(this.page.locator(fields.name)).toHaveValue("");
  await expect(this.page.locator(fields.source)).toHaveValue("");
  await expect(this.page.locator(fields.description)).toHaveValue("");
});

When("I fill in the cypher name with {string}", async function (this: CustomWorld, value: string) {
  await this.page.locator(CARD_CONFIGS.cypher.fieldTestIds.name).fill(value);
});

When("I fill in the cypher level with {string}", async function (this: CustomWorld, value: string) {
  await this.page.locator(CARD_CONFIGS.cypher.fieldTestIds.level).fill(value);
});

When(
  "I fill in the cypher effect with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS.cypher.fieldTestIds.effect).fill(value);
  }
);

When(
  "I fill in the equipment name with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS.equipment.fieldTestIds.name).fill(value);
  }
);

When("I fill in the ability name with {string}", async function (this: CustomWorld, value: string) {
  await this.page.locator(CARD_CONFIGS.ability.fieldTestIds.name).fill(value);
});

When("I fill in the ability cost with {string}", async function (this: CustomWorld, value: string) {
  await this.page.locator(CARD_CONFIGS.ability.fieldTestIds.cost).fill(value);
});

When("I fill in the ability pool with {string}", async function (this: CustomWorld, value: string) {
  await this.page.locator(CARD_CONFIGS.ability.fieldTestIds.pool).selectOption(value.toLowerCase());
});

When(
  "I fill in the ability description with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS.ability.fieldTestIds.description).fill(value);
  }
);

When(
  "I fill in the special ability name with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS["special-ability"].fieldTestIds.name).fill(value);
  }
);

When(
  "I fill in the special ability source with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS["special-ability"].fieldTestIds.source).fill(value);
  }
);

When(
  "I fill in the special ability description with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS["special-ability"].fieldTestIds.description).fill(value);
  }
);
