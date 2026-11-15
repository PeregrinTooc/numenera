import { When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

When("I click my {word} {word}", async function (this: CustomWorld, stat: string, field: string) {
  await this.valueEditor.openForStat(stat, field);
});

When("I enter {int} in the value editor", async function (this: CustomWorld, value: number) {
  await this.valueEditor.enter(value);
});

When("I press Enter in the value editor", async function (this: CustomWorld) {
  await this.valueEditor.confirmWithEnter();
});

When("I press Escape in the value editor", async function (this: CustomWorld) {
  await this.valueEditor.dismissWithEscape();
});

When("I cancel the value editor", async function (this: CustomWorld) {
  await this.valueEditor.cancel();
});

Then("the value editor is open showing {int}", async function (this: CustomWorld, value: number) {
  await this.valueEditor.expectOpenShowing(value);
});

Then("the value editor has the keyboard focus", async function (this: CustomWorld) {
  await this.valueEditor.expectInputFocused();
});

Then("the value editor is closed", async function (this: CustomWorld) {
  await this.valueEditor.expectClosed();
});

When("I click outside the value editor", async function (this: CustomWorld) {
  await this.valueEditor.dismissByClickingOutside();
});

Then("the value editor shows a numeric keypad", async function (this: CustomWorld) {
  await this.valueEditor.expectNumericKeypad();
});

Then("the value editor keeps the keyboard focus inside itself", async function (this: CustomWorld) {
  await this.valueEditor.expectFocusStaysInside();
});

Then(
  "the value editor has an icon on its confirm and cancel buttons",
  async function (this: CustomWorld) {
    await this.valueEditor.expectButtonsHaveIcons();
  }
);

Then("the value editor dims the sheet behind it", async function (this: CustomWorld) {
  await this.valueEditor.expectSheetDimmed();
});

Then("the value editor is a dialog", async function (this: CustomWorld) {
  await this.valueEditor.expectDialogSemantics();
});

Then("the value editor fits the screen", async function (this: CustomWorld) {
  await this.valueEditor.expectFitsScreen();
});

Then("the value editor's controls are big enough to tap", async function (this: CustomWorld) {
  await this.valueEditor.expectTouchFriendlyControls();
});

Then(
  "my {word} {word} looks clickable",
  async function (this: CustomWorld, stat: string, field: string) {
    await this.valueEditor.expectStatLooksClickable(stat, field);
  }
);

Then(
  "my {word} {word} is big enough to tap",
  async function (this: CustomWorld, stat: string, field: string) {
    await this.valueEditor.expectStatTouchFriendly(stat, field);
  }
);
