import { When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

When(
  "I import a valid character file with matching schema version",
  async function (this: CustomWorld) {
    await this.characterImport.importsValidCharacter();
  }
);

When("I import a character file with tier {int}", async function (this: CustomWorld, tier: number) {
  await this.characterImport.importsCharacterWithTier(tier);
});

Then(
  "the tier should have been adjusted to {string}",
  async function (this: CustomWorld, tier: string) {
    await this.character.expectBasicInfoShows("tier", tier);
  }
);

Then("the character should be imported successfully", async function (this: CustomWorld) {
  await this.characterImport.expectImportedCharacterNamed();
});

Then("all character data should be correctly displayed", async function (this: CustomWorld) {
  await this.characterImport.expectImportedCharacterDisplayed();
});

Then(
  "the character name should still be {string}",
  async function (this: CustomWorld, expectedName: string) {
    await this.character.expectBasicInfoShows("name", expectedName);
  }
);

Then("the tier should still be {string}", async function (this: CustomWorld, expectedTier: string) {
  await this.character.expectBasicInfoShows("tier", expectedTier);
});
