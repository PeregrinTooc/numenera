import { When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world.js";

When(
  "I import a valid character file {string}",
  async function (this: CustomWorld, filename: string) {
    await this.characterImport.importsCharacterFile(filename);
  }
);

Then(
  "the character {string} should still be displayed",
  async function (this: CustomWorld, name: string) {
    await this.characterImport.expectCharacterNamed(name);
  }
);

Then("the previous character should be replaced", async function (this: CustomWorld) {
  await this.characterImport.expectPreviousCharacterReplaced();
});
