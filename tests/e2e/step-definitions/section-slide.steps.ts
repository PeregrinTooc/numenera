import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";
import {
  finishSectionSlides,
  sectionId,
  sectionLocator,
  zonePoint,
  type SectionZone,
} from "../support/sections.js";
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

/**
 * Run `check`; if it fails, add every slide recorded so far to the error, and
 * how far the slides still running have got. A slide that never finished was
 * either cancelled (no longer running) or stuck (its time not moving).
 */
async function reportingSlides(world: CustomWorld, check: () => Promise<void>): Promise<void> {
  try {
    await check();
  } catch (error) {
    const progress = (): Promise<unknown> =>
      world.page.evaluate(() => ({
        timeline: document.timeline.currentTime,
        running: document
          .getAnimations()
          .filter((animation) => animation.id === "section-slide")
          .map((animation) => ({
            // Only the app's slides carry this id, and they are keyframe effects
            sectionId: (animation.effect as { target: HTMLElement | null } | null)?.target?.dataset
              .sectionId,
            playState: animation.playState,
            currentTime: animation.currentTime,
          })),
      }));
    const before = await progress();
    // Real time on the test's side: the page's clock may be paused
    await new Promise((resolve) => setTimeout(resolve, 500));
    const report = {
      recorded: await world.page.evaluate(() => window.__sectionSlides ?? []),
      before,
      after: await progress(),
    };
    throw new Error(`${(error as Error).message}\nSlides: ${JSON.stringify(report)}`);
  }
}

/**
 * Wait until the app has started a slide for `name`, then play every running
 * slide to its end, as the clock is run forward for timers. A slide finishes
 * only as frames are drawn, and after a simulated drag WebKit can stop drawing
 * them for an idle page, which a device showing the page never does.
 */
async function finishSlidesOnceStarted(
  world: CustomWorld,
  name: string,
  startedSlides: number
): Promise<void> {
  await expect
    .poll(async () => (await slidesOf(world, name)).length)
    .toBeGreaterThanOrEqual(startedSlides);
  await finishSectionSlides(world.page);
}

Then(
  "the {string} section should slide into its new place",
  async function (this: CustomWorld, name: string) {
    await reportingSlides(this, async () => {
      await finishSlidesOnceStarted(this, name, 1);
      await expect
        .poll(async () =>
          (await slidesOf(this, name)).some((slide) => slide.finished && slide.from !== "none")
        )
        .toBe(true);
    });
  }
);

Then(
  "the {string} section should slide back to where it was",
  async function (this: CustomWorld, name: string) {
    await reportingSlides(this, async () => {
      await finishSlidesOnceStarted(this, name, 2);
      await expect
        .poll(async () => (await slidesOf(this, name)).filter((slide) => slide.finished).length)
        .toBeGreaterThanOrEqual(2);
    });
    const slides = await slidesOf(this, name);
    const [there, back] = [startOffsets(slides[0]), startOffsets(slides[slides.length - 1])];
    // Back the way it came: each axis it moved along, in the other direction
    there.forEach((offset, axis) => {
      if (offset !== 0) expect(Math.sign(back[axis])).toBe(-Math.sign(offset));
    });
  }
);

Then(
  "the {string} section should be drawn above the {string} section while they slide",
  async function (this: CustomWorld, upper: string, lower: string) {
    // Halfway through the slide the two overlap: hit-testing follows paint
    // order, so the section found where they overlap is the one drawn on top
    const onTop = await this.page.evaluate(
      ({ upperId, lowerId }) => {
        const slides = document
          .getAnimations()
          .filter((animation) => animation.id === "section-slide");
        slides.forEach((animation) => {
          animation.pause();
          animation.currentTime = 100;
        });
        const box = (id: string): ReturnType<Element["getBoundingClientRect"]> => {
          const el = document.querySelector(`[data-section-id="${id}"]`);
          if (!el) throw new Error(`No section ${id}`);
          return el.getBoundingClientRect();
        };
        const [a, b] = [box(upperId), box(lowerId)];
        const left = Math.max(a.left, b.left);
        const right = Math.min(a.right, b.right);
        const top = Math.max(a.top, b.top);
        const bottom = Math.min(a.bottom, b.bottom);
        const found =
          left < right && top < bottom
            ? document
                .elementFromPoint((left + right) / 2, (top + bottom) / 2)
                ?.closest<HTMLElement>("[data-section-id]")?.dataset.sectionId
            : "no overlap";
        slides.forEach((animation) => animation.finish());
        return { slides: slides.length, found };
      },
      { upperId: sectionId(upper), lowerId: sectionId(lower) }
    );
    expect(onTop.slides).toBeGreaterThan(0);
    expect(onTop.found).toBe(sectionId(upper));
  }
);

Then("no section should have slid", async function (this: CustomWorld) {
  expect(await this.page.evaluate(() => window.__sectionSlides)).toEqual([]);
});
