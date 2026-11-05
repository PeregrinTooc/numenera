// The live preview of a section drag: after a drop intent holds still, the
// sheet shows its result without saving it.

import { Layout, type SectionId } from "@/types/layout";

/** How long a drop intent must hold before the sheet shows its result. */
export const LIVE_PREVIEW_DELAY_MS = 300;

/**
 * How far the pointer must move after a live preview before hovers count
 * again. The jump moves the sections under a still pointer, and browsers keep
 * firing dragover while it rests: without this the layout could jump again.
 */
export const LIVE_PREVIEW_SETTLE_PX = 8;

interface Point {
  x: number;
  y: number;
}

export class LivePreview {
  /**
   * The layout shown after the intent held still (not saved until the drop),
   * and the section it keeps where it was on screen.
   */
  private shown: { layout: Layout; keptStill: SectionId } | null = null;
  /** Pending switch to the live preview of the current intent. */
  private dwellTimer: ReturnType<typeof setTimeout> | null = null;
  /** Where the pointer was at the last hover. */
  private lastPointer: Point | null = null;
  /** Where the pointer was when the live preview appeared, until it moves on. */
  private anchor: Point | null = null;
  /**
   * The sections sliding into the live preview, until they have arrived.
   * Their boxes are in motion, so hovers are ignored meanwhile.
   */
  private slide: Promise<void> | null = null;

  /** The layout shown by the live preview; null when none is shown. */
  shownLayout(): Layout | null {
    return this.shown?.layout ?? null;
  }

  /** The section the live preview keeps still; null when none is shown. */
  keptStill(): SectionId | null {
    return this.shown?.keptStill ?? null;
  }

  /** The layout hovers are resolved against: the live preview, else `saved` */
  workingLayout(saved: Layout): Layout {
    return this.shown?.layout ?? saved;
  }

  /**
   * The pointer is at (`x`, `y`): note it, and say whether this hover is to be
   * ignored (the sections are still sliding, or the pointer has not yet left
   * the spot where the preview appeared).
   */
  shouldIgnoreHover(x: number, y: number): boolean {
    this.lastPointer = { x, y };
    if (this.slide) return true;
    if (this.anchor) {
      const { x: ax, y: ay } = this.anchor;
      if (Math.hypot(x - ax, y - ay) <= LIVE_PREVIEW_SETTLE_PX) return true;
      this.anchor = null;
    }
    return false;
  }

  /**
   * Start waiting for the current intent to hold still, then call `onHold`;
   * any pending wait for an earlier intent is dropped. Without an intent
   * (`armed` false) nothing is awaited: a no-op zone keeps the current live
   * preview.
   */
  restartDwell(armed: boolean, onHold: () => void): void {
    this.cancelDwell();
    if (!armed) return;
    this.dwellTimer = setTimeout(() => {
      this.dwellTimer = null;
      onHold();
    }, LIVE_PREVIEW_DELAY_MS);
  }

  /**
   * Show `layout`, keeping section `keptStill` where it was on screen; later
   * hovers build on it until the pointer moves on.
   */
  show(layout: Layout | null, keptStill: SectionId): void {
    this.shown = layout && { layout, keptStill };
    this.anchor = this.lastPointer;
  }

  /**
   * Ignore hovers until `slide` (the sections moving into place) is done, then
   * hand `onArrived` the pointer where it rests: it may have stopped over a new
   * zone meanwhile and not move again.
   */
  followSlide(slide: Promise<void> | null, onArrived: (x: number, y: number) => void): void {
    this.slide = slide;
    void slide?.then(() => {
      if (this.slide !== slide) return;
      this.slide = null;
      if (!this.lastPointer) throw new Error("A live preview slide follows a hover");
      onArrived(this.lastPointer.x, this.lastPointer.y);
    });
  }

  /** Forget the live preview and everything tracked for it. */
  reset(): void {
    this.cancelDwell();
    this.shown = null;
    this.anchor = null;
    this.slide = null;
    this.lastPointer = null;
  }

  private cancelDwell(): void {
    if (this.dwellTimer !== null) clearTimeout(this.dwellTimer);
    this.dwellTimer = null;
  }
}
