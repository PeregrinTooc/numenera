import { setWorldConstructor, World, IWorldOptions, setDefaultTimeout } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { TestStorageHelper } from "./testStorageHelper.js";
import { DOMHelpers } from "./dom-helpers.js";
import { SetupDsl } from "./setup.js";
import type { CharacterDsl } from "./character.js";
import type { CardEditorDsl } from "./cardEditor.js";
import type { ValueEditorDsl } from "./valueEditor.js";
import type { AdditionalFieldsDsl } from "./additionalFields.js";
import type { LayoutDsl } from "./layout.js";
import type { ScreenDsl } from "./screen.js";
import type { VersionHistoryDsl } from "./versionHistory.js";
import type { HistorySeedDsl } from "./historySeed.js";
import type { ComparisonDsl } from "./comparison.js";
import { BASE_URL } from "./serverUrl.js";
import type { Layout } from "@/types/layout";
import type { SectionColumns } from "@/types/sectionColumns";

setDefaultTimeout(30000);

export interface ExportedCharacterFile {
  character: Record<string, unknown>;
  version: string;
  schemaVersion: number;
  exportDate: string;
  layout?: unknown[];
  versionHistory?: unknown;
}

export interface CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page: Page;
  storageHelper: TestStorageHelper;
  dom: DOMHelpers;
  setup: SetupDsl;
  character: CharacterDsl;
  cardEditor: CardEditorDsl;
  layout: LayoutDsl;
  screen: ScreenDsl;
  valueEditor: ValueEditorDsl;
  additionalFields: AdditionalFieldsDsl;
  history: VersionHistoryDsl;
  historySeed: HistorySeedDsl;
  comparison: ComparisonDsl;
  // card-reordering.steps.ts
  draggedCypherName?: string;
  // layout-import-export.steps.ts
  importedFile?: { layout?: Layout; sectionColumns?: SectionColumns };
  heldDropTarget?: {
    name: string;
    box: { x: number; y: number; width: number; height: number };
    point: { x: number; y: number };
  };
  // auto-save-indicator.steps.ts
  savedTimestamp?: string | null;
  saveCount?: number;
  // character-file-export.steps.ts
  exportedFileData?: ExportedCharacterFile | null;
  exportedFilename?: string;
  // third-party-requests.steps.ts
  requestedUrls?: string[];
  getBaseUrl(): string;
}

export class CustomWorldConstructor extends World implements CustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page!: Page;
  storageHelper!: TestStorageHelper;
  dom!: DOMHelpers;
  setup!: SetupDsl;
  character!: CharacterDsl;
  cardEditor!: CardEditorDsl;
  layout!: LayoutDsl;
  screen!: ScreenDsl;
  valueEditor!: ValueEditorDsl;
  additionalFields!: AdditionalFieldsDsl;
  history!: VersionHistoryDsl;
  historySeed!: HistorySeedDsl;
  comparison!: ComparisonDsl;
  // card-reordering.steps.ts
  draggedCypherName?: string;
  importedFile?: { layout?: Layout; sectionColumns?: SectionColumns };
  heldDropTarget?: {
    name: string;
    box: { x: number; y: number; width: number; height: number };
    point: { x: number; y: number };
  };
  savedTimestamp?: string | null;
  saveCount?: number;
  exportedFileData?: ExportedCharacterFile | null;
  exportedFilename?: string;
  requestedUrls?: string[];

  constructor(options: IWorldOptions) {
    super(options);
  }

  getBaseUrl(): string {
    return BASE_URL;
  }
}

setWorldConstructor(CustomWorldConstructor);
