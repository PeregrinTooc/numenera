import { When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import type { SectionZone } from "../support/sections.js";

When("I long-press the {string} section", async function (this: CustomWorld, name: string) {
  await this.layout.longPress(name);
});

Then(
  "the {string} section should be in drag mode",
  async function (this: CustomWorld, name: string) {
    await this.layout.expectInDragMode(name);
  }
);

When(
  "I long-press the {string} section and hold it at the top edge until the {string} section is on screen",
  async function (this: CustomWorld, name: string, until: string) {
    await this.layout.holdAtTopEdgeUntilOnScreen(name, until);
  }
);

When(
  "I long-press the {string} section and hold it over the {zone} of the {string} section until the sheet shows the result",
  async function (this: CustomWorld, name: string, edge: SectionZone, target: string) {
    await this.layout.holdOverUntilPreviewed(name, { target, edge });
  }
);

When(
  "I drag it above the {string} section and release it",
  async function (this: CustomWorld, target: string) {
    await this.layout.dropHeldSectionOnto({ target, edge: "top edge" });
  }
);

When(
  "I swipe from the {string} section towards the {string} section",
  async function (this: CustomWorld, from: string, towards: string) {
    await this.layout.swipe(from, towards);
  }
);

Then("the page should have scrolled", async function (this: CustomWorld) {
  await this.layout.expectPageScrolled();
});
