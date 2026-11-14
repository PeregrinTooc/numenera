import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

Given(
  "my character's {word} is {string}",
  async function (this: CustomWorld, field: string, value: string) {
    await this.character.hasBasicInfo(field, value);
  }
);

Given("my character's tier is {int}", async function (this: CustomWorld, tier: number) {
  await this.character.hasBasicInfo("tier", tier);
});

When(
  "I change my {word} to {string}",
  async function (this: CustomWorld, field: string, value: string) {
    await this.character.changeBasicInfo(field, value);
  }
);

When("I change my tier to {int}", async function (this: CustomWorld, tier: number) {
  await this.character.changeBasicInfo("tier", String(tier));
});

When("I try to change my {word} to nothing", async function (this: CustomWorld, field: string) {
  await this.character.tryToChangeBasicInfoToNothing(field);
});

Then("the change is refused", async function (this: CustomWorld) {
  await this.character.expectChangeRefused();
});

Then(
  "my character sheet shows my {word} as {string}",
  async function (this: CustomWorld, field: string, value: string) {
    await this.character.expectBasicInfoShows(field, value);
  }
);

When(
  "I change my {word} to {string} without waiting for the auto-save",
  async function (this: CustomWorld, field: string, value: string) {
    await this.character.changeBasicInfoWithoutWaitingForSave(field, value);
  }
);

Then("my character sheet shows my tier as {int}", async function (this: CustomWorld, tier: number) {
  await this.character.expectBasicInfoShows("tier", tier);
});

Given("my character has no {word}", async function (this: CustomWorld, field: string) {
  await this.character.hasBasicInfo(field, "");
});

When("I open my {word} for editing", async function (this: CustomWorld, field: string) {
  await this.character.openBasicInfoForEditing(field);
});

Then(
  "my character sheet shows the placeholder for my {word}",
  async function (this: CustomWorld, field: string) {
    await this.character.expectBasicInfoPlaceholder(field);
  }
);

Then("my {word} looks clickable", async function (this: CustomWorld, field: string) {
  await this.character.expectBasicInfoLooksClickable(field);
});

Then(
  "the value editor is open showing {string}",
  async function (this: CustomWorld, value: string) {
    await this.character.expectEditorShowing(value);
  }
);
