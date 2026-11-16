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

When('I click the "Load" button', async function (this: CustomWorld) {
  await this.character.loadsSampleCharacter();
});

Then(
  "the character {string} should be displayed",
  async function (this: CustomWorld, name: string) {
    await this.character.expectBasicInfoShows("name", name);
  }
);

Then("all character sections should show data", async function (this: CustomWorld) {
  await this.character.expectEverySectionShowsItsData();
});

Then("the character should be displayed", async function (this: CustomWorld) {
  await this.character.expectSampleCharacterDisplayed();
});

Then("the same character should still be displayed", async function (this: CustomWorld) {
  await this.character.expectSampleCharacterDisplayed();
});

Then("all character data should be preserved", async function (this: CustomWorld) {
  await this.character.expectDataPreserved();
});
