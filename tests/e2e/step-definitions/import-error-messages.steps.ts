import { When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world.js";

When("I import a file without character data", async function (this: CustomWorld) {
  await this.characterImport.importsFileWithoutCharacterData();
});

Then("the alert should read {string}", function (this: CustomWorld, message: string) {
  this.characterImport.expectAlertReads(message);
});
