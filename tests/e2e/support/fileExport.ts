import { expect } from "@playwright/test";
import type { ExportedCharacterFile, FileExportDriver } from "./exportCapture.js";

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
  private savesRecorded = false;

  constructor(private files: FileExportDriver) {}

  async browserLetsMeChooseWhereToSave(): Promise<void> {
    await this.files.offerSaveDialog();
    this.savesRecorded = true;
  }

  async browserOnlyDownloads(): Promise<void> {
    await this.files.offerDownloadOnly();
    this.savesRecorded = true;
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

  /** Saves the way the browser would, unless a step has already said how the browser saves. */
  async exportCharacter(): Promise<void> {
    if (!this.savesRecorded) {
      await this.files.recordSavesAsTheBrowserWould();
      this.savesRecorded = true;
    }
    await this.files.clickExport();
  }

  async quickExport(): Promise<void> {
    await this.files.clickQuickExport();
  }

  async saveAs(): Promise<void> {
    await this.files.clickSaveAs();
  }

  async expectAskedWhereToSave(nameFragment: string): Promise<void> {
    expect(await this.files.saveDialogCount()).toBeGreaterThanOrEqual(1);
    await this.expectSavedAs(nameFragment);
  }

  async expectDownloaded(nameFragment: string): Promise<void> {
    expect(await this.files.downloadCount()).toBeGreaterThanOrEqual(1);
    await this.expectSavedAs(nameFragment);
  }

  async expectFilename(expected: string): Promise<void> {
    expect((await this.files.savedFile()).filename).toBe(expected);
  }

  async expectSavedFileWellFormed(): Promise<void> {
    const parsed: unknown = JSON.parse((await this.files.savedFile()).data);
    for (const property of FILE_PROPERTIES) expect(parsed).toHaveProperty(property);
  }

  async expectNothingSaved(): Promise<void> {
    expect(await this.files.saveDialogCount()).toBe(1);
    expect(await this.files.savedData()).toBeUndefined();
  }

  async expectSavedWithoutPrompting(): Promise<void> {
    expect(await this.files.saveDialogCount()).toBe(1);
    expect(await this.files.savedData()).toBeTruthy();
  }

  async expectPromptedAgain(): Promise<void> {
    expect(await this.files.saveDialogCount()).toBeGreaterThanOrEqual(2);
  }

  async expectAllCharacterProperties(): Promise<void> {
    const { character } = await this.exportedFile();
    for (const property of CHARACTER_PROPERTIES) expect(character).toHaveProperty(property);
  }

  async expectVersion(expected: string): Promise<void> {
    expect((await this.exportedFile()).version).toBe(expected);
  }

  async expectSchemaVersion(expected: string): Promise<void> {
    expect((await this.exportedFile()).schemaVersion).toBe(expected);
  }

  async expectExportDate(): Promise<void> {
    const { exportDate } = await this.exportedFile();
    expect(new Date(exportDate).toISOString()).toBe(exportDate);
  }

  async expectLayoutIncluded(): Promise<void> {
    expect(Array.isArray((await this.exportedFile()).layout)).toBe(true);
  }

  private async expectSavedAs(nameFragment: string): Promise<void> {
    const { filename } = await this.files.savedFile();
    expect(filename).toContain(nameFragment);
    expect(filename).toMatch(/\.numenera$/);
  }

  private async exportedFile(): Promise<ExportedCharacterFile> {
    return JSON.parse((await this.files.savedFile()).data) as ExportedCharacterFile;
  }
}
