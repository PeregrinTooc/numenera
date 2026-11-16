import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";

Given("I have reordered sections", async function (this: CustomWorld) {
  await this.layout.hasReorderedSections();
});

Then("the layout should be saved", async function (this: CustomWorld) {
  await this.layout.expectLayoutSaved();
});

Then("the sections should remain in the new order", async function (this: CustomWorld) {
  await this.layout.expectLayoutSaved();
});

Then(
  "the {string} section should appear before the {string} section",
  async function (this: CustomWorld, first: string, second: string) {
    await this.layout.expectSectionBefore(first, second);
  }
);

Given(
  "I have moved the {string} section to the top",
  async function (this: CustomWorld, sectionName: string) {
    await this.layout.hasSectionOnTopInEditMode(sectionName);
  }
);

When("I exit layout edit mode", async function (this: CustomWorld) {
  await this.layout.exitEditMode();
});

Then(
  "the {string} section should still be at the top",
  async function (this: CustomWorld, sectionName: string) {
    await this.layout.expectSectionAtTop(sectionName);
  }
);
