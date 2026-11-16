import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";

Given("my browser supports File System Access API", async function (this: CustomWorld) {
  await this.fileExport.browserLetsMeChooseWhereToSave();
});

Given("my browser does not support File System Access API", async function (this: CustomWorld) {
  await this.fileExport.browserOnlyDownloads();
});

Given("the character name is {string}", async function (this: CustomWorld, name: string) {
  await this.character.isNamed(name);
});

When("I view the export buttons", async function (this: CustomWorld) {
  await this.fileExport.viewExportButtons();
});

When("I click the Export button", async function (this: CustomWorld) {
  await this.fileExport.exportViaButton();
});

When("I cancel the file save dialog", async function (this: CustomWorld) {
  await this.fileExport.cancelTheSaveDialog();
});

When("I click the Quick Export button", async function (this: CustomWorld) {
  await this.fileExport.quickExport();
});

When("I click the Save As button", async function (this: CustomWorld) {
  await this.fileExport.saveAs();
});

Then("I should see an {string} button", async function (this: CustomWorld, buttonText: string) {
  await this.fileExport.expectButton(buttonText);
});

Then("I should see a {string} button", async function (this: CustomWorld, buttonText: string) {
  await this.fileExport.expectButton(buttonText);
});

Then("I should not see an {string} button", async function (this: CustomWorld, buttonText: string) {
  await this.fileExport.expectNoButton(buttonText);
});

Then(
  "the export dialog should be triggered with filename containing {string}",
  async function (this: CustomWorld, expectedName: string) {
    await this.fileExport.expectSavedAs(expectedName);
  }
);

Then("the exported data should have correct structure", async function (this: CustomWorld) {
  await this.fileExport.expectSavedFileWellFormed();
});

Then("a file download should be triggered", async function (this: CustomWorld) {
  await this.fileExport.expectSaveTriggered();
});

Then(
  "the download filename should contain {string}",
  async function (this: CustomWorld, expectedName: string) {
    await this.fileExport.expectSavedAs(expectedName);
  }
);

Then("the download should have correct file structure", async function (this: CustomWorld) {
  await this.fileExport.expectSavedFileWellFormed();
});

Then(
  "the suggested filename should be {string}",
  async function (this: CustomWorld, expectedFilename: string) {
    await this.fileExport.expectSuggestedFilename(expectedFilename);
  }
);

Then("no file should be saved", async function (this: CustomWorld) {
  await this.fileExport.expectNothingSaved();
});

Then("the Export button should still be visible", async function (this: CustomWorld) {
  await this.fileExport.expectExportButtonStillVisible();
});

Then("the file should be saved without prompting", async function (this: CustomWorld) {
  await this.fileExport.expectSavedWithoutPrompting();
});

Then("the export dialog should be triggered", async function (this: CustomWorld) {
  await this.fileExport.expectPromptedAgain();
});
