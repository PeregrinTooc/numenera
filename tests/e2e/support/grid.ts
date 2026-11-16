import { DEFAULT_LAYOUT, getAllSectionIds, type LayoutItem } from "@/types/layout";
import type { GridDriver } from "./gridDriver.js";
import type { LayoutDsl } from "./layout.js";
import { sectionId } from "./sections.js";
import type { SetupDsl } from "./setup.js";

export class GridDsl {
  constructor(
    private grid: GridDriver,
    private setup: SetupDsl,
    private layout: LayoutDsl
  ) {}

  /** Every other section on its own row, in default order; the pair last, in edit mode. */
  async hasPairedInEditMode(first: string, second: string): Promise<void> {
    const [firstId, secondId] = [sectionId(first), sectionId(second)];
    const others = getAllSectionIds(DEFAULT_LAYOUT).filter(
      (id) => id !== firstId && id !== secondId
    );
    await this.setup.layout([
      ...others.map((id): LayoutItem => ({ type: "single", id })),
      { type: "grid", items: [firstId, secondId] },
    ]);
    await this.layout.enterEditMode();
  }

  async expectSideBySide(left: string, right: string): Promise<void> {
    await this.grid.expectPairedSideBySide(left, right);
  }

  async expectSavedPair(left: string, right: string): Promise<void> {
    await this.grid.expectSavedLayoutPairs(left, right);
  }

  async expectDefaultLayout(): Promise<void> {
    await this.grid.expectSavedLayoutIsDefault();
  }

  async expectLastSection(name: string): Promise<void> {
    await this.grid.expectLastSection(name);
  }

  async expectInOwnRow(name: string): Promise<void> {
    await this.grid.expectInOwnRow(name);
  }
}
