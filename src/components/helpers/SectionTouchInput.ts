// Touch input of section drags: a long-press on a section becomes a drag,
// via LongPressDrag. Mouse drags use native HTML5 DnD instead.

import { SectionId, isSectionId } from "@/types/layout";
import { LongPressDrag } from "@/components/helpers/LongPressDrag";

/** What the drag controller does with the touch gesture. */
export interface SectionTouchCallbacks {
  isEditMode(): boolean;
  /** A long-press activated: the section is being dragged. */
  onActivate(sectionId: SectionId): void;
  /** The finger is at (`x`, `y`) during the drag. */
  onHover(x: number, y: number): void;
  /** The finger was released: drop. */
  onDrop(): void;
  /** The gesture was abandoned. */
  onAbort(): void;
}

export class SectionTouchInput {
  private readonly longPress: LongPressDrag<SectionId>;

  /**
   * Lit listener object so the touchmove listener is registered non-passive:
   * an active touch drag must be able to preventDefault() the page scroll.
   * Kept as one stable object so lit doesn't re-add it on every render.
   *
   * Bound only while the sheet is in layout edit mode (see `renderSection`):
   * unconditionally, this would make every scroll on the sheet non-passive,
   * even outside layout editing.
   */
  readonly touchMoveListener = {
    handleEvent: (e: TouchEvent): void => this.handleTouchMove(e),
    passive: false,
  };

  /**
   * Lit listener object for touchstart, registered passive: it never calls
   * preventDefault(), so the browser is free to start scrolling immediately.
   * Reads the section id off `currentTarget` so one instance covers every
   * section wrapper.
   */
  readonly touchStartListener = {
    handleEvent: (e: TouchEvent): void => {
      const sectionId = (e.currentTarget as HTMLElement).dataset.sectionId;
      if (sectionId && isSectionId(sectionId)) {
        this.handleTouchStart(e, sectionId);
      }
    },
    passive: true,
  };

  constructor(private readonly callbacks: SectionTouchCallbacks) {
    this.longPress = new LongPressDrag<SectionId>({
      onActivate: (id) => callbacks.onActivate(id),
      onHover: (x, y) => callbacks.onHover(x, y),
      onDrop: () => callbacks.onDrop(),
      onAbort: () => callbacks.onAbort(),
    });
  }

  isActive(): boolean {
    return this.longPress.isActive();
  }

  end(): void {
    this.longPress.end();
  }

  cancel(): void {
    this.longPress.cancel();
  }

  handleContextMenu(e: Event): void {
    if (this.longPress.isActive()) {
      e.preventDefault();
    }
  }

  private handleTouchStart(e: TouchEvent, sectionId: SectionId): void {
    if (!this.callbacks.isEditMode()) return;
    if (e.touches.length !== 1) {
      this.longPress.cancel();
      return;
    }
    const touch = e.touches[0];
    this.longPress.start(sectionId, touch.clientX, touch.clientY);
  }

  private handleTouchMove(e: TouchEvent): void {
    if (e.touches.length !== 1) {
      // A second finger landed outside any section wrapper (touchstart only
      // sees touches inside it) — a pinch, not a drag.
      this.longPress.cancel();
      return;
    }
    if (this.longPress.isActive() && !e.cancelable) {
      // The browser has already committed to scrolling; let it.
      this.longPress.cancel();
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    if (this.longPress.move(touch.clientX, touch.clientY)) {
      e.preventDefault();
    }
  }
}
