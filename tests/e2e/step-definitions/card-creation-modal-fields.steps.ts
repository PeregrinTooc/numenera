import { When } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world.js";
import { CARD_CONFIGS } from "../support/cardTestFixtures.js";

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
