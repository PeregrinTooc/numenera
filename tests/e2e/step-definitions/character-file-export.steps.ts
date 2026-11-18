import { When, Then, Given } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

Given("the character has name {string}", async function (this: CustomWorld, name: string) {
  await this.character.isNamed(name);
});

When("I export my character", async function (this: CustomWorld) {
  await this.fileExport.exportCharacter();
});

Then(
  "the exported filename should be {string}",
  async function (this: CustomWorld, expectedFilename: string) {
    await this.fileExport.expectFilename(expectedFilename);
  }
);

Then(
  "the exported file should contain all character properties",
  async function (this: CustomWorld) {
    await this.fileExport.expectAllCharacterProperties();
  }
);

Then(
  "the exported file should have version {string}",
  async function (this: CustomWorld, expectedVersion: string) {
    await this.fileExport.expectVersion(expectedVersion);
  }
);

Then(
  "the exported file should have schemaVersion {string}",
  async function (this: CustomWorld, expectedSchemaVersion: string) {
    await this.fileExport.expectSchemaVersion(expectedSchemaVersion);
  }
);

Then("the exported file should have an exportDate", async function (this: CustomWorld) {
  await this.fileExport.expectExportDate();
});
