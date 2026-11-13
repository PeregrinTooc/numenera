// How a section looks while layout editing: the draggable wrapper and the
// drop preview drawn on it.

import { html, nothing, TemplateResult } from "lit-html";
import { SectionId } from "@/types/layout";
import { DropPreview, rowPreviewClasses, sectionPreviewClasses } from "@/utils/dropPreview";
import { t } from "@/i18n/index";

/** The options of a lit listener object (the object itself has a handleEvent). */
type ListenerObject = AddEventListenerOptions;

/** The event bindings of a section wrapper, supplied by its controller. */
export interface SectionDragBindings {
  dragStart: ListenerObject;
  /** Only bound in layout edit mode, so scrolling elsewhere stays passive. */
  touchStart: ListenerObject;
  touchMove: ListenerObject;
  dragEnd(): void;
  contextMenu(e: Event): void;
}

/** What is being dragged and drawn, as far as rendering a section goes. */
export interface SectionDragView {
  editMode: boolean;
  draggedSectionId: SectionId | null;
  preview: DropPreview;
}

/** A section's translated name, as shown in drop previews. */
function sectionName(sectionId: SectionId): string {
  return t(`layout.sections.${sectionId}`);
}

/**
 * The drop preview on row `rowIndex`: its classes, and the name of the
 * section bumped out of it (if any)
 */
export function rowPreviewOf(
  preview: DropPreview,
  rowIndex: number
): { classes: string; bumpLabel: string | typeof nothing } {
  const { bump } = preview;
  return {
    classes: rowPreviewClasses(preview, rowIndex),
    bumpLabel: bump?.rowIndex === rowIndex ? sectionName(bump.sectionId) : nothing,
  };
}

/**
 * Render a section wrapped for layout editing (drag handle, drop preview).
 * `rowIndex`: the section is a single row at that index, so it also carries
 * the row's preview; a pair's grid carries it instead (see `rowPreviewOf`).
 */
export function renderDragSection(
  view: SectionDragView,
  bindings: SectionDragBindings,
  sectionId: SectionId,
  content: TemplateResult,
  rowIndex?: number
): TemplateResult {
  const { editMode, draggedSectionId, preview } = view;
  const classes = editMode ? ["layout-section", "layout-draggable"] : [];
  if (editMode && draggedSectionId === sectionId) classes.push("dragging");
  const row = rowIndex === undefined ? undefined : rowPreviewOf(preview, rowIndex);
  classes.push(sectionPreviewClasses(preview, sectionId), row?.classes ?? "");
  const draggable = editMode ? "true" : "false";
  const ghostLabel =
    preview.ghost?.sectionId === sectionId && draggedSectionId
      ? sectionName(draggedSectionId)
      : nothing;

  return html`
    <div
      class=${classes.filter(Boolean).join(" ")}
      data-drop-ghost-label=${ghostLabel}
      data-drop-bump-label=${row?.bumpLabel ?? nothing}
      data-section-id=${sectionId}
      data-testid="layout-section-${sectionId}"
      draggable=${draggable}
      @dragstart=${bindings.dragStart}
      @dragend=${() => bindings.dragEnd()}
      @touchstart=${editMode ? bindings.touchStart : nothing}
      @touchmove=${editMode ? bindings.touchMove : nothing}
      @contextmenu=${(e: Event) => bindings.contextMenu(e)}
    >
      ${content}
    </div>
  `;
}
