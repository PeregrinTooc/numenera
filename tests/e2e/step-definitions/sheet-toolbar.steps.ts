import { When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

When("I scroll to the bottom of the page", async function (this: CustomWorld) {
  await this.toolbar.scrollsToTheBottom();
});

Then(
  "the version navigator should not overlap the character sheet",
  async function (this: CustomWorld) {
    await this.toolbar.expectNotOverlappingSheet("version navigator");
  }
);

Then(
  "the Edit Layout button should not overlap the character sheet",
  async function (this: CustomWorld) {
    await this.toolbar.expectNotOverlappingSheet("edit layout button");
  }
);

Then("the version navigator should be in view", async function (this: CustomWorld) {
  await this.toolbar.expectInView("version navigator");
});

Then("the Edit Layout button should be in view", async function (this: CustomWorld) {
  await this.toolbar.expectInView("edit layout button");
});
