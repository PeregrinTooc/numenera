/**
 * Pure layout operations: each takes a layout and returns a new one, never
 * mutating its input. Operations that cannot apply return null so callers can
 * skip persisting and re-rendering.
 */

import { Layout, SectionId, cloneLayout, isGridEligible, layoutsAreEqual } from "@/types/layout";
import { DropIntent, PairSide } from "@/types/layoutDrop";

/**
 * Index of the row holding `sectionId` (a single or either half of a pair),
 * or -1 if the section is not in the layout.
 */
export function rowIndexOf(layout: Layout, sectionId: SectionId): number {
  return layout.findIndex((item) =>
    item.type === "single" ? item.id === sectionId : item.items.includes(sectionId)
  );
}

/**
 * Apply a drop of `sourceId`. Returns null when the drop is invalid or would
 * leave the layout unchanged.
 */
export function applyDrop(layout: Layout, sourceId: SectionId, intent: DropIntent): Layout | null {
  const sourceRow = rowIndexOf(layout, sourceId);
  if (sourceRow === -1) return null;

  let result: Layout | null;
  if (intent.kind === "gap") {
    result = dropInGap(layout, sourceId, sourceRow, intent.index);
  } else if (intent.kind === "pair") {
    result = pairWith(layout, sourceId, sourceRow, intent.targetId, intent.side);
  } else {
    result = breakPair(layout, sourceId, sourceRow, intent.rowIndex);
  }
  return result && !layoutsAreEqual(result, layout) ? result : null;
}

/**
 * A copy of `layout` with `sourceId` taken out of row `sourceRow`: a single
 * row closes up, a pair leaves the partner behind as a single in place.
 */
function withoutSource(
  layout: Layout,
  sourceId: SectionId,
  sourceRow: number
): { rest: Layout; rowClosed: boolean } {
  const rest = cloneLayout(layout);
  const item = rest[sourceRow];
  if (item.type === "single") {
    rest.splice(sourceRow, 1);
    return { rest, rowClosed: true };
  }
  rest[sourceRow] = { type: "single", id: item.items[1 - item.items.indexOf(sourceId)] };
  return { rest, rowClosed: false };
}

function dropInGap(layout: Layout, sourceId: SectionId, sourceRow: number, index: number): Layout {
  const { rest, rowClosed } = withoutSource(layout, sourceId, sourceRow);
  rest.splice(rowClosed && index > sourceRow ? index - 1 : index, 0, {
    type: "single",
    id: sourceId,
  });
  return rest;
}

function pairWith(
  layout: Layout,
  sourceId: SectionId,
  sourceRow: number,
  targetId: SectionId,
  side: PairSide
): Layout | null {
  if (!isGridEligible(sourceId) || !isGridEligible(targetId)) return null;
  const { rest } = withoutSource(layout, sourceId, sourceRow);
  const targetRow = rowIndexOf(rest, targetId);
  const target = rest[targetRow];
  if (!target) return null;

  if (target.type === "single") {
    rest[targetRow] = {
      type: "grid",
      items: side === "left" ? [sourceId, targetId] : [targetId, sourceId],
    };
    return rest;
  }

  // A paired target: the source takes its slot, and the target is pushed out
  // to its own row in the direction the source was travelling.
  const items = target.items.map((id) => (id === targetId ? sourceId : id));
  rest[targetRow] = { type: "grid", items: [items[0], items[1]] };
  const fromAbove = sourceRow < rowIndexOf(layout, targetId);
  rest.splice(fromAbove ? targetRow + 1 : targetRow, 0, { type: "single", id: targetId });
  return rest;
}

/**
 * Split the pair at `rowIndex` (of the input layout) into singles and put the
 * source between its former halves. Null if that row is not a pair or the
 * source is in it.
 */
function breakPair(
  layout: Layout,
  sourceId: SectionId,
  sourceRow: number,
  rowIndex: number
): Layout | null {
  const pair = layout[rowIndex];
  if (pair?.type !== "grid" || pair.items.includes(sourceId)) return null;
  const { rest, rowClosed } = withoutSource(layout, sourceId, sourceRow);
  const index = rowClosed && sourceRow < rowIndex ? rowIndex - 1 : rowIndex;
  rest.splice(
    index,
    1,
    { type: "single", id: pair.items[0] },
    { type: "single", id: sourceId },
    { type: "single", id: pair.items[1] }
  );
  return rest;
}
