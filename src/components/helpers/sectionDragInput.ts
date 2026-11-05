// What every input of a section drag (mouse, touch) reports to the drag
// session in SectionDragController; each input adds how it reports a hover.

import { SectionId } from "@/types/layout";

export interface SectionDragCallbacks {
  isEditMode(): boolean;
  /** A drag of `sectionId` began. */
  onActivate(sectionId: SectionId): void;
  /** The section was released over the sheet: drop. */
  onDrop(): void;
  /** The drag ended without a drop. */
  onAbort(): void;
}
