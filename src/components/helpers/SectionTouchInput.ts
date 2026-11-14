// Touch input of section drags: a long-press on a section becomes a drag,
// via LongPressDrag. Mouse drags use native HTML5 DnD instead.

import { SectionId, isSectionId } from "@/types/layout";
import { LongPressDrag } from "@/components/helpers/LongPressDrag";
import type { Clock } from "@/services/clock";
import type { SectionDragCallbacks } from "@/components/helpers/sectionDragInput";

/** What the drag session does with the touch gesture. */
export interface SectionTouchCallbacks extends SectionDragCallbacks {
  /** The finger is at (`x`, `y`) during the drag. */
  onHover(x: number, y: number): void;
}

export class SectionTouchInput {
  private readonly longPress: LongPressDrag<SectionId>;

  /**
   * Lit listener object that registers touchmove non-passive on the section
   * wrappers, and does nothing else: browsers decide when a touch starts
   * whether its moves may be prevented, from the non-passive listeners under
   * it, and an active touch drag must preventDefault() the page scroll. The
   * moves themselves are handled by `gestureListener`. Kept as one stable
   * object so lit doesn't re-add it on every render.
   *
   * Bound only while the sheet is in layout edit mode (see `renderSection`):
   * unconditionally, this would make every scroll on the sheet non-passive,
   * even outside layout editing.
   */
  readonly touchMoveListener = {
    handleEvent: (): void => {},
    passive: false,
  };

  /**
   * Follows a touch on the element it started on, from touchstart to its end.
   * Browsers send the whole touch there, even once a re-render (a live
   * preview) has taken that element off the sheet, out of the wrapper's hearing.
   */
  private readonly gestureListener = {
    handleEvent: (e: TouchEvent): void => {
      if (e.type === "touchmove") this.handleTouchMove(e);
      else if (e.type === "touchend") this.end();
      else this.cancel();
    },
  };

  /** The element the followed touch started on. */
  private followed: EventTarget | null = null;

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

  constructor(
    private readonly callbacks: SectionTouchCallbacks,
    clock: Clock
  ) {
    this.longPress = new LongPressDrag<SectionId>(
      {
        onActivate: (id) => callbacks.onActivate(id),
        onHover: (x, y) => callbacks.onHover(x, y),
        onDrop: () => callbacks.onDrop(),
        onAbort: () => callbacks.onAbort(),
      },
      clock
    );
  }

  isActive(): boolean {
    return this.longPress.isActive();
  }

  cancel(): void {
    this.unfollow();
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
      this.cancel();
      return;
    }
    const touch = e.touches[0];
    this.follow(e.target as EventTarget);
    this.longPress.start(sectionId, touch.clientX, touch.clientY);
  }

  private end(): void {
    this.unfollow();
    this.longPress.end();
  }

  private follow(target: EventTarget): void {
    this.unfollow();
    this.followed = target;
    target.addEventListener("touchmove", this.gestureListener, { passive: false });
    target.addEventListener("touchend", this.gestureListener);
    target.addEventListener("touchcancel", this.gestureListener);
  }

  private unfollow(): void {
    this.followed?.removeEventListener("touchmove", this.gestureListener);
    this.followed?.removeEventListener("touchend", this.gestureListener);
    this.followed?.removeEventListener("touchcancel", this.gestureListener);
    this.followed = null;
  }

  private handleTouchMove(e: TouchEvent): void {
    if (e.touches.length !== 1) {
      // A second finger landed outside any section wrapper (touchstart only
      // sees touches inside it) — a pinch, not a drag.
      this.cancel();
      return;
    }
    if (this.longPress.isActive() && !e.cancelable) {
      // The browser has already committed to scrolling; let it.
      this.cancel();
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    if (this.longPress.move(touch.clientX, touch.clientY)) {
      e.preventDefault();
    }
  }
}
