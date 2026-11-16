import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";

Then("the exported file should contain the layout configuration", function (this: CustomWorld) {
  this.fileExport.expectLayoutIncluded();
});

Given("I have a character file with a different layout", function (this: CustomWorld) {
  this.layoutImport.hasFileWithDifferentLayout();
});

Given("I have a character file with the default layout", function (this: CustomWorld) {
  this.layoutImport.hasFileWithDefaultLayout();
});

Given("I have a character file without a layout", function (this: CustomWorld) {
  this.layoutImport.hasFileWithoutLayout();
});

Given(
  "I have a character file with the default layout that sets the {string} section to {int} column(s)",
  function (this: CustomWorld, section: string, columns: number) {
    this.layoutImport.hasFileSettingSectionColumns(section, columns);
  }
);

Given(
  "I have a character file with the default layout that sets the {string} section to {int} column(s) and an unknown section to {int} column(s)",
  function (this: CustomWorld, section: string, columns: number, unknownColumns: number) {
    this.layoutImport.hasFileSettingSectionAndUnknownSectionColumns(
      section,
      columns,
      unknownColumns
    );
  }
);

Given(
  "I have set the {string} section to {int} column(s)",
  async function (this: CustomWorld, section: string, columns: number) {
    await this.sectionColumns.hasSetSectionTo(section, columns);
  }
);

Given(
  "I have saved the {string} section as {int} column(s) and an unknown section as {int} column(s)",
  async function (this: CustomWorld, section: string, columns: number, unknownColumns: number) {
    await this.sectionColumns.hasSavedSectionAndUnknownSection(section, columns, unknownColumns);
  }
);

When("I import the character file", async function (this: CustomWorld) {
  await this.layoutImport.importFile();
});

Then("the import note should read {string}", async function (this: CustomWorld, message: string) {
  await this.layoutImport.expectImportNote(message);
});

Then("I should see a layout choice prompt", async function (this: CustomWorld) {
  await this.layoutImport.expectPromptShown();
});

When("I dismiss the layout choice prompt with the Escape key", async function (this: CustomWorld) {
  await this.layoutImport.dismissPromptWithEscape();
});

Then("I should not see a layout choice prompt", async function (this: CustomWorld) {
  await this.layoutImport.expectNoPrompt();
});

Then(
  "I should see options to {string} or {string}",
  async function (this: CustomWorld, keep: string, use: string) {
    await this.layoutImport.expectOptions(keep, use);
  }
);

Then("the {string} option should have focus", async function (this: CustomWorld, option: string) {
  await this.layoutImport.expectOptionFocused(option);
});

When("I choose to {string}", async function (this: CustomWorld, option: string) {
  await this.layoutImport.choose(option);
});

Then("the imported character should be shown", async function (this: CustomWorld) {
  await this.layoutImport.expectImportedCharacterShown();
});

Then(
  "the {string} section should be set to {int} column(s)",
  async function (this: CustomWorld, section: string, columns: number) {
    await this.sectionColumns.expectSetTo(section, columns);
  }
);
