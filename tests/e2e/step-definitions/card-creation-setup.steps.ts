import { When } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world.js";

When("I click the add cypher button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("cypher");
});

When("I click the add equipment button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("equipment");
});

When("I click the add ability button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("ability");
});
