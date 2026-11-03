/**
 * Step definitions for card columns that follow the section's width
 */

import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world.js";
import { sectionLocator } from "../support/sections.js";

// Column counts come from the browser's computed grid: container queries
// decide them, so only a real layout can tell. Polled, because a section that
// changed width (resize, pairing) re-lays out a frame later.
Then(
  "the {string} section should show its cards in {int} column\\(s)",
  async function (this: CustomWorld, section: string, columns: number) {
    const grid = sectionLocator(this.page, section).locator(".section-card-grid").first();
    await expect
      .poll(() =>
        grid.evaluate(
          (el) => window.getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length
        )
      )
      .toBe(columns);
  }
);

// Clicks the switch only if the section is not already set to `columns`
When(
  "I switch the {string} section to {int} column\\(s)",
  async function (this: CustomWorld, section: string, columns: number) {
    const button = sectionLocator(this.page, section).getByTestId("section-columns-button");
    const pressed = columns === 2 ? "true" : "false";
    if ((await button.getAttribute("aria-pressed")) !== pressed) {
      await button.click();
    }
    await expect(button).toHaveAttribute("aria-pressed", pressed);
  }
);

// Hidden by the container query counts as not offered
Then(
  "the {string} section should offer a column switch",
  async function (this: CustomWorld, section: string) {
    await expect(
      sectionLocator(this.page, section).getByTestId("section-columns-button")
    ).toBeVisible();
  }
);

Then(
  "the {string} section should offer no column switch",
  async function (this: CustomWorld, section: string) {
    await expect(
      sectionLocator(this.page, section).getByTestId("section-columns-button")
    ).toBeHidden();
  }
);

// The badge sits in the heading row, before the heading: entirely to its
// left, with its top within the heading's height
async function expectBadgeLeftOfHeading(
  world: CustomWorld,
  badgeTestId: string,
  section: string
): Promise<void> {
  const badge = await world.page.getByTestId(badgeTestId).boundingBox();
  const heading = await sectionLocator(world.page, section).locator("h2").first().boundingBox();
  if (!badge || !heading) throw new Error(`No box for ${badgeTestId} or the ${section} heading`);
  expect(badge.x + badge.width).toBeLessThanOrEqual(heading.x);
  expect(badge.y).toBeLessThan(heading.y + heading.height);
}

Then(
  "the max cyphers badge should be left of the {string} heading",
  async function (this: CustomWorld, section: string) {
    await expectBadgeLeftOfHeading(this, "max-cyphers-badge", section);
  }
);

Then(
  "the shins badge should be left of the {string} heading",
  async function (this: CustomWorld, section: string) {
    await expectBadgeLeftOfHeading(this, "shins-badge", section);
  }
);

Then("the armor badge should not cover the add attack button", async function (this: CustomWorld) {
  const badge = await this.page.getByTestId("armor-badge").boundingBox();
  const button = await this.page.getByTestId("add-attack-button").boundingBox();
  if (!badge || !button) throw new Error("No box for the armor badge or the add attack button");
  const apart =
    badge.x >= button.x + button.width ||
    button.x >= badge.x + badge.width ||
    badge.y >= button.y + button.height ||
    button.y >= badge.y + badge.height;
  expect(apart).toBe(true);
});
