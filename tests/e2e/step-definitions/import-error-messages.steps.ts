import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { importFile } from "../support/fileImport.js";

let lastAlertMessage = "";

When("I import a file without character data", async function () {
  const dialogPromise = this.page.waitForEvent("dialog");
  await importFile(this.page, "broken.numenera", { version: "1.0" });
  const dialog = await dialogPromise;
  lastAlertMessage = dialog.message();
  await dialog.dismiss();
});

Then("the alert should read {string}", async function (message: string) {
  expect(lastAlertMessage).toBe(message);
});
