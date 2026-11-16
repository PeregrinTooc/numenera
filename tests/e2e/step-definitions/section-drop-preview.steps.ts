import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import type { SectionZone } from "../support/sections.js";

When(
  "I hold the {string} section over the {zone} of the {string} section",
  async function (this: CustomWorld, source: string, edge: SectionZone, target: string) {
    await this.layout.holdOver(source, { target, edge });
  }
);

When(
  "I hold the {string} section over the {zone} of the {string} section as the window shows it",
  async function (this: CustomWorld, source: string, edge: SectionZone, target: string) {
    await this.layout.holdOverAsWindowShows(source, { target, edge });
  }
);

Given(
  "the {string} section is at the top of the window",
  async function (this: CustomWorld, name: string) {
    await this.layout.bringToTopOfWindow(name);
  }
);

Then(
  "the {string} section should not have moved up or down on screen",
  async function (this: CustomWorld, name: string) {
    await this.layout.expectNotMovedVertically(name);
  }
);

When("I keep still for a moment", async function (this: CustomWorld) {
  await this.layout.keepStill();
});

When("I release the section outside the sheet", async function (this: CustomWorld) {
  await this.layout.releaseOutsideSheet();
});

When("I release the section where it is", async function (this: CustomWorld) {
  await this.layout.releaseWhereItIs();
});

Then(
  "the {string} section should preview {string} on its right",
  async function (this: CustomWorld, target: string, ghost: string) {
    await this.layout.expectPreviewedGhost(target, "right", ghost);
  }
);

Then(
  "the {string} section should preview {string} in its place",
  async function (this: CustomWorld, target: string, ghost: string) {
    await this.layout.expectPreviewedGhost(target, "replace", ghost);
  }
);

Then(
  "the row of {string} should preview {string} below it",
  async function (this: CustomWorld, member: string, bumped: string) {
    await this.layout.expectRowPreviewsBumped(member, bumped);
  }
);

Then("no drop preview should be shown", async function (this: CustomWorld) {
  await this.layout.expectNoPreview();
});
