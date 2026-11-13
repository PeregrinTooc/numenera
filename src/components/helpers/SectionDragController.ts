// Drag-and-drop of character sheet sections: native HTML5 DnD for mouse,
// long-press (via LongPressDrag) for touch. The inputs report to the drag
// session here: hover → intent → live preview → drop or cancel.

import { nothing, TemplateResult } from "lit-html";
import { Layout, SectionId, isSectionId, layoutsAreEqual } from "@/types/layout";
import { DropIntent } from "@/types/layoutDrop";
import { DropPreview, describeDropPreview } from "@/utils/dropPreview";
import { dropZoneAt, resolveDropIntent } from "@/utils/sectionDrop";
import { applyDrop } from "@/utils/layoutOperations";
import { isWideLayout } from "@/utils/viewport";
import { SectionTouchInput } from "@/components/helpers/SectionTouchInput";
import { SectionMouseInput } from "@/components/helpers/SectionMouseInput";
import {
  SectionDragBindings,
  renderDragSection,
  rowPreviewOf,
} from "@/components/helpers/sectionDragRender";
import { LivePreview } from "@/components/helpers/LivePreview";
import { EdgeAutoScroll } from "@/components/helpers/EdgeAutoScroll";

export { LIVE_PREVIEW_DELAY_MS, LIVE_PREVIEW_SETTLE_PX } from "@/components/helpers/LivePreview";

/** What the controller needs from the sheet that hosts it. */
export interface SectionDragHost {
  isEditMode(): boolean;
  /** Drag state changed: re-render the sheet. */
  requestRender(): void;
  /**
   * The shown layout changed: re-render the sheet; sections that moved slide
   * from their old places, except `keepStill`, which the page scrolls to keep
   * where it was on screen. Resolves when the slide has finished; null when
   * nothing slides.
   */
  renderWithSlide(keepStill?: SectionId): Promise<void> | null;
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

  /** Scrolls the page while a touch drag rests at a viewport edge. */
  private readonly edgeScroll = new EdgeAutoScroll((x, y) => {
    this.hoverAt(x, y);
    // A live preview mid-scroll would jump the sheet while it moves
    this.livePreview.postponeDwell();
  });

  /** Touch long-press → section drag. */
  private readonly touch = new SectionTouchInput({
    isEditMode: () => this.host.isEditMode(),
    onActivate: (id) => this.handleTouchDragActivate(id),
    onHover: (x, y) => {
      this.edgeScroll.follow(x, y);
      this.hoverAt(x, y);
    },
    onDrop: () => this.drop(),
    onAbort: () => this.clearDragState(),
  });

  /** Native HTML5 drag and drop → section drag. */
  private readonly mouse = new SectionMouseInput({
    isEditMode: () => this.host.isEditMode(),
    isDragging: () => this.draggedSectionId !== null,
    isTouchDragging: () => this.touch.isActive(),
    onActivate: (id) => this.handleMouseDragActivate(id),
    onHover: (section, x, y) => this.hover(section, x, y),
    acceptsDrop: () => this.intent !== null || this.livePreview.shownLayout() !== null,
    onDrop: () => this.drop(),
    onAbort: () => this.clearDragState(),
  });

  /** The wrapper's event bindings: the inputs' stable listener objects. */
  private readonly bindings: SectionDragBindings = {
    dragStart: this.mouse.dragStartListener,
    touchStart: this.touch.touchStartListener,
    touchMove: this.touch.touchMoveListener,
    dragEnd: () => this.mouse.handleDragEnd(),
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

  /** Mouse dragover anywhere on the sheet (see SectionMouseInput). */
  handleDragOver(e: DragEvent): void {
    this.mouse.handleDragOver(e);
  }

  /** Mouse drop anywhere on the sheet (see SectionMouseInput). */
  handleDrop(e: DragEvent): void {
    this.mouse.handleDrop(e);
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
    const targetId = target.dataset.sectionId;
    if (!targetId || !isSectionId(targetId)) return;
    if (this.livePreview.shouldIgnoreHover(x, y)) return;
    const sourceId = this.draggedSectionId;
    let intent: DropIntent | null = null;
    if (sourceId) {
      const wide = isWideLayout();
      const zone = dropZoneAt(target.getBoundingClientRect(), x, y, wide);
      intent = resolveDropIntent(this.workingLayout(), sourceId, targetId, zone, wide);
    }

    // Intents are small plain objects built in one place, so equal intents
    // serialise identically.
    if (JSON.stringify(intent) === JSON.stringify(this.intent)) return;
    this.setIntent(intent);
    this.livePreview.restartDwell(this.intent !== null, () => this.showLivePreview(targetId));
    this.host.requestRender();
  }

  /**
   * The intent held still: show its result, keeping `pointedAt` (the section
   * under the pointer) where it was on screen. Later hovers build on it.
   */
  private showLivePreview(pointedAt: SectionId): void {
    const sourceId = this.draggedSectionId;
    if (!sourceId || !this.intent) return;
    this.livePreview.show(applyDrop(this.workingLayout(), sourceId, this.intent), pointedAt);
    this.setIntent(null);
    const slide = this.host.renderWithSlide(pointedAt);
    this.livePreview.followSlide(slide, (x, y) => this.hoverAt(x, y));
  }

  /** The layout hovers are resolved against: the live preview, else the sheet's */
  private workingLayout(): Layout {
    return this.livePreview.workingLayout(this.host.getLayout());
  }

  private handleMouseDragActivate(sectionId: SectionId): void {
    // A previous drag may never have reported its end
    this.resetDragState();
    this.draggedSectionId = sectionId;
    this.host.requestRender();
  }

  private handleTouchDragActivate(sectionId: SectionId): void {
    this.draggedSectionId = sectionId;
    this.setIntent(null);
    this.host.requestRender();
  }

  private hoverAt(x: number, y: number): void {
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
   * thrown away: the sections slide back to the saved layout around the
   * section it kept still, so the sheet is back where it was on screen.
   */
  private clearDragState(): void {
    const keepStill = this.livePreview.keptStill();
    this.resetDragState();
    if (keepStill) this.host.renderWithSlide(keepStill);
    else this.host.requestRender();
  }

  /** Forget the drag, its intent and any live preview (which is not saved) */
  private resetDragState(): void {
    this.mouse.stopWatching();
    this.edgeScroll.stop();
    this.livePreview.reset();
    this.draggedSectionId = null;
    this.setIntent(null);
  }
}
