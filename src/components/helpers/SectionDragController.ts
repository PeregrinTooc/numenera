// Drag-and-drop of character sheet sections: native HTML5 DnD for mouse,
// long-press (via LongPressDrag) for touch.

import { html, nothing, TemplateResult } from "lit-html";
import { Layout, SectionId, isSectionId } from "@/types/layout";
import { DropIntent } from "@/types/layoutDrop";
import { rowIndexOf } from "@/utils/layoutOperations";
import { LongPressDrag } from "@/components/helpers/LongPressDrag";

/** What the controller needs from the sheet that hosts it. */
export interface SectionDragHost {
  isEditMode(): boolean;
  /** Drag state changed: re-render the sheet. */
  requestRender(): void;
  /** The layout the drop intents refer to. */
  getLayout(): Layout;
  /** A section was dropped: apply `intent` to the layout. */
  onDrop(sourceId: SectionId, intent: DropIntent): void;
}

export class SectionDragController {
  private draggedSectionId: SectionId | null = null;
  /** The section under the pointer, styled as the drop target. */
  private dropTargetId: SectionId | null = null;
  /** What dropping now would do; null when a drop would do nothing. */
  private intent: DropIntent | null = null;

  /** Touch long-press → section drag; mouse drags use native HTML5 DnD. */
  private readonly longPress = new LongPressDrag<SectionId>({
    onActivate: (id) => this.handleTouchDragActivate(id),
    onHover: (x, y) => this.handleTouchDragHover(x, y),
    onDrop: () => this.handleTouchDrop(),
    onAbort: () => this.clearDragState(),
  });

  /**
   * Lit listener object so the touchmove listener is registered non-passive:
   * an active touch drag must be able to preventDefault() the page scroll.
   * Kept as one stable object so lit doesn't re-add it on every render.
   *
   * Bound only while the sheet is in layout edit mode (see `renderSection`):
   * unconditionally, this would make every scroll on the sheet non-passive,
   * even outside layout editing.
   */
  private readonly touchMoveListener = {
    handleEvent: (e: TouchEvent): void => this.handleTouchMove(e),
    passive: false,
  };

  /**
   * Lit listener object for touchstart, registered passive: it never calls
   * preventDefault(), so the browser is free to start scrolling immediately.
   * Reads the section id off `currentTarget` so one instance covers every
   * section wrapper.
   */
  private readonly touchStartListener = {
    handleEvent: (e: TouchEvent): void => {
      const sectionId = (e.currentTarget as HTMLElement).dataset.sectionId;
      if (sectionId && isSectionId(sectionId)) {
        this.handleTouchStart(e, sectionId);
      }
    },
    passive: true,
  };

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

  constructor(private readonly host: SectionDragHost) {}

  /**
   * Render a section wrapped for layout editing (drag handle, drop target)
   */
  renderSection(sectionId: SectionId, content: TemplateResult): TemplateResult {
    const editMode = this.host.isEditMode();
    const isDragging = this.draggedSectionId === sectionId;
    const isDropTarget = this.dropTargetId === sectionId;
    const wrapperClass = editMode
      ? `layout-section layout-draggable${isDragging ? " dragging" : ""}${isDropTarget ? " drop-target" : ""}`
      : "";
    const draggable = editMode ? "true" : "false";

    return html`
      <div
        class=${wrapperClass}
        data-section-id=${sectionId}
        data-testid="layout-section-${sectionId}"
        draggable=${draggable}
        @dragstart=${this.dragStartListener}
        @dragend=${() => this.clearDragState()}
        @dragover=${(e: DragEvent) => this.handleDragOver(e, sectionId)}
        @dragleave=${() => this.handleDragLeave()}
        @drop=${(e: DragEvent) => this.handleDrop(e, sectionId)}
        @touchstart=${editMode ? this.touchStartListener : nothing}
        @touchmove=${editMode ? this.touchMoveListener : nothing}
        @touchend=${editMode ? () => this.longPress.end() : nothing}
        @touchcancel=${editMode ? () => this.longPress.cancel() : nothing}
        @contextmenu=${(e: Event) => this.handleContextMenu(e)}
      >
        ${content}
      </div>
    `;
  }

