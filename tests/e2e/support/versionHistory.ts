import type { CharacterDsl } from "./character.js";
import { ORIGINAL_NAME, PORTRAIT, type HistorySeedDsl } from "./historySeed.js";
import type { ExportedView, VersionHistoryDriver } from "./versionHistoryDriver.js";
import type { VersionSaveDriver } from "./versionSaveDriver.js";

export class VersionHistoryDsl {
  private exported?: ExportedView;

  constructor(
    private driver: VersionHistoryDriver,
    private saves: VersionSaveDriver,
    private seed: HistorySeedDsl,
    private character: CharacterDsl
  ) {}

  async stepsBack(): Promise<void> {
    await this.driver.stepBack();
  }

  async stepsForward(): Promise<void> {
    await this.driver.stepForward();
  }

  async stepsBackInQuickSuccession(times: number): Promise<void> {
    await this.driver.stepBackInQuickSuccession(times);
  }

  async goesToVersion(version: number): Promise<void> {
    await this.driver.goToVersion(version);
  }

  async goesToOldestVersion(): Promise<void> {
    await this.driver.goToVersion(1);
  }

  async restores(): Promise<void> {
    await this.driver.restore();
  }

  async returnsToLatest(): Promise<void> {
    await this.driver.returnToLatest();
  }

  async editsHaveSettled(): Promise<void> {
    await this.saves.settleEdits();
  }

  async holdsVersionSaves(): Promise<void> {
    await this.saves.holdVersionSaves();
  }

  async beginsSavingVersion(): Promise<void> {
    await this.saves.beginSavingVersion();
  }

  async releasesHeldVersionSave(): Promise<void> {
    await this.saves.releaseHeldVersionSave();
  }

  async undoes(): Promise<void> {
    await this.driver.undo();
  }

  async redoes(): Promise<void> {
    await this.driver.redo();
  }

  async redoesWithShift(): Promise<void> {
    await this.driver.redoWithShift();
  }

  async reopens(): Promise<void> {
    await this.driver.reopen();
  }

  async exports(): Promise<void> {
    this.exported = await this.driver.exportWhatIsShown();
  }

  async expectNavigatorHidden(): Promise<void> {
    await this.driver.expectNavigatorHidden();
  }

  async expectImportAvailable(available: boolean): Promise<void> {
    await this.driver.expectImportAvailable(available);
  }

  async expectNameBeforeEdits(): Promise<void> {
    await this.character.expectBasicInfoShows("name", this.seed.nameOfLatestVersion());
  }

  async expectEditable(): Promise<void> {
    await this.driver.expectEditable();
  }

  async expectPosition(current: number, total: number): Promise<void> {
    await this.driver.expectPosition(current, total);
  }

  async expectBackAvailable(available: boolean): Promise<void> {
    await this.driver.expectCanStepBack(available);
  }

  async expectForwardAvailable(available: boolean): Promise<void> {
    await this.driver.expectCanStepForward(available);
  }

  async expectOldVersionWarning(): Promise<void> {
    await this.driver.expectOldVersionWarning(true);
  }

  async expectNoOldVersionWarning(): Promise<void> {
    await this.driver.expectOldVersionWarning(false);
  }

  async expectRestoreOffered(): Promise<void> {
    await this.driver.expectRestoreControl();
  }

  async expectOnLatestVersion(): Promise<void> {
    await this.driver.expectCanStepForward(false);
    await this.driver.expectOldVersionWarning(false);
  }

  async expectDescribed(): Promise<void> {
    await this.driver.expectDescriptionShown();
  }

  async expectDescribedAs(text: string): Promise<void> {
    await this.driver.expectDescriptionContains(text);
  }

  async expectDated(): Promise<void> {
    await this.driver.expectTimestampShown();
  }

  async expectAgeInRelativeTerms(): Promise<void> {
    await this.driver.expectTimestampRelative();
  }

  async expectCharacterAsOfVersion(version: number): Promise<void> {
    const { name, tier, equipment, mightPool } = this.seed.factsOfVersion(version);
    await this.character.expectBasicInfoShows("name", name);
    if (tier !== undefined) await this.character.expectBasicInfoShows("tier", tier);
    if (equipment !== undefined) {
      await this.character.expectCount("equipment", 1);
      await this.character.expectEntry("equipment", equipment);
    }
    if (mightPool !== undefined) await this.character.expectStatShows("Might", "Pool", mightPool);
  }

  async expectOriginalVersionDropped(): Promise<void> {
    await this.driver.expectOriginalVersionDropped(ORIGINAL_NAME);
  }

  async expectPortraitUnchanged(): Promise<void> {
    await this.driver.expectPortraitShows(PORTRAIT);
  }

  expectExportHoldsVersion(version: number): void {
    this.exportedView().expectCharacterNamed(this.seed.factsOfVersion(version).name);
  }

  expectExportWithoutHistory(): void {
    this.exportedView().expectNoVersionHistory();
  }

  expectExportKeepsPortrait(): void {
    this.exportedView().expectPortrait(PORTRAIT);
  }

  private exportedView(): ExportedView {
    if (!this.exported) throw new Error("Nothing exported yet");
    return this.exported;
  }
}
