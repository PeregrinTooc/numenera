import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { CARD_CONFIGS } from "../support/cardTestFixtures.js";

async function givenCharacterHasCards(
  world: CustomWorld,
  cardType: string,
  count: number
): Promise<void> {
  await world.cards.setupWithCount(cardType, count);
  await world.cards.expectHasCount(cardType, count);
}

Given("the character has {int} ability cards", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "ability", count);
});

Given(
  "the character has {int} special ability cards",
  async function (this: CustomWorld, count: number) {
    await givenCharacterHasCards(this, "special-ability", count);
  }
);

Then("I should see an add ability button", async function (this: CustomWorld) {
  await expect(this.page.locator(CARD_CONFIGS.ability.addButtonTestId)).toBeVisible();
});

Then("I should see an add special ability button", async function (this: CustomWorld) {
  await expect(this.page.locator(CARD_CONFIGS["special-ability"].addButtonTestId)).toBeVisible();
});

When("I click the add cypher button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("cypher");
});

When("I click the add equipment button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("equipment");
});

When("I click the add ability button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("ability");
});

When("I click the add special ability button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("special-ability");
});
