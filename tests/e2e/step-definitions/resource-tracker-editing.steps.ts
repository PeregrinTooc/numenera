import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

Given(
  "my character has {int} current XP and {int} total XP",
  async function (this: CustomWorld, current: number, total: number) {
    await this.character.hasXp(current, total);
  }
);

Given(
  "my character was saved with a single legacy XP value of {int}",
  async function (this: CustomWorld, xp: number) {
    await this.character.hasLegacyXp(xp);
  }
);

Given(
  "my character's {resourceName} is {int}",
  async function (this: CustomWorld, resource: string, value: number) {
    await this.character.hasResource(resource, value);
  }
);

When(
  "I change my {resourceName} to {int}",
  async function (this: CustomWorld, resource: string, value: number) {
    await this.character.change(resource, String(value));
  }
);

When(
  "I try to change my {resourceName} to {string}",
  async function (this: CustomWorld, resource: string, value: string) {
    await this.character.tryToChange(resource, value);
  }
);

Then(
  "my character sheet shows my {resourceName} as {int}",
  async function (this: CustomWorld, resource: string, value: number) {
    await this.character.expectResourceShows(resource, value);
  }
);

Then("I am told why", async function (this: CustomWorld) {
  await this.character.expectRefusalExplained();
});
