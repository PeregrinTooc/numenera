/**
 * What to draw while a section is held over a drop target: a pure translation
 * of a drop intent into overlay positions, rendered by SectionDragController
 * and CharacterSheet.
 */

import { Layout, SectionId } from "@/types/layout";
import { DropIntent } from "@/types/layoutDrop";
import { rowIndexOf } from "@/utils/layoutOperations";

/** Where the dragged section will land, as overlays on rows and sections. */
export interface DropPreview {
  /** An insertion line: on a row's edge, or above one section of a stacked pair. */
  line?:
    | { kind: "row"; rowIndex: number; edge: "before" | "after" }
    | { kind: "section"; sectionId: SectionId; edge: "before" };
  /** The dragged section shown beside (`left`/`right`) or over (`replace`) `sectionId`. */
  ghost?: { sectionId: SectionId; placement: "left" | "right" | "replace" };
  /** `sectionId` pushed out of the pair at `rowIndex`, to its own row above or below it. */
  bump?: { rowIndex: number; edge: "above" | "below"; sectionId: SectionId };
}

export function describeDropPreview(
  layout: Layout,
  sourceId: SectionId,
  intent: DropIntent
): DropPreview {
  if (intent.kind === "gap") {
    return intent.index < layout.length
      ? { line: { kind: "row", rowIndex: intent.index, edge: "before" } }
      : { line: { kind: "row", rowIndex: layout.length - 1, edge: "after" } };
  }

  if (intent.kind === "breakPair") {
    const pair = layout[intent.rowIndex];
    return pair?.type === "grid"
      ? { line: { kind: "section", sectionId: pair.items[1], edge: "before" } }
      : {};
  }

  const { targetId } = intent;
  const targetRow = rowIndexOf(layout, targetId);
  const target = layout[targetRow];
  if (target?.type !== "grid") {
    return { ghost: { sectionId: targetId, placement: intent.side } };
  }
  const ghost = { sectionId: targetId, placement: "replace" } as const;
  if (target.items.includes(sourceId)) return { ghost }; // swapping with the own partner
  const fromAbove = rowIndexOf(layout, sourceId) < targetRow;
  return {
    ghost,
    bump: { rowIndex: targetRow, edge: fromAbove ? "below" : "above", sectionId: targetId },
  };
}

// Class names stay literal (no `drop-${edge}`) so Tailwind and readers can find them.

/** Preview classes for row `rowIndex`: a single's section wrapper, or a pair's grid. */
export function rowPreviewClasses(preview: DropPreview, rowIndex: number): string {
  const classes: string[] = [];
  const { line, bump } = preview;
  if (line?.kind === "row" && line.rowIndex === rowIndex) {
    classes.push(line.edge === "before" ? "drop-line-before" : "drop-line-after");
  }
  if (bump?.rowIndex === rowIndex) {
    classes.push(bump.edge === "above" ? "drop-bump-above" : "drop-bump-below");
  }
  return classes.join(" ");
}

/** Preview classes for the wrapper of section `sectionId`. */
export function sectionPreviewClasses(preview: DropPreview, sectionId: SectionId): string {
  const classes: string[] = [];
  const { line, ghost } = preview;
  if (line?.kind === "section" && line.sectionId === sectionId) {
    classes.push("drop-line-before");
  }
  if (ghost?.sectionId === sectionId) {
    classes.push(
      ghost.placement === "left"
        ? "drop-ghost-left"
        : ghost.placement === "right"
          ? "drop-ghost-right"
          : "drop-ghost-replace"
    );
  }
  return classes.join(" ");
}