  /**
   * Abandon any touch drag in progress (e.g. when leaving layout edit mode)
   */
  cancelTouchDrag(): void {
    this.longPress.cancel();
  }

  /**
   * Suppress the long-press context menu while a touch drag is in progress
   */
  private handleContextMenu(e: Event): void {
    if (this.longPress.isActive()) {
      e.preventDefault();
    }
  }

  private handleDragStart(e: DragEvent, sectionId: SectionId): void {
    if (this.longPress.isActive()) {
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

    this.draggedSectionId = sectionId;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", sectionId);
    }
    this.host.requestRender();
  }

  private handleDragOver(e: DragEvent, targetId: SectionId): void {
    if (!this.host.isEditMode() || !this.draggedSectionId) return;
    if (targetId === this.draggedSectionId) return;

    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }

    this.hover(targetId);
  }

  private handleDragLeave(): void {
    // Note: We don't clear dropTargetId here because dragleave fires
    // when entering child elements. We let dragover set the target.
  }

  private handleDrop(e: DragEvent, targetId: SectionId): void {
    e.preventDefault();
    if (!this.host.isEditMode() || !this.draggedSectionId) return;
    if (targetId === this.draggedSectionId) return;

    const sourceId = this.draggedSectionId;
    const intent = this.intent;
    this.draggedSectionId = null;
    this.dropTargetId = null;
    this.intent = null;
    if (intent) this.host.onDrop(sourceId, intent);
  }

  /**
   * The pointer is over `targetId` (null: over no other section): update the
   * drop intent, re-rendering only when the drop target changes
   */
  private hover(targetId: SectionId | null): void {
    if (targetId === this.dropTargetId) return;
    this.dropTargetId = targetId;
    this.intent =
      targetId === null
        ? null
        : { kind: "gap", index: rowIndexOf(this.host.getLayout(), targetId) };
    this.host.requestRender();
  }

  /**
   * Handle touch start: begin a long-press that may become a section drag
   */
  private handleTouchStart(e: TouchEvent, sectionId: SectionId): void {
    if (!this.host.isEditMode()) return;
    if (e.touches.length !== 1) {
      this.longPress.cancel();
      return;
    }
    const touch = e.touches[0];
    this.longPress.start(sectionId, touch.clientX, touch.clientY);
  }

  /**
   * Handle touch move: once a long-press is active, the finger drags instead of scrolling
   */
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

  /**
   * A long-press activated: show the section as being dragged
   */
  private handleTouchDragActivate(sectionId: SectionId): void {
    this.draggedSectionId = sectionId;
    this.dropTargetId = null;
    this.intent = null;
    this.host.requestRender();
  }

  /**
   * During a touch drag, mark the section under the finger as the drop target
   */
  private handleTouchDragHover(x: number, y: number): void {
    const hovered = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-section-id]");
    const hoveredId = hovered?.dataset.sectionId;
    const targetId =
      hoveredId && isSectionId(hoveredId) && hoveredId !== this.draggedSectionId ? hoveredId : null;

    this.hover(targetId);
  }

  /**
   * Touch drag released: apply the drop intent, if any
   */
  private handleTouchDrop(): void {
    const sourceId = this.draggedSectionId;
    const intent = this.intent;
    if (sourceId && intent) {
      this.draggedSectionId = null;
      this.dropTargetId = null;
      this.intent = null;
      this.host.onDrop(sourceId, intent); // persists and re-renders
    } else {
      this.clearDragState();
    }
  }

  /**
   * Clear drag/drop-target styling and re-render
   */
  private clearDragState(): void {
    this.draggedSectionId = null;
    this.dropTargetId = null;
    this.intent = null;
    this.host.requestRender();
  }
}
