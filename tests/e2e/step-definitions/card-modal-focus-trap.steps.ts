import { When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

When("I press the Tab key {int} time(s)", async function (this: CustomWorld, times: number) {
  await this.cardEditor.pressTab(times);
});

When("I tab through every control of the card editor twice", async function (this: CustomWorld) {
  await this.cardEditor.tabsThroughEveryControlTwice();
});

When(
  "I tab backwards through every control of the card editor twice",
  async function (this: CustomWorld) {
    await this.cardEditor.tabsBackThroughEveryControlTwice();
  }
);

When("I press Shift+Tab {int} time(s)", async function (this: CustomWorld, times: number) {
  await this.cardEditor.pressShiftTab(times);
});

When("I press Escape in the card editor", async function (this: CustomWorld) {
  await this.cardEditor.pressEscape();
});

Then("the card editor closes", async function (this: CustomWorld) {
  await this.cardEditor.expectClosed();
});

Then("the first field of the card editor has focus", async function (this: CustomWorld) {
  await this.cardEditor.expectFirstFieldFocused();
});

Then("the last control of the card editor has focus", async function (this: CustomWorld) {
  await this.cardEditor.expectLastControlFocused();
});

Then("the {word} field has focus", async function (this: CustomWorld, field: string) {
  await this.cardEditor.expectFieldFocused(field);
});
