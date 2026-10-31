/**
 * Step definitions for touch long-press dragging of sections
 */

import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";
import {
  LONG_PRESS_HOLD_MS,
  nearTopOf,
  sectionLocator,
  TouchGesture,
  withFullHeightViewport,
} from "../support/sections.js";

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
    // No edge auto-scroll yet, so keep both sections on screen for the gesture.
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
      // The target section is marked as the drop target while the drag is
      // held over it, before the finger lifts.
      await expect(sectionLocator(page, targetName)).toHaveClass(/\bdrop-target\b/);
      await gesture.end();
    });
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
