import { Given } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

// The only viewport step. Scenarios that need a particular width say so in
// pixels; device-wide coverage comes from the DEVICE profile (hooks.ts).
// Resizing does not reload: if the app must boot at this width (anything
// that reads isPhoneViewport() at startup), navigate after this step.
Given("the viewport is {int} pixels wide", async function (this: CustomWorld, width: number) {
  await this.page.setViewportSize({ width, height: 800 });
});
