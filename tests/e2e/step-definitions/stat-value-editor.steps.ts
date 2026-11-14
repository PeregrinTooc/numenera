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
