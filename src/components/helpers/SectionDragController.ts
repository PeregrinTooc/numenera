// Drag-and-drop of character sheet sections: native HTML5 DnD for mouse,
// long-press (via LongPressDrag) for touch.

import { html, nothing, TemplateResult } from "lit-html";
import { Layout, SectionId, isSectionId, layoutsAreEqual } from "@/types/layout";
import { DropIntent } from "@/types/layoutDrop";
import {
  DropPreview,
  describeDropPreview,
  rowPreviewClasses,
  sectionPreviewClasses,
} from "@/utils/dropPreview";
import { t } from "@/i18n/index";
import { dropZoneAt, resolveDropIntent } from "@/utils/sectionDrop";
import { applyDrop } from "@/utils/layoutOperations";
import { isWideLayout } from "@/utils/viewport";
import { LongPressDrag } from "@/components/helpers/LongPressDrag";

/** How long a drop intent must hold before the sheet shows its result. */
export const LIVE_PREVIEW_DELAY_MS = 300;

/**
 * How far the pointer must move after a live preview before hovers count
 * again. The jump moves the sections under a still pointer, and browsers keep
 * firing dragover while it rests: without this the layout could jump again.
 */
export const LIVE_PREVIEW_SETTLE_PX = 8;

/** What the controller needs from the sheet that hosts it. */
export interface SectionDragHost {
  isEditMode(): boolean;
  /** Drag state changed: re-render the sheet. */
  requestRender(): void;
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
  /** The layout shown after the intent held still: not saved until the drop. */
  private previewedLayout: Layout | null = null;
  /** Pending switch to the live preview of `intent`. */
  private dwellTimer: ReturnType<typeof setTimeout> | null = null;
  /** Where the pointer was at the last hover. */
  private lastPointer: { x: number; y: number } | null = null;
  /** Where the pointer was when the live preview appeared, until it moves on. */
  private previewAnchor: { x: number; y: number } | null = null;

  /**
   * Watches the document during a mouse section drag for a drag whose end
   * was never reported (see endLostDrag). One stable function, so it can be
   * removed again.
   */
  private readonly lostDragListener = (e: MouseEvent): void => this.endLostDrag(e);

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
   * Render a section wrapped for layout editing (drag handle, drop preview).
   * `rowIndex`: the section is a single row at that index, so it also carries
   * the row's preview; a pair's grid carries it instead (see `rowPreview`).
   */
  renderSection(sectionId: SectionId, content: TemplateResult, rowIndex?: number): TemplateResult {
    const editMode = this.host.isEditMode();
    const classes = editMode ? ["layout-section", "layout-draggable"] : [];
    if (editMode && this.draggedSectionId === sectionId) classes.push("dragging");
    const row = rowIndex === undefined ? undefined : this.rowPreview(rowIndex);
    classes.push(sectionPreviewClasses(this.preview, sectionId), row?.classes ?? "");
    const draggable = editMode ? "true" : "false";
    const ghostLabel =
      this.preview.ghost?.sectionId === sectionId && this.draggedSectionId
        ? sectionName(this.draggedSectionId)
        : nothing;

    return html`
      <div
        class=${classes.filter(Boolean).join(" ")}
        data-drop-ghost-label=${ghostLabel}
        data-drop-bump-label=${row?.bumpLabel ?? nothing}
        data-section-id=${sectionId}
        data-testid="layout-section-${sectionId}"
        draggable=${draggable}
        @dragstart=${this.dragStartListener}
        @dragend=${() => this.clearDragState()}
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
   * The drop preview on row `rowIndex`: its classes, and the name of the
   * section bumped out of it (if any)
   */
  rowPreview(rowIndex: number): { classes: string; bumpLabel: string | typeof nothing } {
    const { bump } = this.preview;
    return {
      classes: rowPreviewClasses(this.preview, rowIndex),
      bumpLabel: bump?.rowIndex === rowIndex ? sectionName(bump.sectionId) : nothing,
    };
  }

  /**
   * Abandon any drag in progress, touch or mouse, and its live preview (e.g.
   * when leaving layout edit mode). The caller re-renders.
   */
  cancelDrag(): void {
    this.longPress.cancel();
    this.resetDragState();
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
    if (!this.intent && !this.previewedLayout) return;

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

  /**
   * The layout to render while a live preview is shown (null: none, render
   * the sheet's own layout)
   */
  liveLayout(): Layout | null {
    return this.previewedLayout;
  }

  /**
   * The pointer is at (`x`, `y`) over section wrapper `target`: update the
   * drop intent from the zone under the pointer, re-rendering only when the
   * intent changes
   */
  private hover(target: HTMLElement, x: number, y: number): void {
    this.lastPointer = { x, y };
    if (this.previewAnchor) {
      const { x: ax, y: ay } = this.previewAnchor;
      if (Math.hypot(x - ax, y - ay) <= LIVE_PREVIEW_SETTLE_PX) return;
      this.previewAnchor = null;
    }
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
    this.restartDwell();
    this.host.requestRender();
  }

  /**
   * Start waiting for the current intent to hold still; any pending wait for
   * an earlier intent is dropped
   */
  private restartDwell(): void {
    if (this.dwellTimer !== null) clearTimeout(this.dwellTimer);
    this.dwellTimer = null;
    if (!this.intent) return; // a no-op zone keeps the current live preview
    this.dwellTimer = setTimeout(() => this.showLivePreview(), LIVE_PREVIEW_DELAY_MS);
  }

  /**
   * The intent held still: show its result. Later hovers build on it.
   */
  private showLivePreview(): void {
    this.dwellTimer = null;
    const sourceId = this.draggedSectionId;
    if (!sourceId || !this.intent) return;
    this.previewedLayout = applyDrop(this.workingLayout(), sourceId, this.intent);
    this.previewAnchor = this.lastPointer;
    this.setIntent(null);
    this.host.requestRender();
  }

  /** The layout hovers are resolved against: the live preview, else the sheet's */
  private workingLayout(): Layout {
    return this.previewedLayout ?? this.host.getLayout();
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
    this.setIntent(null);
    this.host.requestRender();
  }

  /**
   * During a touch drag, update the drop intent from the section under the finger
   */
  private handleTouchDragHover(x: number, y: number): void {
    const hovered = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-section-id]");
    // Over a gutter (no section) the last intent stands, as for the mouse
    if (hovered) this.hover(hovered, x, y);
  }

  /**
   * Touch drag released: drop
   */
  private handleTouchDrop(): void {
    this.drop();
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
        : this.previewedLayout;
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
   * Clear drag and preview styling and re-render
   */
  private clearDragState(): void {
    this.resetDragState();
    this.host.requestRender();
  }

  /** Forget the drag, its intent and any live preview (which is not saved) */
  private resetDragState(): void {
    document.removeEventListener("pointermove", this.lostDragListener);
    if (this.dwellTimer !== null) clearTimeout(this.dwellTimer);
    this.dwellTimer = null;
    this.previewedLayout = null;
    this.previewAnchor = null;
    this.lastPointer = null;
    this.draggedSectionId = null;
    this.setIntent(null);
  }
}

/** A section's translated name, as shown in drop previews. */
function sectionName(sectionId: SectionId): string {
  return t(`layout.sections.${sectionId}`);
}
