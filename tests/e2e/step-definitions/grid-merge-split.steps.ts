import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import type { SectionZone } from "../support/sections.js";

When(
  "I drag the {string} section onto the {zone} of the {string} section",
  async function (this: CustomWorld, source: string, zone: SectionZone, target: string) {
    await this.layout.moveSection(source, { target, edge: zone });
  }
);

Then(
  "the grid should show {string} on the left and {string} on the right",
  async function (this: CustomWorld, leftName: string, rightName: string) {
    await this.grid.expectSideBySide(leftName, rightName);
  }
);

Then("the layout should still be the default layout", async function (this: CustomWorld) {
  await this.grid.expectDefaultLayout();
});

Then(
  "the saved layout should pair {string} on the left and {string} on the right",
  async function (this: CustomWorld, left: string, right: string) {
    await this.grid.expectSavedPair(left, right);
  }
);

Then(
  "the {string} section should be the last section",
  async function (this: CustomWorld, sectionName: string) {
    await this.grid.expectLastSection(sectionName);
  }
);

Given(
  "{string} and {string} are in a grid",
  async function (this: CustomWorld, section1: string, section2: string) {
    await this.grid.hasPairedInEditMode(section1, section2);
  }
);

Then("{string} should be in its own row", async function (this: CustomWorld, sectionName: string) {
  await this.grid.expectInOwnRow(sectionName);
});
