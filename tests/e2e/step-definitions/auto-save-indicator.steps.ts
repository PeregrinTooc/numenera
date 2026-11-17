import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world.js";

Given("the character sheet is displayed", async function (this: CustomWorld) {
  await this.character.expectSomeCharacterDisplayed();
});

When("I note the current save timestamp", async function (this: CustomWorld) {
  await this.saveIndicator.notesTheSaveTime();
});

When("I wait for {int} second(s)", async function (this: CustomWorld, seconds: number) {
  await this.saveIndicator.letsTimePass(seconds);
});

When("I rapidly edit the character name multiple times", async function (this: CustomWorld) {
  await this.saveIndicator.renamesCharacterRapidly();
});

Then("the save indicator should be visible", async function (this: CustomWorld) {
  await this.saveIndicator.expectVisible();
});

Then("the save indicator should show a timestamp", async function (this: CustomWorld) {
  await this.saveIndicator.expectShowsTime();
});

Then(
  "the save indicator should contain {string}",
  async function (this: CustomWorld, text: string) {
    await this.saveIndicator.expectShows(text);
  }
);

Then("the save timestamp should be updated", async function (this: CustomWorld) {
  await this.saveIndicator.expectTimeChanged();
});

Then("the character should be saved exactly once after changes stop", function (this: CustomWorld) {
  this.saveIndicator.expectSavedExactlyOnce();
});

Then("the save indicator should show a single timestamp", async function (this: CustomWorld) {
  await this.saveIndicator.expectShowsTime();
});

Then("the save indicator should still be visible", async function (this: CustomWorld) {
  await this.saveIndicator.expectVisible();
});

Then("the save indicator should be in the lower-right corner", async function (this: CustomWorld) {
  await this.saveIndicator.expectInLowerRightCorner();
});

Then("the save indicator should have subtle styling", async function (this: CustomWorld) {
  await this.saveIndicator.expectSubtleStyling();
});
