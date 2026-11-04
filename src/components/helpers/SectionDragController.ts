// Drag-and-drop of character sheet sections: native HTML5 DnD for mouse,
// long-press (via LongPressDrag) for touch.

import { nothing, TemplateResult } from "lit-html";
import { Layout, SectionId, isSectionId, layoutsAreEqual } from "@/types/layout";
import { DropIntent } from "@/types/layoutDrop";
import { DropPreview, describeDropPreview } from "@/utils/dropPreview";
import { dropZoneAt, resolveDropIntent } from "@/utils/sectionDrop";
import { applyDrop } from "@/utils/layoutOperations";
import { isWideLayout } from "@/utils/viewport";
import { SectionTouchInput } from "@/components/helpers/SectionTouchInput";
import {
  SectionDragBindings,
  renderDragSection,
  rowPreviewOf,
} from "@/components/helpers/sectionDragRender";
import { LivePreview } from "@/components/helpers/LivePreview";

export { LIVE_PREVIEW_DELAY_MS, LIVE_PREVIEW_SETTLE_PX } from "@/components/helpers/LivePreview";

/** What the controller needs from the sheet that hosts it. */
export interface SectionDragHost {
  isEditMode(): boolean;
  /** Drag state changed: re-render the sheet. */
  requestRender(): void;
  /**
   * The shown layout changed: re-render the sheet; sections that moved slide
   * from their old places. Resolves when the slide has finished; null when
   * nothing slides.
   */
  renderWithSlide(): Promise<void> | null;
  /** The layout the drop intents refer to. */
  getLayout(): Layout;
  /** A section was dropped: adopt, persist and render `layout`. */
  commitLayout(layout: Layout): void;
}

export class SectionDragController {
  private draggedSectionId: SectionId | null = null;
  /** What dropping now would do; null when a drop would do nothing. */
  private intent: DropIntent | null = null;
  /** What to draw for `intent`. */
  private preview: DropPreview = {};
  /** The dwell, anchor, slide guard and layout of the live preview. */
  private readonly livePreview = new LivePreview();

  /**
   * Watches the document during a mouse section drag for a drag whose end
   * was never reported (see endLostDrag). One stable function, so it can be
   * removed again.
   */
  private readonly lostDragListener = (e: MouseEvent): void => this.endLostDrag(e);

  /** Touch long-press → section drag; mouse drags use native HTML5 DnD. */
  private readonly touch = new SectionTouchInput({
    isEditMode: () => this.host.isEditMode(),
    onActivate: (id) => this.handleTouchDragActivate(id),
    onHover: (x, y) => this.handleTouchDragHover(x, y),
    onDrop: () => this.drop(),
    onAbort: () => this.clearDragState(),
  });

  /**
   * Lit listener object for dragstart, registered in the capture phase so it
   * runs before a card's own dragstart handler inside the section (e.g.
   * Abilities). During an active touch drag, `handleDragStart` stops the
   * event here so the card never sees it and never marks itself as dragging.
   */
  private readonly dragStartListener = {
    handleEvent: (e: Event): void => {
      const sectionId = (e.currentTarget as HTMLElement).dataset.sectionId;
      if (sectionId && isSectionId(sectionId)) {
        this.handleDragStart(e as DragEvent, sectionId);
      }
    },
    capture: true,
  };

  /** The wrapper's event bindings: the stable listener objects above. */
  private readonly bindings: SectionDragBindings = {
    dragStart: this.dragStartListener,
    touchStart: this.touch.touchStartListener,
    touchMove: this.touch.touchMoveListener,
    dragEnd: () => this.clearDragState(),
    touchEnd: () => this.touch.end(),
    touchCancel: () => this.touch.cancel(),
    contextMenu: (e) => this.touch.handleContextMenu(e),
  };

  constructor(private readonly host: SectionDragHost) {}

  /**
   * Render a section wrapped for layout editing (drag handle, drop preview).
   * `rowIndex`: the section is a single row at that index, so it also carries
   * the row's preview; a pair's grid carries it instead (see `rowPreview`).
   */
  renderSection(sectionId: SectionId, content: TemplateResult, rowIndex?: number): TemplateResult {
    const view = {
      editMode: this.host.isEditMode(),
      draggedSectionId: this.draggedSectionId,
      preview: this.preview,
    };
    return renderDragSection(view, this.bindings, sectionId, content, rowIndex);
  }

  /**
   * The drop preview on row `rowIndex`: its classes, and the name of the
   * section bumped out of it (if any)
   */
  rowPreview(rowIndex: number): { classes: string; bumpLabel: string | typeof nothing } {
    return rowPreviewOf(this.preview, rowIndex);
  }

  /**
   * Abandon any drag in progress, touch or mouse, and its live preview (e.g.
   * when leaving layout edit mode). The caller re-renders.
   */
  cancelDrag(): void {
    // Forget the live preview first: the long-press abort must not slide the
    // sections back while the whole sheet re-renders
    this.resetDragState();
    this.touch.cancel();
  }

  private handleDragStart(e: DragEvent, sectionId: SectionId): void {
    if (this.touch.isActive()) {
      // Android can start its own long-press drag; the touch drag owns this
      // gesture. This listener runs in the capture phase (see
      // dragStartListener), so stopping it here keeps a card inside the
      // section (e.g. Abilities) from ever seeing the event and marking
      // itself as dragging.
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (!this.host.isEditMode()) return;
    // A card inside the section is the drag source: that is the card's own
    // reorder drag, not a section drag.
    if (e.target !== e.currentTarget) return;

    // A previous drag may never have reported its end (see endLostDrag)
    this.resetDragState();
    this.draggedSectionId = sectionId;
    document.addEventListener("pointermove", this.lostDragListener);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", sectionId);
    }
    this.host.requestRender();
  }

