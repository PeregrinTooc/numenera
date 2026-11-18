import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";

Given("my browser supports File System Access API", async function (this: CustomWorld) {
  await this.fileExport.browserLetsMeChooseWhereToSave();
});

Given("my browser does not support File System Access API", async function (this: CustomWorld) {
  await this.fileExport.browserOnlyDownloads();
});

When("I view the export buttons", async function (this: CustomWorld) {
  await this.fileExport.viewExportButtons();
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
  "I should be asked where to save a file named like {string}",
  async function (this: CustomWorld, nameFragment: string) {
    await this.fileExport.expectAskedWhereToSave(nameFragment);
  }
);

Then(
  "a file named like {string} should be downloaded",
  async function (this: CustomWorld, nameFragment: string) {
    await this.fileExport.expectDownloaded(nameFragment);
  }
);

Then("the saved file should be a well-formed character file", async function (this: CustomWorld) {
  await this.fileExport.expectSavedFileWellFormed();
});

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
