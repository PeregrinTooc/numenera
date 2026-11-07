import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";
import { EDGE_ZONE_PX } from "@/components/helpers/EdgeAutoScroll";
import {
  LONG_PRESS_HOLD_MS,
  nearTopOf,
  sectionId,
  sectionLocator,
  sectionOrder,
  TouchGesture,
  withFullHeightViewport,
  zonePoint,
  type SectionZone,
} from "../support/sections.js";

/** Comfortably below the top auto-scroll zone. */
const EDGE_CLEARANCE_PX = 2 * EDGE_ZONE_PX;

When("I long-press the {string} section", async function (this: CustomWorld, name: string) {
  const section = sectionLocator(this.page, name);
  await section.scrollIntoViewIfNeeded();
  // The gesture is deliberately left held: the Then step asserts the drag state.
  await TouchGesture.start(this.page, await nearTopOf(section));
  await this.page.waitForTimeout(LONG_PRESS_HOLD_MS);
});

Then(
  "the {string} section should be in drag mode",
  async function (this: CustomWorld, name: string) {
    await expect(sectionLocator(this.page, name)).toHaveClass(/\bdragging\b/);
  }
);

When(
  "I long-press the {string} section and drag it above the {string} section",
  async function (this: CustomWorld, sourceName: string, targetName: string) {
    const page = this.page;
    await withFullHeightViewport(page, async () => {
      const gesture = await TouchGesture.start(
        page,
        await nearTopOf(sectionLocator(page, sourceName))
      );
      await page.waitForTimeout(LONG_PRESS_HOLD_MS);
      // A late app timer on a loaded runner could still cancel a pending
      // gesture; confirm the drag actually activated before moving.
      await expect(sectionLocator(page, sourceName)).toHaveClass(/\bdragging\b/);
      await gesture.moveTo(await nearTopOf(sectionLocator(page, targetName)));
      // While the drag is held over the target, the insertion line shows above
      // it; held still for 300 ms, the live preview replaces the line with the
      // result. On a loaded runner a poll can miss the line, so either counts.
      const target = sectionLocator(page, targetName);
      const lineShown = async (): Promise<boolean> =>
        /\bdrop-line-before\b/.test((await target.getAttribute("class")) ?? "");
      const previewShown = async (): Promise<boolean> => {
        const order = await sectionOrder(page);
        return order.indexOf(sectionId(sourceName)) === order.indexOf(sectionId(targetName)) - 1;
      };
      await expect.poll(async () => (await lineShown()) || (await previewShown())).toBe(true);
      await gesture.end();
    });
  }
);

When(
  "I long-press the {string} section and drag it onto the {zone} of the {string} section",
  async function (this: CustomWorld, sourceName: string, zone: SectionZone, targetName: string) {
    const page = this.page;
    await withFullHeightViewport(page, async () => {
      const gesture = await TouchGesture.start(
        page,
        await nearTopOf(sectionLocator(page, sourceName))
      );
      await page.waitForTimeout(LONG_PRESS_HOLD_MS);
      await expect(sectionLocator(page, sourceName)).toHaveClass(/\bdragging\b/);
      const box = await sectionLocator(page, targetName).boundingBox();
      if (!box) throw new Error(`Section ${targetName} has no bounding box (not visible?)`);
      await gesture.moveTo(zonePoint(box, zone));
      await gesture.end();
    });
  }
);

When(
  "I long-press the {string} section and hold it at the top edge until the {string} section is on screen",
  async function (this: CustomWorld, sourceName: string, targetName: string) {
    const page = this.page;
    const source = sectionLocator(page, sourceName);
    const target = sectionLocator(page, targetName);
    await source.scrollIntoViewIfNeeded();
    // The point of the scenario: the drop target starts off screen.
    await expect(target).not.toBeInViewport();

    const gesture = await TouchGesture.start(page, await nearTopOf(source));
    this.heldTouchGesture = gesture;
    await page.waitForTimeout(LONG_PRESS_HOLD_MS);
    await expect(source).toHaveClass(/\bdragging\b/);
    const from = await nearTopOf(source);
    await gesture.moveTo({ x: from.x, y: 4 });
    // Held still at the edge, the page keeps scrolling; wait until the target
    // has come down past the edge zone, so dragging onto it stops the scroll.
    await expect
      .poll(async () => (await target.boundingBox())?.y ?? -Infinity, { timeout: 10000 })
      .toBeGreaterThan(EDGE_CLEARANCE_PX);
  }
);

When(
  "I drag it above the {string} section and release it",
  async function (this: CustomWorld, targetName: string) {
    const gesture = this.heldTouchGesture;
    if (!gesture) throw new Error("No touch drag is held");
    const box = await sectionLocator(this.page, targetName).boundingBox();
    if (!box) throw new Error(`Section ${targetName} has no bounding box (not visible?)`);
    await gesture.moveTo(zonePoint(box, "top edge"));
    await gesture.end();
    this.heldTouchGesture = undefined;
  }
);

When(
  "I swipe from the {string} section towards the {string} section",
  async function (this: CustomWorld, sourceName: string, targetName: string) {
    const page = this.page;
    const source = sectionLocator(page, sourceName);
    const target = sectionLocator(page, targetName);
    await source.scrollIntoViewIfNeeded();

    this.scrollYBeforeSwipe = await page.evaluate(() => window.scrollY);

    const from = await nearTopOf(source);
    const targetBox = await target.boundingBox();
    // Swipe a fixed, generous distance in the target's direction rather than
    // straight to its (possibly off-screen) position: far enough to scroll a
    // normal, un-enlarged mobile viewport.
    const direction = targetBox && targetBox.y < from.y ? -1 : 1;
    const to = { x: from.x, y: from.y + direction * 400 };

    const gesture = await TouchGesture.start(page, from);
    await gesture.moveTo(to);
    await gesture.end();
  }
);

Then("the page should have scrolled", async function (this: CustomWorld) {
  const page = this.page;
  const before = this.scrollYBeforeSwipe;
  if (before === undefined) {
    throw new Error("No scrollY recorded before the swipe");
  }
  const after = await page.evaluate(() => window.scrollY);
  expect(after).not.toBe(before);
});
