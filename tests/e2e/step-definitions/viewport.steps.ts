import { Given, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

// The only viewport step. Scenarios that need a particular width say so in
// pixels; device-wide coverage comes from the DEVICE profile (hooks.ts).
// Resizing does not reload the page, so the app keeps whatever mode it booted
// in (isPhoneViewport() is read in the backward-arrow click handler). Navigate
// after this step only if something must boot at this width.
Given("the viewport is {int} pixels wide", async function (this: CustomWorld, width: number) {
  await this.screen.resizeTo(width);
});

Then("the page should not scroll horizontally", async function (this: CustomWorld) {
  await this.screen.expectNoSidewaysScroll();
});
