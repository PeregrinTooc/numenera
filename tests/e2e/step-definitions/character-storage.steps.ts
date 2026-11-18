import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

Given("a character is currently displayed", async function (this: CustomWorld) {
  await this.character.expectSomeCharacterDisplayed();
});

Then("the character sheet should show empty states", async function (this: CustomWorld) {
  await this.character.expectNoCyphersArtifactsOrOddities();
});

Then("all sections should display empty state messages", async function (this: CustomWorld) {
  await this.character.expectNoEquipmentAbilitiesOrNotes();
});

Given("the character sheet is empty", async function (this: CustomWorld) {
  await this.character.startsWithEmptySheet();
});

Given("I have loaded the sample character", async function (this: CustomWorld) {
  await this.character.loadsSampleCharacter();
  await this.character.expectSampleCharacterDisplayed();
});

When('I click the "Load" button', async function (this: CustomWorld) {
  await this.character.loadsSampleCharacter();
});

Then(
  "the character {string} should be displayed",
  async function (this: CustomWorld, name: string) {
    await this.character.expectBasicInfoShows("name", name);
  }
);

Then("all of the character's entries and notes are shown", async function (this: CustomWorld) {
  await this.character.expectEverySectionShowsItsData();
});

Then("the character should be displayed", async function (this: CustomWorld) {
  await this.character.expectSampleCharacterDisplayed();
});

Then("the same character should still be displayed", async function (this: CustomWorld) {
  await this.character.expectSampleCharacterDisplayed();
});
