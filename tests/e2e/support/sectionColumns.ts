import type { SectionColumnsDriver } from "./sectionColumnsDriver.js";
import { sectionId } from "./sections.js";
import type { SetupDsl } from "./setup.js";

export class SectionColumnsDsl {
  constructor(
    private columns: SectionColumnsDriver,
    private setup: SetupDsl
  ) {}

  async hasSetSectionTo(section: string, columns: number): Promise<void> {
    await this.setup.sectionColumns({ [sectionId(section)]: columns });
  }

  async hasSavedSectionAndUnknownSection(
    section: string,
    columns: number,
    unknownColumns: number
  ): Promise<void> {
    await this.setup.sectionColumns({
      [sectionId(section)]: columns,
      futureSection: unknownColumns,
    });
  }

  async switchTo(section: string, columns: number): Promise<void> {
    await this.columns.switchTo(section, columns);
  }

  async expectShownInColumns(section: string, columns: number): Promise<void> {
    await this.columns.expectColumns(section, columns);
  }

  async expectComparePaneCyphersInColumns(side: string, columns: number): Promise<void> {
    await this.columns.expectComparePaneCypherColumns(side, columns);
  }

  async expectSwitchOffered(section: string): Promise<void> {
    await this.columns.expectSwitchOffered(section);
  }

  async expectNoSwitchOffered(section: string): Promise<void> {
    await this.columns.expectNoSwitchOffered(section);
  }

  async expectSetTo(section: string, columns: number): Promise<void> {
    await this.columns.expectChosenColumns(sectionId(section), columns);
  }

  async expectMaxCyphersBadgeLeftOfHeading(section: string): Promise<void> {
    await this.columns.expectBadgeLeftOfHeading("max-cyphers-badge", section);
  }

  async expectShinsBadgeLeftOfHeading(section: string): Promise<void> {
    await this.columns.expectBadgeLeftOfHeading("shins-badge", section);
  }

  async expectArmorBadgeClearOfAddAttack(): Promise<void> {
    await this.columns.expectArmorBadgeClearOfAddAttack();
  }

  async expectHeadingRowInsideFrame(section: string): Promise<void> {
    await this.columns.expectHeadingRowInsideFrame(section);
  }

  async expectAbilityBadgesInsideCards(): Promise<void> {
    await this.columns.expectAbilityBadgesInsideCards();
  }
}
