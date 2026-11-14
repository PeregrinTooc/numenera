import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world.js";

Given(
  "my character's {stat} {word} is {int}",
  async function (this: CustomWorld, stat: string, field: string, value: number) {
    await this.character.hasStat(stat, field, value);
  }
);

When(
  "I change my {stat} {word} to {int}",
  async function (this: CustomWorld, stat: string, field: string, value: number) {
    await this.character.changeStat(stat, field, value);
  }
);

Then(
  "my character sheet shows my {stat} {word} as {int}",
  async function (this: CustomWorld, stat: string, field: string, value: number) {
    await this.character.expectStatShows(stat, field, value);
  }
);
