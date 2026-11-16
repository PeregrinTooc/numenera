import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import type { SectionZone } from "../support/sections.js";

Given("section slides are recorded", async function (this: CustomWorld) {
  await this.layout.recordSlides();
});

Given("I prefer reduced motion", async function (this: CustomWorld) {
  await this.layout.preferReducedMotion();
});

When(
  "I drop the held section onto the {zone} of the {string} section",
  async function (this: CustomWorld, edge: SectionZone, target: string) {
    await this.layout.dropPreviewedSectionOnto({ target, edge });
  }
);

Then(
  "the {string} section should slide into its new place",
  async function (this: CustomWorld, name: string) {
    await this.layout.expectSlidIntoPlace(name);
  }
);

Then(
  "the {string} section should slide back to where it was",
  async function (this: CustomWorld, name: string) {
    await this.layout.expectSlidBack(name);
  }
);

Then(
  "the {string} section should be drawn above the {string} section while they slide",
  async function (this: CustomWorld, upper: string, lower: string) {
    await this.layout.expectDrawnAbove(upper, lower);
  }
);

Then("no section should have slid", async function (this: CustomWorld) {
  await this.layout.expectNoneSlid();
});
