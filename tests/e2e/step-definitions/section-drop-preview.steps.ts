/**
 * Step definitions for the preview shown while a section is held over another
 */

import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";
import { englishText } from "../support/i18nKeys.js";
import {
  growViewportToFullHeight,
  nearTopOf,
  sectionId,
  sectionLocator,
  zonePoint,
  type SectionZone,
} from "../support/sections.js";

function sectionName(name: string): string {
  return englishText(`layout.sections.${sectionId(name)}`);
}

/**
 * The preview is an overlay: it must not move the section under the pointer,
 * or the zone would change with every frame (Review Focus 5).
 */
async function expectHeldTargetUnmoved(world: CustomWorld): Promise<void> {
  const held = world.heldDropTarget;
  if (!held) throw new Error("No section is being held over a target");
  expect(await sectionLocator(world.page, held.name).boundingBox()).toEqual(held.box);
}

When(
  "I hold the {string} section over the {zone} of the {string} section",
  async function (this: CustomWorld, source: string, zone: SectionZone, target: string) {
    const page = this.page;
    // Not restored: the drag stays held into the Then steps.
    await growViewportToFullHeight(page);
    const box = await sectionLocator(page, target).boundingBox();
    if (!box) throw new Error(`Section ${target} has no bounding box (not visible?)`);
    const start = await nearTopOf(sectionLocator(page, source));
    const point = zonePoint(box, zone);

    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 10, start.y + 10); // start the drag
    // The browser enters drag mode asynchronously; pointer moves before that
    // fire no dragover at all.
    await expect(sectionLocator(page, source)).toHaveClass(/\bdragging\b/);
    // Playwright delivers dragover for a separate move once the drag is
    // live, so arrive in two moves: most of the way, then onto the point.
    await page.mouse.move(point.x, point.y - 1, { steps: 5 });
    await page.mouse.move(point.x, point.y);
    this.heldDropTarget = { name: target, box };
  }
);

Then(
  "the {string} section should preview {string} on its right",
  async function (this: CustomWorld, target: string, ghost: string) {
    const section = sectionLocator(this.page, target);
    await expect(section).toHaveClass(/\bdrop-ghost-right\b/);
    await expect(section).toHaveAttribute("data-drop-ghost-label", sectionName(ghost));
    await expectHeldTargetUnmoved(this);
  }
);

Then(
  "the {string} section should preview {string} in its place",
  async function (this: CustomWorld, target: string, ghost: string) {
    const section = sectionLocator(this.page, target);
    await expect(section).toHaveClass(/\bdrop-ghost-replace\b/);
    await expect(section).toHaveAttribute("data-drop-ghost-label", sectionName(ghost));
    await expectHeldTargetUnmoved(this);
  }
);

Then(
  "the row of {string} should preview {string} below it",
  async function (this: CustomWorld, member: string, bumped: string) {
    const row = this.page.locator(
      `[data-testid^="layout-grid-"]:has(> [data-section-id="${sectionId(member)}"])`
    );
    await expect(row).toHaveClass(/\bdrop-bump-below\b/);
    await expect(row).toHaveAttribute("data-drop-bump-label", sectionName(bumped));
  }
);

Then("no drop preview should be shown", async function (this: CustomWorld) {
  // Wait for the drag to be under way before asserting that no preview appeared.
  await expect(sectionLocator(this.page, "Cyphers")).toHaveClass(/\bdragging\b/);
  await expect(
    this.page.locator('[class*="drop-line-"], [class*="drop-ghost-"], [class*="drop-bump-"]')
  ).toHaveCount(0);
});
