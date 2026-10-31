/**
 * Pure layout operations: each takes a layout and returns a new one, never
 * mutating its input. Operations that cannot apply return null so callers can
 * skip persisting and re-rendering.
 */

import { Layout, LayoutItem, SectionId, cloneLayout, isGridEligible } from "@/types/layout";

/**
 * Move `sourceId` to just before `targetId`. A source taken out of a grid
 * leaves its partner behind as a single section.
 */
export function reorderLayout(
  layout: Layout,
  sourceId: SectionId,
  targetId: SectionId
): Layout | null {
  const newLayout = cloneLayout(layout);

  // Find source position and remove it
  let sourceItem: LayoutItem | null = null;

  for (let i = 0; i < newLayout.length; i++) {
    const item = newLayout[i];
    if (item.type === "single" && item.id === sourceId) {
      sourceItem = item;
      newLayout.splice(i, 1);
      break;
    } else if (item.type === "grid") {
      const gridIndex = item.items.indexOf(sourceId);
      if (gridIndex !== -1) {
        // Extract from grid - other item becomes single
        const otherId = item.items[1 - gridIndex];
        sourceItem = { type: "single", id: sourceId };
        newLayout[i] = { type: "single", id: otherId };
        break;
      }
    }
  }

  if (!sourceItem) return null;

  const targetIndex = newLayout.findIndex((item) =>
    item.type === "single" ? item.id === targetId : item.items.includes(targetId)
  );

  if (targetIndex === -1) return null;

  newLayout.splice(targetIndex, 0, sourceItem);
  return newLayout;
}

/**
 * Merge two single, grid-eligible sections into a grid at the earlier position.
 */
export function mergeSectionsInLayout(
  layout: Layout,
  sectionId1: SectionId,
  sectionId2: SectionId
): Layout | null {
  if (!isGridEligible(sectionId1) || !isGridEligible(sectionId2)) {
    return null; // Cannot merge non-eligible sections
  }

  const newLayout = cloneLayout(layout);

  // Find both sections
  let index1 = -1;
  let index2 = -1;

  for (let i = 0; i < newLayout.length; i++) {
    const item = newLayout[i];
    if (item.type === "single") {
      if (item.id === sectionId1) index1 = i;
      if (item.id === sectionId2) index2 = i;
    }
  }

  if (index1 === -1 || index2 === -1) return null;

  // Remove both (higher index first to preserve indices)
  const minIndex = Math.min(index1, index2);
  const maxIndex = Math.max(index1, index2);
  newLayout.splice(maxIndex, 1);
  newLayout.splice(minIndex, 1);

  // Insert grid at the first position
  const gridItem: LayoutItem = { type: "grid", items: [sectionId1, sectionId2] };
  newLayout.splice(minIndex, 0, gridItem);

  return newLayout;
}

/**
 * Replace the grid containing `sectionId` with its two sections as singles.
 * A layout without such a grid comes back unchanged (as a copy).
 */
export function splitGridInLayout(layout: Layout, sectionId: SectionId): Layout {
  const newLayout = cloneLayout(layout);

  for (let i = 0; i < newLayout.length; i++) {
    const item = newLayout[i];
    if (item.type === "grid" && item.items.includes(sectionId)) {
      newLayout.splice(
        i,
        1,
        { type: "single", id: item.items[0] },
        { type: "single", id: item.items[1] }
      );
      break;
    }
  }

  return newLayout;
}
