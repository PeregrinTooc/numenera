import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";
import { englishText } from "../support/i18nKeys.js";
import {
  growViewportToFullHeight,
  holdSectionOver,
  releaseSectionDrag,
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
    // The live preview appears after the pointer has been still for a while;
    // a paused clock keeps it from appearing until a step advances time.
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 1000);
    // Not restored: the drag stays held into the Then steps.
    await growViewportToFullHeight(page);
    const box = await sectionLocator(page, target).boundingBox();
    if (!box) throw new Error(`Section ${target} has no bounding box (not visible?)`);
    const point = zonePoint(box, zone);
    await holdSectionOver(page, source, point);
    this.heldDropTarget = { name: target, box, point };
  }
);

When("I keep still for a moment", async function (this: CustomWorld) {
  // Past the app's 300 ms live-preview delay
  await this.page.clock.runFor(350);
});

When("I release the section outside the sheet", async function (this: CustomWorld) {
  const page = this.page;
  const sheet = await page.locator(".parchment-container").boundingBox();
  if (!sheet) throw new Error("The sheet has no bounding box");
  // Left of the sheet, at the same height as before: no drop target there
  await page.mouse.move(sheet.x / 2, sheet.y + 100, { steps: 3 });
  await page.mouse.move(sheet.x / 2, sheet.y + 101);
  await page.mouse.up();
  // WebKit may skip dragend here; the app then notices the drag ended from the
  // next pointer move, which a user always makes
  await page.mouse.move(sheet.x / 2, sheet.y + 110);
});

When("I release the section where it is", async function (this: CustomWorld) {
  const held = this.heldDropTarget;
  if (!held) throw new Error("No section is being held over a target");
  await releaseSectionDrag(this.page, held.point);
});

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
