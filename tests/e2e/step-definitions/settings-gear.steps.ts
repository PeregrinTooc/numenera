import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";

Given("I am viewing the character sheet", async function (this: CustomWorld) {
  await this.character.openSheet();
});

Given("the browser offers no secure-origin cryptography", async function (this: CustomWorld) {
  await this.settings.reloadsWithoutSecureOriginCryptography();
});

Then("I should see a settings gear icon in the header", async function (this: CustomWorld) {
  await this.settings.expectGearVisible();
});

When("I click the settings gear icon", async function (this: CustomWorld) {
  await this.settings.clicksGear();
});

Then("I should see the settings panel", async function (this: CustomWorld) {
  await this.settings.expectPanelShown();
});

Then("the settings panel should close", async function (this: CustomWorld) {
  await this.settings.expectPanelClosed();
});

Given("I have opened the settings panel", async function (this: CustomWorld) {
  await this.settings.openPanel();
});

When("I click outside the settings panel", async function (this: CustomWorld) {
  await this.settings.clicksOutsidePanel();
});

When("I press the Escape key", async function (this: CustomWorld) {
  await this.settings.pressesEscape();
});

When("I click the German flag icon", async function (this: CustomWorld) {
  await this.settings.choosesGerman();
});

When("I click the British flag icon", async function (this: CustomWorld) {
  await this.settings.choosesEnglish();
});

Then("the interface should display in German", async function (this: CustomWorld) {
  await this.language.expectTitleInGerman();
});

Then("the interface should display in English", async function (this: CustomWorld) {
  await this.language.expectTitleInEnglish();
});

When("I switch to German", async function (this: CustomWorld) {
  await this.settings.switchesToGerman();
});

Given("the interface is in German", async function (this: CustomWorld) {
  await this.settings.isInGermanWithPanelOpen();
});

Then("I should see a {string} option", async function (this: CustomWorld, option: string) {
  await this.settings.expectOptionShown(option);
});

Then("the {string} option should be disabled", async function (this: CustomWorld, option: string) {
  await this.settings.expectOptionDisabled(option);
});
