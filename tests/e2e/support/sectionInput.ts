import { expect, type Page } from "@playwright/test";
import { EDGE_ZONE_PX } from "@/components/helpers/EdgeAutoScroll";
import {
  finishSectionSlides,
  growViewportToFullHeight,
  holdSectionOver,
  nearTopOf,
  releaseSectionDrag,
  sectionLocator,
  sectionOrder,
  TouchGesture,
  withFullHeightViewport,
  withPausedClock,
  zonePoint,
  type SectionZone,
} from "./sections.js";

export interface DropPlace {
  target: string;
  edge: SectionZone;
}

/** How a person moves sections around: with a pointer, or with a finger. */
export interface SectionInput {
  dragSection(source: string, onto: DropPlace): Promise<void>;
}

/** A section being dragged by a finger that is still down. */
export interface HeldDrag {
  dropOnto(onto: DropPlace): Promise<void>;
}

async function boxOf(
  page: Page,
  name: string
): Promise<{ x: number; y: number; width: number; height: number }> {
  const box = await sectionLocator(page, name).boundingBox();
  if (!box) throw new Error(`Section ${name} has no bounding box (not visible?)`);
  return box;
}

async function expectDragEnded(page: Page, source: string): Promise<void> {
  await expect(sectionLocator(page, source)).not.toHaveClass(/\bdragging\b/);
}

/** Drops the section straight away, before the live preview appears. */
export class MouseInput implements SectionInput {
  constructor(private page: Page) {}

  async dragSection(source: string, { target, edge }: DropPlace): Promise<void> {
    const page = this.page;
    await withFullHeightViewport(page, async () => {
      const point = zonePoint(await boxOf(page, target), edge);
      await withPausedClock(page, async () => {
        await holdSectionOver(page, source, point);
        await releaseSectionDrag(page, point);
      });
    });
    await expectDragEnded(page, source);
  }
}

/** Comfortably below the top auto-scroll zone. */
const EDGE_CLEARANCE_PX = 2 * EDGE_ZONE_PX;

/** The app's long-press delay, advanced on the paused page clock. */
const LONG_PRESS_MS = 250;

export class TouchInput implements SectionInput {
  constructor(private page: Page) {}

  async dragSection(source: string, { target, edge }: DropPlace): Promise<void> {
    const page = this.page;
    await withFullHeightViewport(page, async () => {
      await withPausedClock(page, async () => {
        const gesture = await this.pressAndHold(source);
        await gesture.moveTo(zonePoint(await boxOf(page, target), edge));
        await gesture.end();
      });
    });
    await expectDragEnded(page, source);
  }

  /** Leaves the finger down on the section once it is in drag mode. */
  async longPress(source: string): Promise<void> {
    await sectionLocator(this.page, source).scrollIntoViewIfNeeded();
    await withPausedClock(this.page, () => this.pressAndHold(source));
  }

  async expectInDragMode(name: string): Promise<void> {
    await expect(sectionLocator(this.page, name)).toHaveClass(/\bdragging\b/);
  }

  /**
   * Drags the section to the top of the window and keeps it there until the
   * page, auto-scrolling, has brought `until` down past the edge zone, so
   * dragging onto it stops the scroll.
   */
  async holdAtTopEdge(source: string, until: string): Promise<HeldDrag> {
    const page = this.page;
    const section = sectionLocator(page, source);
    const destination = sectionLocator(page, until);
    await section.scrollIntoViewIfNeeded();
    // The point of the scenario: the drop target starts off screen.
    await expect(destination).not.toBeInViewport();

    const from = await nearTopOf(section);
    const gesture = await withPausedClock(page, () => this.pressAndHold(source));
    await gesture.moveTo({ x: from.x, y: 4 });
    await expect
      .poll(async () => (await destination.boundingBox())?.y ?? -Infinity, { timeout: 10000 })
      .toBeGreaterThan(EDGE_CLEARANCE_PX);
    return new HeldTouchDrag(page, source, gesture);
  }

  /** Drags the section onto the place and holds still until the live preview has rearranged the sheet. */
  async holdOver(source: string, { target, edge }: DropPlace): Promise<HeldDrag> {
    const page = this.page;
    // Not restored: the drag stays held into the next step
    await growViewportToFullHeight(page);
    const orderBefore = await sectionOrder(page);
    const gesture = await withPausedClock(page, () => this.pressAndHold(source));
    await gesture.moveTo(zonePoint(await boxOf(page, target), edge));
    await expect.poll(() => sectionOrder(page)).not.toEqual(orderBefore);
    await finishSectionSlides(page);
    return new HeldTouchDrag(page, source, gesture);
  }

  /** A quick swipe from the section towards another, which scrolls rather than drags. */
  async swipe(source: string, towards: string): Promise<void> {
    const page = this.page;
    const section = sectionLocator(page, source);
    await section.scrollIntoViewIfNeeded();
    const from = await nearTopOf(section);
    const targetBox = await sectionLocator(page, towards).boundingBox();
    // A fixed, generous distance in the target's direction rather than
    // straight to its (possibly off-screen) position: far enough to scroll a
    // normal, un-enlarged mobile viewport.
    const direction = targetBox && targetBox.y < from.y ? -1 : 1;
    const gesture = await TouchGesture.start(page, from);
    // A scroll, unlike a drag, needs a stream of moves
    await gesture.moveTo({ x: from.x, y: from.y + direction * 400 }, 10);
    await gesture.end();
  }

  scrollPosition(): Promise<number> {
    return this.page.evaluate(() => window.scrollY);
  }

  async expectScrolledFrom(scrollY: number): Promise<void> {
    await expect.poll(() => this.scrollPosition()).not.toBe(scrollY);
  }

  /** Puts a finger on the section's heading and holds it until the section is in drag mode. */
  private async pressAndHold(source: string): Promise<TouchGesture> {
    const section = sectionLocator(this.page, source);
    const gesture = await TouchGesture.start(this.page, await nearTopOf(section));
    await this.page.clock.runFor(LONG_PRESS_MS);
    await expect(section).toHaveClass(/\bdragging\b/);
    return gesture;
  }
}

class HeldTouchDrag implements HeldDrag {
  constructor(
    private page: Page,
    private source: string,
    private gesture: TouchGesture
  ) {}

  async dropOnto({ target, edge }: DropPlace): Promise<void> {
    await this.gesture.moveTo(zonePoint(await boxOf(this.page, target), edge));
    await this.gesture.end();
    await expectDragEnded(this.page, this.source);
  }
}
