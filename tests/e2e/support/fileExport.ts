import { expect } from "@playwright/test";
import type { CapturedExport, ExportedCharacterFile, FileExportDriver } from "./exportCapture.js";

const CHARACTER_PROPERTIES = [
  "name",
  "tier",
  "type",
  "descriptor",
  "focus",
  "currentXp",
  "totalXp",
  "shins",
  "armor",
  "effort",
  "maxCyphers",
  "stats",
  "cyphers",
  "artifacts",
  "oddities",
  "abilities",
  "equipment",
  "attacks",
  "specialAbilities",
  "recoveryRolls",
  "damageTrack",
  "textFields",
];

const FILE_PROPERTIES = ["version", "schemaVersion", "exportDate", "character"];

export class FileExportDsl {
  private exported?: { filename: string; file: ExportedCharacterFile };

  constructor(private files: FileExportDriver) {}

  async browserLetsMeChooseWhereToSave(): Promise<void> {
    await this.files.offerSavePicker();
  }

  async browserOnlyDownloads(): Promise<void> {
    await this.files.offerDownloadOnly();
  }

  async cancelTheSaveDialog(): Promise<void> {
    await this.files.cancelNextSave();
  }

  async viewExportButtons(): Promise<void> {
    await this.files.waitForHeader();
  }

  async expectButton(text: string): Promise<void> {
    await this.files.expectButton(text);
  }

  async expectNoButton(text: string): Promise<void> {
    await this.files.expectNoButton(text);
  }

  async expectExportButtonStillVisible(): Promise<void> {
    await this.files.expectExportButtonVisible();
  }

  async exportViaButton(): Promise<void> {
    await this.files.clickExport();
  }

  async quickExport(): Promise<void> {
    await this.files.clickQuickExport();
  }

  async saveAs(): Promise<void> {
    await this.files.clickSaveAs();
  }

  async exportCharacter(): Promise<void> {
    const captured: CapturedExport = await this.files.exportAndCapture();
    this.exported = {
      filename: captured.filename,
      file: JSON.parse(captured.data) as ExportedCharacterFile,
    };
  }

  async expectSavedAs(nameFragment: string): Promise<void> {
    const filename = await this.files.waitForSavedFilename();
    expect(filename).toContain(nameFragment);
    expect(filename).toMatch(/\.numenera$/);
  }

  async expectSuggestedFilename(expected: string): Promise<void> {
    expect(await this.files.waitForSavedFilename()).toBe(expected);
  }

  async expectSaveTriggered(): Promise<void> {
    expect(await this.files.waitForSavedFilename()).toBeTruthy();
  }

  async expectSavedFileWellFormed(): Promise<void> {
    const parsed: unknown = JSON.parse(await this.files.waitForSavedData());
    for (const property of FILE_PROPERTIES) expect(parsed).toHaveProperty(property);
  }

  async expectNothingSaved(): Promise<void> {
    await this.files.waitForSaveDialog();
    expect(await this.files.savedData()).toBeUndefined();
  }

  async expectSavedWithoutPrompting(): Promise<void> {
    expect(await this.files.saveDialogCount()).toBe(1);
    expect(await this.files.savedData()).toBeTruthy();
  }

  async expectPromptedAgain(): Promise<void> {
    expect(await this.files.saveDialogCount()).toBeGreaterThanOrEqual(2);
  }

  expectExportTriggered(): void {
    expect(this.theExport().filename).toContain(".numenera");
  }

  expectExportedFilename(expected: string): void {
    expect(this.theExport().filename).toBe(expected);
  }

  expectAllCharacterProperties(): void {
    const { character } = this.theExport().file;
    for (const property of CHARACTER_PROPERTIES) expect(character).toHaveProperty(property);
  }

  expectVersion(expected: string): void {
    expect(this.theExport().file.version).toBe(expected);
  }

  expectSchemaVersion(expected: string): void {
    expect(this.theExport().file.schemaVersion).toBe(expected);
  }

  expectExportDate(): void {
    const { exportDate } = this.theExport().file;
    expect(new Date(exportDate).toISOString()).toBe(exportDate);
  }

  expectLayoutIncluded(): void {
    expect(Array.isArray(this.theExport().file.layout)).toBe(true);
  }

  private theExport(): { filename: string; file: ExportedCharacterFile } {
    if (!this.exported) throw new Error("The character has not been exported yet");
    return this.exported;
  }
}
