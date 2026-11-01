// Types describing where a dragged section will land in the layout.

import { SectionId } from "@/types/layout";

/** Where on a hovered section the pointer is. */
export type DropZone = "top" | "bottom" | "left" | "right";

/** Which column of a pair a section takes. */
export type PairSide = "left" | "right";

/**
 * What a drop will do. Row indices refer to the layout before the drop.
 * - `gap`: move the source before row `index` (`layout.length` = end of sheet)
 * - `pair`: pair the source with `targetId`, the source on `side`
 * - `breakPair`: split the pair at `rowIndex` and put the source between its halves
 */
export type DropIntent =
  | { kind: "gap"; index: number }
  | { kind: "pair"; targetId: SectionId; side: PairSide }
  | { kind: "breakPair"; rowIndex: number };
