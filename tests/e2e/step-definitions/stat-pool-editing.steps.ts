import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world.js";

Given(
  "my character's {word} {word} is {int}",
  async function (this: CustomWorld, stat: string, field: string, value: number) {
    await this.character.hasStat(stat, field, value);
  }
);

When(
  "I change my {word} {word} to {int}",
  async function (this: CustomWorld, stat: string, field: string, value: number) {
    await this.character.changeStat(stat, field, value);
  }
);

Then(
  "my character sheet shows my {word} {word} as {int}",
  async function (this: CustomWorld, stat: string, field: string, value: number) {
    await this.character.expectStatShows(stat, field, value);
  }
);
