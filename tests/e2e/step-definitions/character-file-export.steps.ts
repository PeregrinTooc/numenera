import { When, Then, Given } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

Given("the character has name {string}", async function (this: CustomWorld, name: string) {
  await this.character.isNamed(name);
});

When("I export the character", async function (this: CustomWorld) {
  await this.fileExport.exportCharacter();
});

Then("a file export should be triggered", function (this: CustomWorld) {
  this.fileExport.expectExportTriggered();
});

Then(
  "the exported filename should be {string}",
  function (this: CustomWorld, expectedFilename: string) {
    this.fileExport.expectExportedFilename(expectedFilename);
  }
);

Then("the exported file should contain all character properties", function (this: CustomWorld) {
  this.fileExport.expectAllCharacterProperties();
});

Then(
  "the exported file should have version {string}",
  function (this: CustomWorld, expectedVersion: string) {
    this.fileExport.expectVersion(expectedVersion);
  }
);

Then(
  "the exported file should have schemaVersion {string}",
  function (this: CustomWorld, expectedSchemaVersion: string) {
    this.fileExport.expectSchemaVersion(expectedSchemaVersion);
  }
);

Then("the exported file should have an exportDate", function (this: CustomWorld) {
  this.fileExport.expectExportDate();
});
