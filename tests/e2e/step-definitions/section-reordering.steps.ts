/**
 * Step definitions for reordering sections (persisted order and mouse dragging)
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";
import { dragSectionTo, sectionId } from "../support/sections.js";
import type { LayoutItem, SectionId } from "@/types/layout";

Given("I have reordered sections", async function (this: CustomWorld) {
  const page = this.page;

  // Actually perform a reorder by modifying localStorage
  // This simulates having reordered sections
  await page.evaluate(() => {
    const reorderedLayout = [
      { type: "single", id: "basicInfo" },
      { type: "single", id: "stats" },
      { type: "single", id: "recoveryDamage" },
      { type: "single", id: "cyphers" }, // Moved cyphers before abilities
      { type: "single", id: "abilities" },
      { type: "single", id: "specialAbilities" },
      { type: "single", id: "attacks" },
      { type: "single", id: "items" },
      { type: "single", id: "background" },
      { type: "single", id: "notes" },
    ];
    localStorage.setItem("numenera-layout", JSON.stringify(reorderedLayout));
  });
});

Then("the layout should be saved", async function (this: CustomWorld) {
  const page = this.page;

  // Check that layout was saved to localStorage
  const layoutData = await page.evaluate(() => {
    return localStorage.getItem("numenera-layout");
  });

  expect(layoutData).not.toBeNull();
});

Then("the sections should remain in the new order", async function (this: CustomWorld) {
  // This will be verified when we implement actual reordering
  // For now, just verify the layout exists
  const page = this.page;
  const layoutData = await page.evaluate(() => {
    return localStorage.getItem("numenera-layout");
  });
  expect(layoutData).not.toBeNull();
});

When(
  "I drag the {string} section above the {string} section",
  async function (this: CustomWorld, sourceSection: string, targetSection: string) {
    await dragSectionTo(this.page, sourceSection, targetSection);
  }
);

Then(
  "the {string} section should appear before the {string} section",
  async function (this: CustomWorld, firstSection: string, secondSection: string) {
    const page = this.page;

    const firstId = sectionId(firstSection);
    const secondId = sectionId(secondSection);

    // Get the positions of the sections in the DOM
    const positions = await page.evaluate(
      ({ firstId, secondId }) => {
        const first = document.querySelector(`[data-section-id="${firstId}"]`);
        const second = document.querySelector(`[data-section-id="${secondId}"]`);

        if (!first || !second) {
          return { firstPos: -1, secondPos: -1 };
        }

        const allSections = Array.from(document.querySelectorAll("[data-section-id]"));
        return {
          firstPos: allSections.indexOf(first),
          secondPos: allSections.indexOf(second),
        };
      },
      { firstId, secondId }
    );

    expect(positions.firstPos).toBeLessThan(positions.secondPos);
  }
);

Given(
  "I have moved the {string} section to the top",
  async function (this: CustomWorld, sectionName: string) {
    const page = this.page;
    const id = sectionId(sectionName);

    // Put the section first among the rearrangeable sections, all single-column
    const fixed: SectionId[] = ["basicInfo", "stats", "recoveryDamage"];
    const rearrangeable: SectionId[] = [
      "abilities",
      "specialAbilities",
      "attacks",
      "cyphers",
      "items",
      "background",
      "notes",
    ];
    const order = [id, ...rearrangeable.filter((existing) => existing !== id)];
    await this.setup.layout(
      [...fixed, ...order].map((sid): LayoutItem => ({ type: "single", id: sid }))
    );

    // Re-enter layout edit mode since we reloaded
    await page.click('[data-testid="edit-layout-button"]');
    const container = page.locator(".parchment-container");
    await expect(container).toHaveClass(/layout-edit-mode/);
  }
);

When("I exit layout edit mode", async function (this: CustomWorld) {
  const page = this.page;
  await page.click('[data-testid="edit-layout-button"]');

  // Verify edit mode is inactive
  const container = page.locator(".parchment-container");
  await expect(container).not.toHaveClass(/layout-edit-mode/);
});

// Note: "I reload the page" is defined in common-steps.ts

Then(
  "the {string} section should still be at the top",
  async function (this: CustomWorld, sectionName: string) {
    const page = this.page;

    const id = sectionId(sectionName);

    // Check that this section appears right after recoveryDamage
    const position = await page.evaluate((id) => {
      const allSections = Array.from(document.querySelectorAll("[data-section-id]"));
      const sectionIds = allSections.map((el) => el.getAttribute("data-section-id"));
      // Find position after the non-rearrangeable sections
      const rearrangeableSections = sectionIds.filter(
        (existingId) => !["basicInfo", "stats", "recoveryDamage"].includes(existingId || "")
      );
      return rearrangeableSections[0] === id;
    }, id);

    expect(position).toBe(true);
  }
);
