import { expect } from "@playwright/test";
import { DEFAULT_LAYOUT, cloneLayout, type Layout } from "@/types/layout";
import { FULL_CHARACTER } from "./cardTestFixtures.js";
import { numeneraFile } from "./fileImport.js";
import type { LayoutImportDriver } from "./layoutImportDriver.js";
import { sectionId } from "./sections.js";

const IMPORTED_NAME = "Imported Character";

/** The default layout with Items moved above Cyphers. */
const DIFFERENT_LAYOUT: Layout = [
  { type: "single", id: "basicInfo" },
  { type: "single", id: "stats" },
  { type: "single", id: "recoveryDamage" },
  { type: "single", id: "items" },
  { type: "single", id: "cyphers" },
  { type: "single", id: "abilities" },
  { type: "single", id: "specialAbilities" },
  { type: "single", id: "attacks" },
  { type: "single", id: "background" },
  { type: "single", id: "notes" },
];

interface FileLayoutParts {
  layout?: Layout;
  sectionColumns?: Record<string, number>;
}

export class LayoutImportDsl {
  private fileParts: FileLayoutParts = {};

  constructor(private imports: LayoutImportDriver) {}

  hasFileWithDifferentLayout(): void {
    this.fileParts = { layout: DIFFERENT_LAYOUT };
  }

  hasFileWithDefaultLayout(): void {
    this.fileParts = { layout: cloneLayout(DEFAULT_LAYOUT) };
  }

  hasFileWithoutLayout(): void {
    this.fileParts = {};
  }

  hasFileSettingSectionColumns(section: string, columns: number): void {
    this.fileParts = {
      layout: cloneLayout(DEFAULT_LAYOUT),
      sectionColumns: { [sectionId(section)]: columns },
    };
  }

  hasFileSettingSectionAndUnknownSectionColumns(
    section: string,
    columns: number,
    unknownColumns: number
  ): void {
    this.fileParts = {
      layout: cloneLayout(DEFAULT_LAYOUT),
      sectionColumns: { [sectionId(section)]: columns, futureSection: unknownColumns },
    };
  }

  async importFile(): Promise<void> {
    await this.imports.importFile("imported.numenera", {
      ...numeneraFile({ ...FULL_CHARACTER, name: IMPORTED_NAME }),
      ...this.fileParts,
    });
  }

  async expectImportNote(message: string): Promise<void> {
    await expect.poll(() => this.imports.importNote()).toBe(message);
  }

  async expectPromptShown(): Promise<void> {
    await this.imports.expectPromptShown();
  }

  async expectNoPrompt(): Promise<void> {
    await this.imports.expectNoPrompt();
  }

  async dismissPromptWithEscape(): Promise<void> {
    await this.imports.dismissWithEscape();
  }

  async expectOptions(keep: string, use: string): Promise<void> {
    await this.imports.expectKeepAndUseOptions(keep, use);
  }

  async expectOptionFocused(option: string): Promise<void> {
    await this.imports.expectOptionFocused(option);
  }

  async choose(option: string): Promise<void> {
    await this.imports.chooseOption(option);
  }

  async expectImportedCharacterShown(): Promise<void> {
    await this.imports.expectCharacterShown(IMPORTED_NAME);
  }
}
