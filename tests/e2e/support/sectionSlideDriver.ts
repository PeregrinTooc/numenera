import { expect, type Page } from "@playwright/test";
import { finishSectionSlides, sectionId } from "./sections.js";
import type { SectionSlideRecord } from "./windowGlobals";

/** Sections sliding into their new places as the sheet is rearranged. */
export interface SectionSlideDriver {
  recordSlides(): Promise<void>;
  preferReducedMotion(): Promise<void>;
  expectSlidIntoPlace(name: string): Promise<void>;
  expectSlidBack(name: string): Promise<void>;
  expectDrawnAbove(upper: string, lower: string): Promise<void>;
  expectNoneSlid(): Promise<void>;
}

/** The x and y offsets a slide starts from, e.g. "translate(-400px, 0px)". */
function startOffsets(slide: SectionSlideRecord): [number, number] {
  const match = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(slide.from);
  if (!match) throw new Error(`Not a translate: ${slide.from}`);
  return [Number(match[1]), Number(match[2])];
}

export class PlaywrightSectionSlideDriver implements SectionSlideDriver {
  constructor(private page: Page) {}

  async recordSlides(): Promise<void> {
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
  }

  async preferReducedMotion(): Promise<void> {
    await this.page.emulateMedia({ reducedMotion: "reduce" });
  }

  async expectSlidIntoPlace(name: string): Promise<void> {
    await this.finishSlidesOnceStarted(name, 1);
    await expect
      .poll(async () =>
        (await this.slidesOf(name)).some((slide) => slide.finished && slide.from !== "none")
      )
      .toBe(true);
  }

  async expectSlidBack(name: string): Promise<void> {
    await this.finishSlidesOnceStarted(name, 2);
    await expect
      .poll(async () => (await this.slidesOf(name)).filter((slide) => slide.finished).length)
      .toBeGreaterThanOrEqual(2);
    const slides = await this.slidesOf(name);
    const [there, back] = [startOffsets(slides[0]), startOffsets(slides[slides.length - 1])];
    // Back the way it came: each axis it moved along, in the other direction
    there.forEach((offset, axis) => {
      if (offset !== 0) expect(Math.sign(back[axis])).toBe(-Math.sign(offset));
    });
  }

  async expectDrawnAbove(upper: string, lower: string): Promise<void> {
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

  async expectNoneSlid(): Promise<void> {
    expect(await this.page.evaluate(() => window.__sectionSlides)).toEqual([]);
  }

  /** The slides recorded for one section, oldest first. */
  private async slidesOf(name: string): Promise<SectionSlideRecord[]> {
    return this.page.evaluate(
      (id) => (window.__sectionSlides ?? []).filter((slide) => slide.sectionId === id),
      sectionId(name)
    );
  }

  /**
   * Wait until the app has started a slide for `name`, then play every running
   * slide to its end, as the clock is run forward for timers. A slide finishes
   * only as frames are drawn, and after a simulated drag WebKit can stop drawing
   * them for an idle page, which a device showing the page never does.
   */
  private async finishSlidesOnceStarted(name: string, startedSlides: number): Promise<void> {
    await expect
      .poll(async () => (await this.slidesOf(name)).length)
      .toBeGreaterThanOrEqual(startedSlides);
    await finishSectionSlides(this.page);
  }
}
