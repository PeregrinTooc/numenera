// Mouse input of section drags: native HTML5 drag and drop. Touch drags use a
// long-press instead (SectionTouchInput).

import { SectionId, isSectionId } from "@/types/layout";
import type { SectionDragCallbacks } from "@/components/helpers/sectionDragInput";

/** What the drag session does with the mouse drag. */
export interface SectionMouseCallbacks extends SectionDragCallbacks {
  /** Whether a section drag, of either input, is under way. */
  isDragging(): boolean;
  /** Whether a touch drag owns the gesture. */
  isTouchDragging(): boolean;
  /** The pointer is at (`x`, `y`) over section wrapper `section`. */
  onHover(section: HTMLElement, x: number, y: number): void;
  /** Whether releasing now would do something. */
  acceptsDrop(): boolean;
}

export class SectionMouseInput {
  /**
   * Lit listener object for dragstart, registered in the capture phase so it
   * runs before a card's own dragstart handler inside the section (e.g.
   * Abilities). During an active touch drag, `handleDragStart` stops the
   * event here so the card never sees it and never marks itself as dragging.
   */
  readonly dragStartListener = {
    handleEvent: (e: Event): void => {
      const sectionId = (e.currentTarget as HTMLElement).dataset.sectionId;
      if (sectionId && isSectionId(sectionId)) {
        this.handleDragStart(e as DragEvent, sectionId);
      }
    },
    capture: true,
  };

  /**
   * Watches the document during a drag for one whose end was never reported
   * (see endLostDrag). One stable function, so it can be removed again.
   */
  private readonly lostDragListener = (e: MouseEvent): void => this.endLostDrag(e);

  constructor(private readonly callbacks: SectionMouseCallbacks) {}

  /** Stop watching for a lost drag: the drag is over. */
  stopWatching(): void {
    document.removeEventListener("pointermove", this.lostDragListener);
  }

  /**
   * Dragover anywhere on the sheet. Bound on the sheet container rather than
   * on each section, so the gutters between sections reach it too.
   */
  handleDragOver(e: DragEvent): void {
    if (!this.callbacks.isEditMode() || !this.callbacks.isDragging()) return;

    // closest() finds the section wrapper even from a card nested inside it,
    // so the zones span the whole section. Over a gutter (no section) the
    // last intent stands: crossing a gap neither cancels nor jumps.
    const section =
      e.target instanceof Element ? e.target.closest<HTMLElement>("[data-section-id]") : null;
    if (section) this.callbacks.onHover(section, e.clientX, e.clientY);
    // Not a drop target: the browser shows "no drop"
    if (!this.callbacks.acceptsDrop()) return;

    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  }

  /** Drop anywhere on the sheet (bound with handleDragOver). */
  handleDrop(e: DragEvent): void {
    if (!this.callbacks.isEditMode() || !this.callbacks.isDragging()) return;
    e.preventDefault();
    this.callbacks.onDrop();
  }

  handleDragEnd(): void {
    this.callbacks.onAbort();
  }

  private handleDragStart(e: DragEvent, sectionId: SectionId): void {
    if (this.callbacks.isTouchDragging()) {
      // Android can start its own long-press drag; the touch drag owns this
      // gesture. This listener runs in the capture phase (see
      // dragStartListener), so stopping it here keeps a card inside the
      // section (e.g. Abilities) from ever seeing the event and marking
      // itself as dragging.
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (!this.callbacks.isEditMode()) return;
    // A card inside the section is the drag source: that is the card's own
    // reorder drag, not a section drag.
    if (e.target !== e.currentTarget) return;

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", sectionId);
    }
    // A previous drag may never have reported its end (see endLostDrag): the
    // session forgets it, which also stops watching for it
    this.callbacks.onActivate(sectionId);
    document.addEventListener("pointermove", this.lostDragListener);
  }

  /**
   * Browsers send no pointer events during a native drag, so a pointer move
   * with no button pressed means the drag ended without a dragend. Firefox
   * (and sometimes WebKit) skips dragend when the drag source left the page,
   * which a live preview can cause. End the drag; nothing is saved.
   */
  private endLostDrag(e: MouseEvent): void {
    if (e.buttons !== 0) return;
    this.callbacks.onAbort();
  }
}
