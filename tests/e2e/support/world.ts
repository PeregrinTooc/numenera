import { setWorldConstructor, World, IWorldOptions, setDefaultTimeout } from "@cucumber/cucumber";
import { BrowserContext, Page } from "@playwright/test";
import { TestStorageHelper } from "./testStorageHelper.js";
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
import type { CardOrderDsl } from "./cardOrder.js";
import type { StorageFailureDsl } from "./storageFailure.js";
import type { UnreadableCharacterDsl } from "./unreadableCharacter.js";
import type { SheetToolbarDsl } from "./sheetToolbar.js";
import type { RequestsDsl } from "./requests.js";

setDefaultTimeout(30000);

export interface CustomWorld extends World {
  context?: BrowserContext;
  page: Page;
  storageHelper: TestStorageHelper;
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
  cardOrder: CardOrderDsl;
  storageFailure: StorageFailureDsl;
  unreadableCharacter: UnreadableCharacterDsl;
  toolbar: SheetToolbarDsl;
  requests: RequestsDsl;
}

export class CustomWorldConstructor extends World implements CustomWorld {
  context?: BrowserContext;
  page!: Page;
  storageHelper!: TestStorageHelper;
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
  cardOrder!: CardOrderDsl;
  storageFailure!: StorageFailureDsl;
  unreadableCharacter!: UnreadableCharacterDsl;
  toolbar!: SheetToolbarDsl;
  requests!: RequestsDsl;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorldConstructor);
