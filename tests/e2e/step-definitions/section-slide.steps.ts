/**
 * Step definitions for sections sliding into a live preview and back
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";
import { sectionId, sectionLocator, zonePoint, type SectionZone } from "../support/sections.js";
import type { SectionSlideRecord } from "../support/windowGlobals";

/** The slides recorded for one section, oldest first. */
async function slidesOf(world: CustomWorld, name: string): Promise<SectionSlideRecord[]> {
  const id = sectionId(name);
  return world.page.evaluate(
    (id) => (window.__sectionSlides ?? []).filter((slide) => slide.sectionId === id),
    id
  );
}

/** The x and y offsets a slide starts from, e.g. "translate(-400px, 0px)". */
function startOffsets(slide: SectionSlideRecord): [number, number] {
  const match = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(slide.from);
  if (!match) throw new Error(`Not a translate: ${slide.from}`);
  return [Number(match[1]), Number(match[2])];
}

Given("section slides are recorded", async function (this: CustomWorld) {
  // jsdom can't show a slide and its timing is too short to catch in flight,
  // so record every section slide the app starts, and whether it finished.
  await this.page.evaluate(() => {
    window.__sectionSlides = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      const animation = animate.call(this, keyframes, options);
      if (typeof options === "object" && options.id === "section-slide") {
        const first = Array.isArray(keyframes) ? keyframes[0] : undefined;
        const slide = {
          sectionId: (this as HTMLElement).dataset.sectionId ?? "",
          from: String(first?.transform ?? "none"),
          finished: false,
        };
        window.__sectionSlides?.push(slide);
        animation.finished.then(
          () => (slide.finished = true),
          () => undefined
        );
      }
      return animation;
    };
  });
});

Given("I prefer reduced motion", async function (this: CustomWorld) {
  await this.page.emulateMedia({ reducedMotion: "reduce" });
});

When(
  "I drop the held section onto the {zone} of the {string} section",
  async function (this: CustomWorld, zone: SectionZone, target: string) {
    const page = this.page;
    const box = await sectionLocator(page, target).boundingBox();
    if (!box) throw new Error(`Section ${target} has no bounding box (not visible?)`);
    const point = zonePoint(box, zone);
    // Two separate moves, as when the drag was picked up: Playwright sends
    // dragover for a move only once the previous one has been delivered
    await page.mouse.move(point.x, point.y - 1, { steps: 5 });
    await page.mouse.move(point.x, point.y);
    await page.mouse.up();
  }
);

Then(
  "the {string} section should slide into its new place",
  async function (this: CustomWorld, name: string) {
    await expect
      .poll(async () =>
        (await slidesOf(this, name)).some((slide) => slide.finished && slide.from !== "none")
      )
      .toBe(true);
  }
);

Then(
  "the {string} section should slide back to where it was",
  async function (this: CustomWorld, name: string) {
    await expect
      .poll(async () => (await slidesOf(this, name)).filter((slide) => slide.finished).length)
      .toBeGreaterThanOrEqual(2);
    const slides = await slidesOf(this, name);
    const [there, back] = [startOffsets(slides[0]), startOffsets(slides[slides.length - 1])];
    // Back the way it came: each axis it moved along, in the other direction
    there.forEach((offset, axis) => {
      if (offset !== 0) expect(Math.sign(back[axis])).toBe(-Math.sign(offset));
    });
  }
);

Then("no section should have slid", async function (this: CustomWorld) {
  expect(await this.page.evaluate(() => window.__sectionSlides)).toEqual([]);
});
