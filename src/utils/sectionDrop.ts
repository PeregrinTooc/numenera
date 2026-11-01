/**
 * Pure drop-target logic for dragging sections: which zone of a hovered
 * section the pointer is in, and what dropping there would do.
 */

import { Layout, SectionId } from "@/types/layout";
import { DropIntent, DropZone } from "@/types/layoutDrop";
import { applyDrop, rowIndexOf } from "@/utils/layoutOperations";

/** The parts of a DOMRect the zone computation needs. */
export interface ZoneRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * The zone of `rect` under the pointer at (`x`, `y`). Wide layouts (pairs side
 * by side) have a top and bottom quarter and a middle half split into left and
 * right. Narrow layouts can't show pairs, so they only have a top and a
 * bottom half.
 */
export function dropZoneAt(rect: ZoneRect, x: number, y: number, wide: boolean): DropZone {
  const fromTop = (y - rect.top) / rect.height;
  if (!wide) return fromTop < 0.5 ? "top" : "bottom";
  if (fromTop < 0.25) return "top";
  if (fromTop >= 0.75) return "bottom";
  return x - rect.left < rect.width / 2 ? "left" : "right";
}

/**
 * What dropping `sourceId` on `zone` of `targetId` would do, or null when the
 * drop would do nothing. `_wide`: pairs render side by side.
 */
export function resolveDropIntent(
  layout: Layout,
  sourceId: SectionId,
  targetId: SectionId,
  zone: DropZone,
  _wide: boolean
): DropIntent | null {
  // Pairing comes later; until then the middle zones drop nowhere
  if (zone === "left" || zone === "right") return null;
  const row = rowIndexOf(layout, targetId);
  const intent: DropIntent = { kind: "gap", index: zone === "top" ? row : row + 1 };
  return applyDrop(layout, sourceId, intent) ? intent : null;
}
