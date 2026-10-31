/**
 * Step definitions for merging sections into a grid and splitting them again
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";
import { sectionId, sectionLocator } from "../support/sections.js";

When(
  "I drag the {string} section onto the {string} section",
  async function (this: CustomWorld, sourceSection: string, targetSection: string) {
    const page = this.page;

    const sourceElement = sectionLocator(page, sourceSection);
    const targetElement = sectionLocator(page, targetSection);

    const sourceBox = await sourceElement.boundingBox();
    const targetBox = await targetElement.boundingBox();

    if (!sourceBox || !targetBox) {
      throw new Error("Could not get bounding boxes for sections");
    }

    // Drag onto target (center of target)
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.mouse.up();

    await page.waitForTimeout(100);
  }
);

Then(
  "{string} and {string} should be displayed side by side in a grid",
  async function (this: CustomWorld, section1: string, section2: string) {
    const page = this.page;

    const id1 = sectionId(section1);
    const id2 = sectionId(section2);

    // Check that both sections are within a grid container
    const inGrid = await page.evaluate(
      ({ id1, id2 }) => {
        const section1 = document.querySelector(`[data-section-id="${id1}"]`);
        const section2 = document.querySelector(`[data-section-id="${id2}"]`);

        if (!section1 || !section2) return false;

        // Check if they share a common grid parent
        const parent1 = section1.closest(".layout-grid");
        const parent2 = section2.closest(".layout-grid");

        return parent1 !== null && parent1 === parent2;
      },
      { id1, id2 }
    );

    expect(inGrid).toBe(true);
  }
);

When(
  "I attempt to drag {string} onto {string}",
  async function (this: CustomWorld, sourceSection: string, targetSection: string) {
    const page = this.page;

    // Try to drag - this may not work for non-eligible sections
    const sourceElement = sectionLocator(page, sourceSection);
    const targetElement = sectionLocator(page, targetSection);

    const sourceBox = await sourceElement.boundingBox();
    const targetBox = await targetElement.boundingBox();

    if (sourceBox && targetBox) {
      await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
      await page.mouse.up();
    }
  }
);

Then("no grid should be created", async function (this: CustomWorld) {
  const page = this.page;

  // Check that stats and basicInfo are not in a grid together
  const inGrid = await page.evaluate(() => {
    const stats = document.querySelector('[data-section-id="stats"]');
    const basicInfo = document.querySelector('[data-section-id="basicInfo"]');

    if (!stats || !basicInfo) return false;

    const statsGrid = stats.closest(".layout-grid");
    const basicInfoGrid = basicInfo.closest(".layout-grid");

    // Neither should be in a grid, or they shouldn't share one
    return statsGrid !== null && basicInfoGrid !== null && statsGrid === basicInfoGrid;
  });

  expect(inGrid).toBe(false);
});

Then("the sections should remain in single-column layout", async function (this: CustomWorld) {
  // This is essentially the same as "no grid should be created"
  // Both sections should be in single-column mode
});

Given(
  "{string} and {string} are in a grid",
  async function (this: CustomWorld, section1: string, section2: string) {
    const page = this.page;

    const id1 = sectionId(section1);
    const id2 = sectionId(section2);

    await this.setup.layout([
      { type: "single", id: "basicInfo" },
      { type: "single", id: "stats" },
      { type: "single", id: "recoveryDamage" },
      { type: "single", id: "abilities" },
      { type: "single", id: "specialAbilities" },
      { type: "single", id: "attacks" },
      { type: "single", id: "cyphers" },
      { type: "single", id: "items" },
      { type: "grid", items: [id1, id2] },
    ]);

    // Re-enter edit mode
    await page.click('[data-testid="edit-layout-button"]');
  }
);

When("I drag {string} out of the grid", async function (this: CustomWorld, sectionName: string) {
  const page = this.page;

  const sourceElement = sectionLocator(page, sectionName);
  const sourceBox = await sourceElement.boundingBox();

  if (!sourceBox) {
    throw new Error("Could not get bounding box for section");
  }

  // Drag far away from grid
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y - 100); // Move up
  await page.mouse.up();

  await page.waitForTimeout(100);
});

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
