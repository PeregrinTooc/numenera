import type { CDPSession, Locator, Page } from "@playwright/test";
import { SECTION_DISPLAY_NAMES, type SectionId } from "../../../src/types/layout.js";

/**
 * Resolve a section's display name as written in Gherkin ("Special Abilities")
 * to its layout id ("specialAbilities").
 */
export function sectionId(name: string): SectionId {
  const entry = (Object.entries(SECTION_DISPLAY_NAMES) as [SectionId, string][]).find(
    ([, displayName]) => displayName === name
  );
  if (!entry) {
    throw new Error(`Unknown section: ${name}`);
  }
  return entry[0];
}

export function sectionLocator(page: Page, name: string): Locator {
  return page.locator(`[data-section-id="${sectionId(name)}"]`);
}

/**
 * Run `action` with the viewport grown to the page's full height (width is
 * unchanged, so the layout is unchanged), scrolled to the top.
 *
 * Why: `locator.dragTo()` scrolls the target into view while the mouse button
 * is held. When source and target aren't both on screen, the page moves under
 * the cursor and Chromium starts the drag on whatever is there instead. With
 * everything on screen, nothing scrolls. Restores the viewport afterwards.
 */
export async function withFullHeightViewport<T>(page: Page, action: () => Promise<T>): Promise<T> {
  const original = page.viewportSize();
  if (!original) {
    throw new Error("withFullHeightViewport needs a page with a fixed viewport");
  }
  const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewportSize({
    width: original.width,
    height: Math.max(original.height, fullHeight),
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  try {
    return await action();
  } finally {
    await page.setViewportSize(original);
  }
}

/** Drag a section with the real mouse and drop it near the top of another. */
export async function dragSectionTo(
  page: Page,
  sourceName: string,
  targetName: string
): Promise<void> {
  await withFullHeightViewport(page, async () => {
    await sectionLocator(page, sourceName).dragTo(sectionLocator(page, targetName), {
      targetPosition: { x: 10, y: 10 },
    });
  });
}

/** How long E2E long-presses hold — safely above the app's 250ms threshold. */
export const LONG_PRESS_HOLD_MS = 300;

export interface Point {
  x: number;
  y: number;
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

  async moveTo(point: Point, steps = 10): Promise<void> {
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
