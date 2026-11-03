/**
 * Step definitions for card columns that follow the section's width
 */

import { Then } from "@cucumber/cucumber";
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
