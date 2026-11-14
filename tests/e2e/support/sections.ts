import type { CDPSession, Locator, Page } from "@playwright/test";
import { SECTION_IDS, type SectionId } from "@/types/layout";
import { englishText } from "./i18nKeys";

/** The id of the section whose English heading (`layout.sections.*`) is `name`. */
export function sectionId(name: string): SectionId {
  const id = SECTION_IDS.find((candidate) => englishText(`layout.sections.${candidate}`) === name);
  if (!id) {
    throw new Error(`Unknown section: ${name}`);
  }
  return id;
}

export function sectionLocator(page: Page, name: string): Locator {
  return page.locator(`[data-section-id="${sectionId(name)}"]`);
}

/** The ids of the sections on the sheet, in document order. */
export function sectionOrder(page: Page): Promise<string[]> {
  return page
    .locator("[data-section-id]")
    .evaluateAll((sections) => sections.map((s) => s.getAttribute("data-section-id") ?? ""));
}

export interface Point {
  x: number;
  y: number;
}

export type SectionZone = "top edge" | "bottom edge" | "middle left" | "middle right";

/**
 * A point inside `zone` of a section's bounding box: the edges at 10 % / 90 %
 * of its height (centred horizontally), the middles at 25 % / 75 % of its
 * width and 60 % of its height. Every point stays clear of the zone
 * boundaries at 25 %, 50 % and 75 % of the height: browsers report whole-pixel
 * pointer positions, so a point aimed at exactly 50 % can land just above the
 * narrow layout's top/bottom split.
 */
export function zonePoint(
  box: { x: number; y: number; width: number; height: number },
  zone: SectionZone
): Point {
  const fractions: Record<SectionZone, [number, number]> = {
    "top edge": [0.5, 0.1],
    "bottom edge": [0.5, 0.9],
    "middle left": [0.25, 0.6],
    "middle right": [0.75, 0.6],
  };
  const [fx, fy] = fractions[zone];
  return { x: box.x + box.width * fx, y: box.y + box.height * fy };
}

/**
 * Run `action` with the page's clock paused, so timers (the 300 ms live preview,
 * the 250 ms long-press) fire only when the action advances the clock.
 *
 * On a busy machine the preview's delay could otherwise run out between the
 * last move and the release. Its re-render detaches the element the last
 * dragover reached, which is where the browser sends the drop, so the drop is
 * lost and the drag just ends.
 */
export async function withPausedClock<T>(page: Page, action: () => Promise<T>): Promise<T> {
  await page.clock.install();
  // Ahead of the page's time, which runs on while the call travels: pausing
  // in the page's past throws
  const pageNow = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(pageNow + 1000);
  try {
    return await action();
  } finally {
    await page.clock.resume();
  }
}

/**
 * Press on the source's heading (a card inside it would start the card's own
 * drag instead, as for a user) and drag onto `point`, leaving the button held.
 */
export async function holdSectionOver(page: Page, sourceName: string, point: Point): Promise<void> {
  const start = await nearTopOf(sectionLocator(page, sourceName));
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 10, start.y + 10); // start the drag
  // The browser enters drag mode asynchronously; pointer moves before that
  // fire no dragover at all.
  await page.locator(`[data-section-id="${sectionId(sourceName)}"].dragging`).waitFor();
  // Playwright delivers dragover for a separate move once the drag is
  // live, so arrive in two moves: most of the way, then onto the point.
  await page.mouse.move(point.x, point.y - 1, { steps: 5 });
  await page.mouse.move(point.x, point.y);
}

/** Play every running section slide to its end at once. */
export async function finishSectionSlides(page: Page): Promise<void> {
  await page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => animation.id === "section-slide")
      .forEach((animation) => animation.finish())
  );
}

/**
 * Release the held drag at `point`. Browsers keep firing dragover while a drag
 * rests, so the drop lands on what is under the pointer now, after a live
 * preview has re-rendered the sheet; Playwright fires dragover only on moves,
 * and in WebKit only from the second, so two one-pixel moves stand in for it.
 *
 * A live preview's slide is finished first: in Chromium, a drag that has a
 * dragover while the slide runs ends as the slide finishes if the drop has not
 * come by then, and on a busy machine it may not have.
 */
export async function releaseSectionDrag(page: Page, point: Point): Promise<void> {
  await finishSectionSlides(page);
  await page.mouse.move(point.x + 1, point.y);
  await page.mouse.move(point.x + 2, point.y);
  await page.mouse.up();
}

/**
 * A point just inside the top-left of an element — on the section heading,
 * away from nested cards and inputs.
 */
export async function nearTopOf(locator: Locator): Promise<Point> {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Element has no bounding box (not visible?)");
  }
  return { x: box.x + 20, y: box.y + 10 };
}

/**
 * A single-finger touch driven through Chromium's real input pipeline
 * (CDP Input.dispatchTouchEvent), so scrolling and non-passive touchmove
 * listeners behave as on a device. Coordinates are viewport CSS pixels.
 */
export class TouchGesture {
  private constructor(
    private readonly cdp: CDPSession,
    private current: Point
  ) {}

  static async start(page: Page, point: Point): Promise<TouchGesture> {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
    return new TouchGesture(cdp, point);
  }

  /**
   * Move the finger to `point` in `steps` evenly spaced moves. Drags take one:
   * each move is a CDP round trip, slow on a loaded runner, and a drag that
   * rests 300 ms over a section on the way shows that section's live preview,
   * rearranging the sheet under the rest of the move. Chromium does not
   * deliver moves within 15 px of where the touch started.
   */
  async moveTo(point: Point, steps = 1): Promise<void> {
    const from = this.current;
    for (let i = 1; i <= steps; i++) {
      const next = {
        x: from.x + ((point.x - from.x) * i) / steps,
        y: from.y + ((point.y - from.y) * i) / steps,
      };
      await this.cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [next] });
    }
    this.current = point;
  }

  async end(): Promise<void> {
    await this.cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await this.cdp.detach();
  }
}
