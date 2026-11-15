import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

Given(
  "my character's {textarea} reads {string}",
  async function (this: CustomWorld, field: string, text: string) {
    await this.character.hasText(field, text);
  }
);

When("I choose {string} as my character type", async function (this: CustomWorld, type: string) {
  await this.additionalFields.chooseType(type);
});

Then("my character type shows as {string}", async function (this: CustomWorld, type: string) {
  await this.additionalFields.expectTypeShows(type);
});

Then(
  "the character types to choose from are {string}, {string}, {string}",
  async function (this: CustomWorld, first: string, second: string, third: string) {
    await this.additionalFields.expectTypeChoices([first, second, third]);
  }
);

Then("the character type is labelled {string}", async function (this: CustomWorld, label: string) {
  await this.additionalFields.expectTypeLabelled(label);
});
