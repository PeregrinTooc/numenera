import { setWorldConstructor, World, IWorldOptions, setDefaultTimeout } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { TestStorageHelper } from "./testStorageHelper.js";
import { DOMHelpers } from "./dom-helpers.js";
import { SetupDsl } from "./setup.js";
import type { ClockDriver } from "./clockDriver.js";
import type { CharacterDsl } from "./character.js";
import type { CardEditorDsl } from "./cardEditor.js";
import type { ValueEditorDsl } from "./valueEditor.js";
import type { AdditionalFieldsDsl } from "./additionalFields.js";
import type { LayoutDsl } from "./layout.js";
import type { SettingsDsl } from "./settings.js";
import type { ScreenDsl } from "./screen.js";
import type { VersionHistoryDsl } from "./versionHistory.js";
import type { HistorySeedDsl } from "./historySeed.js";
import type { ComparisonDsl } from "./comparison.js";
import type { FileExportDsl } from "./fileExport.js";
import type { SectionColumnsDsl } from "./sectionColumns.js";
import type { GridDsl } from "./grid.js";
import type { LayoutImportDsl } from "./layoutImport.js";
import type { SaveIndicatorDsl } from "./saveIndicator.js";
import type { LanguageDsl } from "./language.js";
import type { HealthDsl } from "./health.js";
import type { AbilitiesDsl } from "./abilities.js";
import type { CharacterImportDsl } from "./characterImport.js";
import { BASE_URL } from "./serverUrl.js";

setDefaultTimeout(30000);

export interface CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page: Page;
  storageHelper: TestStorageHelper;
  dom: DOMHelpers;
  clock: ClockDriver;
  setup: SetupDsl;
  character: CharacterDsl;
  cardEditor: CardEditorDsl;
  layout: LayoutDsl;
  settings: SettingsDsl;
  screen: ScreenDsl;
  valueEditor: ValueEditorDsl;
  additionalFields: AdditionalFieldsDsl;
  history: VersionHistoryDsl;
  historySeed: HistorySeedDsl;
  comparison: ComparisonDsl;
  fileExport: FileExportDsl;
  sectionColumns: SectionColumnsDsl;
  grid: GridDsl;
  layoutImport: LayoutImportDsl;
  saveIndicator: SaveIndicatorDsl;
  language: LanguageDsl;
  health: HealthDsl;
  abilities: AbilitiesDsl;
  characterImport: CharacterImportDsl;
  // card-reordering.steps.ts
  draggedCypherName?: string;
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
  clock!: ClockDriver;
  setup!: SetupDsl;
  character!: CharacterDsl;
  cardEditor!: CardEditorDsl;
  layout!: LayoutDsl;
  settings!: SettingsDsl;
  screen!: ScreenDsl;
  valueEditor!: ValueEditorDsl;
  additionalFields!: AdditionalFieldsDsl;
  history!: VersionHistoryDsl;
  historySeed!: HistorySeedDsl;
  comparison!: ComparisonDsl;
  fileExport!: FileExportDsl;
  sectionColumns!: SectionColumnsDsl;
  grid!: GridDsl;
  layoutImport!: LayoutImportDsl;
  saveIndicator!: SaveIndicatorDsl;
  language!: LanguageDsl;
  health!: HealthDsl;
  abilities!: AbilitiesDsl;
  characterImport!: CharacterImportDsl;
  // card-reordering.steps.ts
  draggedCypherName?: string;
  requestedUrls?: string[];

  constructor(options: IWorldOptions) {
    super(options);
  }

  getBaseUrl(): string {
    return BASE_URL;
  }
}

setWorldConstructor(CustomWorldConstructor);
