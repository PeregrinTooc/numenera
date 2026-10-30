import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world.js";

const VERSION_NAVIGATOR = '[data-testid="version-navigator"]';
const EDIT_LAYOUT_BUTTON = '[data-testid="edit-layout-button"]';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

function intersects(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

// Compares viewport boxes at the current scroll position: a control that
// floats over the sheet intersects it, one laid out above the sheet does not.
async function expectNotOverlappingSheet(world: CustomWorld, selector: string): Promise<void> {
  const control = await world.page.locator(selector).boundingBox();
  const sheet = await world.page.locator(".parchment-container").boundingBox();
  if (!control || !sheet) {
    throw new Error(`Expected both ${selector} and the character sheet to be rendered`);
  }
  expect(intersects(control, sheet)).toBe(false);
}

async function expectInView(world: CustomWorld, selector: string): Promise<void> {
  await expect(world.page.locator(selector)).toBeInViewport({ ratio: 1 });
}

When("I scroll to the bottom of the page", async function (this: CustomWorld) {
  await this.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await this.page.waitForFunction(
    () => Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight
  );
});

Then(
  "the version navigator should not overlap the character sheet",
  async function (this: CustomWorld) {
    await expectNotOverlappingSheet(this, VERSION_NAVIGATOR);
  }
);

Then(
  "the Edit Layout button should not overlap the character sheet",
  async function (this: CustomWorld) {
    await expectNotOverlappingSheet(this, EDIT_LAYOUT_BUTTON);
  }
);

Then("the version navigator should be in view", async function (this: CustomWorld) {
  await expectInView(this, VERSION_NAVIGATOR);
});

Then("the Edit Layout button should be in view", async function (this: CustomWorld) {
  await expectInView(this, EDIT_LAYOUT_BUTTON);
});
