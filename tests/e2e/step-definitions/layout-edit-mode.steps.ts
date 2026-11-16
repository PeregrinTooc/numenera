import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";

When("I click the Edit Layout button", async function (this: CustomWorld) {
  await this.layout.toggleEditMode();
});

When("I click the Exit Edit Layout button", async function (this: CustomWorld) {
  await this.layout.toggleEditMode();
});

When("I click the Reset Layout button", async function (this: CustomWorld) {
  await this.settings.resetLayout();
});

Then("I should see layout edit mode is active", async function (this: CustomWorld) {
  await this.layout.expectEditModeActive();
});

Then(
  "I should see visual indicators on rearrangeable sections",
  async function (this: CustomWorld) {
    await this.layout.expectSectionsMarkedRearrangeable();
  }
);

Given("layout edit mode is active", async function (this: CustomWorld) {
  await this.layout.enterEditMode();
});

Then("layout edit mode should be inactive", async function (this: CustomWorld) {
  await this.layout.expectEditModeInactive();
});

Then("the visual indicators should be removed", async function (this: CustomWorld) {
  await this.layout.expectEditModeInactive();
});

Then("I should see the {string} button", async function (this: CustomWorld, buttonText: string) {
  await this.layout.expectButton(buttonText);
});

Then("it should be touch-friendly", async function (this: CustomWorld) {
  await this.layout.expectEditButtonTouchFriendly();
});

Given("I have customized the layout", async function (this: CustomWorld) {
  await this.setup.layout([
    { type: "single", id: "basicInfo" },
    { type: "single", id: "stats" },
    { type: "single", id: "recoveryDamage" },
    { type: "single", id: "cyphers" }, // moved up
    { type: "single", id: "abilities" },
    { type: "grid", items: ["specialAbilities", "attacks"] },
    { type: "single", id: "items" },
    { type: "grid", items: ["background", "notes"] },
  ]);
});

Given("I open the settings panel", async function (this: CustomWorld) {
  await this.settings.openPanel();
});

Then("the layout should return to the default arrangement", async function (this: CustomWorld) {
  await this.layout.expectDefaultArrangement();
});

Then("the {string} option should be enabled", async function (this: CustomWorld, option: string) {
  await this.settings.expectOptionShown(option);
});

Given("I have the default layout", async function (this: CustomWorld) {
  await this.setup.layout(null);
});
