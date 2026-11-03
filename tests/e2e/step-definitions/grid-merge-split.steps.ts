/**
 * Step definitions for merging sections into a grid and splitting them again
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";
import { DEFAULT_LAYOUT, getAllSectionIds, type LayoutItem } from "@/types/layout";
import { LAYOUT_STORAGE_KEY } from "@/storage/storageConstants";
import { dragSectionTo, sectionId, sectionLocator, type SectionZone } from "../support/sections.js";

When(
  "I drag the {string} section onto the {zone} of the {string} section",
  async function (this: CustomWorld, source: string, zone: SectionZone, target: string) {
    await dragSectionTo(this.page, source, target, zone);
  }
);

Then(
  "the grid should show {string} on the left and {string} on the right",
  async function (this: CustomWorld, leftName: string, rightName: string) {
    const page = this.page;
    const grid = page.getByTestId(`layout-grid-${sectionId(leftName)}-${sectionId(rightName)}`);
    await expect(grid).toBeVisible();
    // Polled: right after a live preview the sections are still sliding there
    await expect
      .poll(async () => {
        const left = await sectionLocator(page, leftName).boundingBox();
        const right = await sectionLocator(page, rightName).boundingBox();
        if (!left || !right) throw new Error("A paired section has no bounding box");
        return left.x < right.x;
      })
      .toBe(true);
  }
);

Then("the layout should still be the default layout", async function (this: CustomWorld) {
  const stored = await this.page.evaluate((key) => localStorage.getItem(key), LAYOUT_STORAGE_KEY);
  // Nothing saved means the app still uses DEFAULT_LAYOUT.
  expect(stored === null ? DEFAULT_LAYOUT : JSON.parse(stored)).toEqual(DEFAULT_LAYOUT);
});

Then(
  "the {string} section should be the last section",
  async function (this: CustomWorld, sectionName: string) {
    const ids = await this.page
      .locator("[data-section-id]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-section-id")));
    expect(ids[ids.length - 1]).toBe(sectionId(sectionName));
  }
);

Given(
  "{string} and {string} are in a grid",
  async function (this: CustomWorld, section1: string, section2: string) {
    const page = this.page;

    const id1 = sectionId(section1);
    const id2 = sectionId(section2);

    // Every other section on its own row, in default order; the pair last
    const others = getAllSectionIds(DEFAULT_LAYOUT).filter((id) => id !== id1 && id !== id2);
    await this.setup.layout([
      ...others.map((id): LayoutItem => ({ type: "single", id })),
      { type: "grid", items: [id1, id2] },
    ]);

    // Re-enter edit mode
    await page.click('[data-testid="edit-layout-button"]');
  }
);

Then("{string} should be in its own row", async function (this: CustomWorld, sectionName: string) {
  const page = this.page;

  const id = sectionId(sectionName);

  // Check that section is not in a grid
  const notInGrid = await page.evaluate((id) => {
    const section = document.querySelector(`[data-section-id="${id}"]`);
    if (!section) return false;
    return section.closest(".layout-grid") === null;
  }, id);

  expect(notInGrid).toBe(true);
});
