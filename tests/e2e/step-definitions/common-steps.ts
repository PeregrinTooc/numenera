import { When } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world.js";

When('I click the "New" button', async function (this: CustomWorld) {
  await this.character.createsNewCharacter();
});

When("I reload the page", async function (this: CustomWorld) {
  await this.character.reopen();
});

When("I reload the page immediately", async function (this: CustomWorld) {
  await this.character.reopenImmediately();
});
