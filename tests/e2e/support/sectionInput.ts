import { expect, type Page } from "@playwright/test";
import {
  holdSectionOver,
  nearTopOf,
  releaseSectionDrag,
  sectionLocator,
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

  /** Puts a finger on the section's heading and holds it until the section is in drag mode. */
  private async pressAndHold(source: string): Promise<TouchGesture> {
    const section = sectionLocator(this.page, source);
    const gesture = await TouchGesture.start(this.page, await nearTopOf(section));
    await this.page.clock.runFor(LONG_PRESS_MS);
    await expect(section).toHaveClass(/\bdragging\b/);
    return gesture;
  }
}