  /**
   * Browsers send no pointer events during a native drag, so a pointer move
   * with no button pressed means the drag ended without a dragend. Firefox
   * (and sometimes WebKit) skips dragend when the drag source left the page,
   * which a live preview can cause. End the drag; nothing is saved.
   */
  private endLostDrag(e: MouseEvent): void {
    if (e.buttons !== 0) return;
    this.clearDragState();
  }

  /**
   * Mouse dragover anywhere on the sheet. Bound on the sheet container rather
   * than on each section, so the gutters between sections reach it too.
   */
  handleDragOver(e: DragEvent): void {
    if (!this.host.isEditMode() || !this.draggedSectionId) return;

    // closest() finds the section wrapper even from a card nested inside it,
    // so the zones span the whole section. Over a gutter (no section) the
    // last intent stands: crossing a gap neither cancels nor jumps.
    const section =
      e.target instanceof Element ? e.target.closest<HTMLElement>("[data-section-id]") : null;
    if (section) this.hover(section, e.clientX, e.clientY);
    // Not a drop target: the browser shows "no drop"
    if (!this.intent && !this.livePreview.shownLayout()) return;

    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  }

  /**
   * Mouse drop anywhere on the sheet (bound with handleDragOver): apply the
   * intent from the last dragover
   */
  handleDrop(e: DragEvent): void {
    if (!this.host.isEditMode() || !this.draggedSectionId) return;
    e.preventDefault();
    this.drop();
  }

  /** The layout to render while a live preview is shown (null: the sheet's own) */
  liveLayout(): Layout | null {
    return this.livePreview.shownLayout();
  }

  /**
   * The pointer is at (`x`, `y`) over section wrapper `target`: update the
   * drop intent from the zone under the pointer, re-rendering only when the
   * intent changes
   */
  private hover(target: HTMLElement, x: number, y: number): void {
    if (this.livePreview.shouldIgnoreHover(x, y)) return;
    const sourceId = this.draggedSectionId;
    const targetId = target.dataset.sectionId;
    let intent: DropIntent | null = null;
    if (sourceId && targetId && isSectionId(targetId)) {
      const wide = isWideLayout();
      const zone = dropZoneAt(target.getBoundingClientRect(), x, y, wide);
      intent = resolveDropIntent(this.workingLayout(), sourceId, targetId, zone, wide);
    }

    // Intents are small plain objects built in one place, so equal intents
    // serialise identically.
    if (JSON.stringify(intent) === JSON.stringify(this.intent)) return;
    this.setIntent(intent);
    this.livePreview.restartDwell(this.intent !== null, () => this.showLivePreview());
    this.host.requestRender();
  }

  /** The intent held still: show its result. Later hovers build on it. */
  private showLivePreview(): void {
    const sourceId = this.draggedSectionId;
    if (!sourceId || !this.intent) return;
    this.livePreview.show(applyDrop(this.workingLayout(), sourceId, this.intent));
    this.setIntent(null);
    this.livePreview.followSlide(this.host.renderWithSlide());
  }

  /** The layout hovers are resolved against: the live preview, else the sheet's */
  private workingLayout(): Layout {
    return this.livePreview.workingLayout(this.host.getLayout());
  }

  /** A long-press activated: show the section as being dragged */
  private handleTouchDragActivate(sectionId: SectionId): void {
    this.draggedSectionId = sectionId;
    this.setIntent(null);
    this.host.requestRender();
  }

  /** During a touch drag, update the drop intent from the section under the finger */
  private handleTouchDragHover(x: number, y: number): void {
    const hovered = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-section-id]");
    // Over a gutter (no section) the last intent stands, as for the mouse
    if (hovered) this.hover(hovered, x, y);
  }

  /**
   * The drag ended in a drop: commit the intent's result, else the live
   * preview on show. With neither, or no change, the drag just ends.
   */
  private drop(): void {
    const sourceId = this.draggedSectionId;
    const layout =
      sourceId && this.intent
        ? applyDrop(this.workingLayout(), sourceId, this.intent)
        : this.livePreview.shownLayout();
    // A chain of live previews can end where it began: nothing to save
    if (!layout || layoutsAreEqual(layout, this.host.getLayout())) {
      this.clearDragState();
      return;
    }
    this.resetDragState();
    this.host.commitLayout(layout); // persists and re-renders
  }

  private setIntent(intent: DropIntent | null): void {
    this.intent = intent;
    this.preview =
      intent && this.draggedSectionId
        ? describeDropPreview(this.workingLayout(), this.draggedSectionId, intent)
        : {};
  }

  /**
   * Clear drag and preview styling and re-render. A live preview on show is
   * thrown away: the sections slide back to the saved layout.
   */
  private clearDragState(): void {
    const restoring = this.livePreview.shownLayout() !== null;
    this.resetDragState();
    if (restoring) this.host.renderWithSlide();
    else this.host.requestRender();
  }

  /** Forget the drag, its intent and any live preview (which is not saved) */
  private resetDragState(): void {
    document.removeEventListener("pointermove", this.lostDragListener);
    this.livePreview.reset();
    this.draggedSectionId = null;
    this.setIntent(null);
  }
}
