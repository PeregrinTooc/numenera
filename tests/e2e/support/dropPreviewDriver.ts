import { expect, type Page } from "@playwright/test";
import { LIVE_PREVIEW_DELAY_MS } from "@/components/helpers/LivePreview";
import { englishText } from "./i18nKeys.js";
import type { ClockDriver } from "./clockDriver.js";
import type { ViewportDriver } from "./viewportDriver.js";
import type { DropPlace } from "./sectionInput.js";
import {
  finishSectionSlides,
  holdSectionOver,
  releaseSectionDrag,
  sectionBox,
  sectionId,
  sectionLocator,
  zonePoint,
  type Box,
  type Point,
} from "./sections.js";

/** A section held with the mouse over a place on the sheet, where it stood when the drag arrived. */
export interface HeldOver {
  source: string;
  target: string;
  box: Box;
  point: Point;
}

export type GhostSide = "right" | "replace";

/** A section dragged with the mouse and held over another, and the live preview that shows. */
export interface DropPreviewDriver {
  bringToTopOfWindow(name: string): Promise<void>;
  holdOver(source: string, over: DropPlace): Promise<HeldOver>;
  /** Grows the window to the whole sheet first, and leaves it grown while the drag is held. */
  holdOverInFullWindow(source: string, over: DropPlace): Promise<HeldOver>;
  keepStill(): Promise<void>;
  dropOnto(onto: DropPlace): Promise<void>;
  releaseOutsideSheet(): Promise<void>;
  releaseWhereItIs(held: HeldOver): Promise<void>;
  expectGhost(target: string, side: GhostSide, ghost: string): Promise<void>;
  expectRowPreviewsBumped(member: string, bumped: string): Promise<void>;
  expectNoPreview(source: string): Promise<void>;
  /** The preview is an overlay: it must not move the section under the pointer, or the zone would change with every frame. */
  expectTargetUnmoved(held: HeldOver): Promise<void>;
  expectNotMovedVertically(name: string, held: HeldOver): Promise<void>;
}

function sectionHeading(name: string): string {
  return englishText(`layout.sections.${sectionId(name)}`);
}

export class PlaywrightDropPreviewDriver implements DropPreviewDriver {
  constructor(
    private page: Page,
    private viewport: ViewportDriver,
    private clock: ClockDriver
  ) {}

  async bringToTopOfWindow(name: string): Promise<void> {
    await sectionLocator(this.page, name).evaluate((section) =>
      section.scrollIntoView({ block: "start" })
    );
  }

  async holdOver(source: string, { target, edge }: DropPlace): Promise<HeldOver> {
    const box = await sectionBox(this.page, target);
    const point = zonePoint(box, edge);
    await holdSectionOver(this.page, source, point);
    return { source, target, box, point };
  }

  async holdOverInFullWindow(source: string, over: DropPlace): Promise<HeldOver> {
    await this.viewport.growToFullHeight();
    return this.holdOver(source, over);
  }

  async keepStill(): Promise<void> {
    await this.clock.advance(LIVE_PREVIEW_DELAY_MS);
  }

  async dropOnto({ target, edge }: DropPlace): Promise<void> {
    const point = zonePoint(await sectionBox(this.page, target), edge);
    // Two separate moves, as when the drag was picked up: Playwright sends
    // dragover for a move only once the previous one has been delivered
    await this.page.mouse.move(point.x, point.y - 1, { steps: 5 });
    await this.page.mouse.move(point.x, point.y);
    await this.page.mouse.up();
  }

  async releaseOutsideSheet(): Promise<void> {
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
  }

  async releaseWhereItIs(held: HeldOver): Promise<void> {
    await releaseSectionDrag(this.page, held.point);
  }

  async expectGhost(target: string, side: GhostSide, ghost: string): Promise<void> {
    const section = sectionLocator(this.page, target);
    await expect(section).toHaveClass(new RegExp(`\\bdrop-ghost-${side}\\b`));
    await expect(section).toHaveAttribute("data-drop-ghost-label", sectionHeading(ghost));
  }

  async expectRowPreviewsBumped(member: string, bumped: string): Promise<void> {
    const row = this.page.locator(
      `[data-testid^="layout-grid-"]:has(> [data-section-id="${sectionId(member)}"])`
    );
    await expect(row).toHaveClass(/\bdrop-bump-below\b/);
    await expect(row).toHaveAttribute("data-drop-bump-label", sectionHeading(bumped));
  }

  async expectNoPreview(source: string): Promise<void> {
    // Wait for the drag to be under way before asserting that no preview appeared.
    await expect(sectionLocator(this.page, source)).toHaveClass(/\bdragging\b/);
    await expect(
      this.page.locator('[class*="drop-line-"], [class*="drop-ghost-"], [class*="drop-bump-"]')
    ).toHaveCount(0);
  }

  async expectTargetUnmoved(held: HeldOver): Promise<void> {
    expect(await sectionLocator(this.page, held.target).boundingBox()).toEqual(held.box);
  }

  async expectNotMovedVertically(name: string, held: HeldOver): Promise<void> {
    // Where it ends up: a slide starts each section at its old place
    await finishSectionSlides(this.page);
    const box = await sectionBox(this.page, name);
    expect(Math.abs(box.y - held.box.y)).toBeLessThanOrEqual(1);
  }
}
