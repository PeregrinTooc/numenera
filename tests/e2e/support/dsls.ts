import type { Page } from "@playwright/test";
import type { DeviceProfile } from "./device.js";
import { TestStorageHelper } from "./testStorageHelper.js";
import { DOMHelpers } from "./dom-helpers.js";
import { SetupDsl } from "./setup.js";
import { CharacterDsl } from "./character.js";
import { PlaywrightSheetDriver } from "./sheetDriver.js";
import { CardEditorDsl } from "./cardEditor.js";
import { PlaywrightCardEditorDriver } from "./cardEditorDriver.js";
import { ValueEditorDsl } from "./valueEditor.js";
import { PlaywrightValueEditorDriver } from "./valueEditorDriver.js";
import { AdditionalFieldsDsl } from "./additionalFields.js";
import { PlaywrightInlineFieldsDriver } from "./inlineFieldsDriver.js";
import { LayoutDsl } from "./layout.js";
import { PlaywrightLayoutEditDriver } from "./layoutEditDriver.js";
import { PlaywrightDropPreviewDriver } from "./dropPreviewDriver.js";
import { PlaywrightSectionSlideDriver } from "./sectionSlideDriver.js";
import { SettingsDsl } from "./settings.js";
import { PlaywrightSettingsDriver } from "./settingsDriver.js";
import { MouseInput, TouchInput } from "./sectionInput.js";
import { ScreenDsl } from "./screen.js";
import { PlaywrightViewportDriver } from "./viewportDriver.js";
import { VersionHistoryDsl } from "./versionHistory.js";
import { HistorySeedDsl } from "./historySeed.js";
import { ComparisonDsl } from "./comparison.js";
import { PlaywrightComparisonDriver } from "./comparisonDriver.js";
import { PlaywrightVersionHistoryDriver } from "./versionHistoryDriver.js";
import { PlaywrightVersionSaveDriver } from "./versionSaveDriver.js";
import { FileExportDsl } from "./fileExport.js";
import { PlaywrightFileExportDriver } from "./exportCapture.js";
import { SectionColumnsDsl } from "./sectionColumns.js";
import { PlaywrightSectionColumnsDriver } from "./sectionColumnsDriver.js";
import { GridDsl } from "./grid.js";
import { PlaywrightGridDriver } from "./gridDriver.js";
import { LayoutImportDsl } from "./layoutImport.js";
import { PlaywrightLayoutImportDriver } from "./layoutImportDriver.js";
import { SaveIndicatorDsl } from "./saveIndicator.js";
import { PlaywrightSaveIndicatorDriver } from "./saveIndicatorDriver.js";
import { LanguageDsl } from "./language.js";
import { PlaywrightLanguageDriver } from "./languageDriver.js";
import { HealthDsl } from "./health.js";
import { PlaywrightHealthDriver } from "./healthDriver.js";
import { AbilitiesDsl } from "./abilities.js";
import { PlaywrightAbilitiesDriver } from "./abilitiesDriver.js";
import { CharacterImportDsl } from "./characterImport.js";
import { PlaywrightCharacterImportDriver } from "./characterImportDriver.js";
import { CardOrderDsl } from "./cardOrder.js";
import { PlaywrightCardOrderDriver } from "./cardOrderDriver.js";
import { PlaywrightClockDriver, type ClockDriver } from "./clockDriver.js";

export interface Dsls {
  dom: DOMHelpers;
  storageHelper: TestStorageHelper;
  clock: ClockDriver;
  setup: SetupDsl;
  character: CharacterDsl;
  valueEditor: ValueEditorDsl;
  additionalFields: AdditionalFieldsDsl;
  cardEditor: CardEditorDsl;
  screen: ScreenDsl;
  layout: LayoutDsl;
  settings: SettingsDsl;
  historySeed: HistorySeedDsl;
  history: VersionHistoryDsl;
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
}

/** The single place where the DSLs and their drivers are wired for one scenario's page. */
export function createDsls(page: Page, device: DeviceProfile): Dsls {
  const dom = new DOMHelpers(page);
  const storageHelper = new TestStorageHelper(page);
  const clock = new PlaywrightClockDriver(page);
  const setup = new SetupDsl(page, storageHelper);
  const viewport = new PlaywrightViewportDriver(page);
  const valueEditorDriver = new PlaywrightValueEditorDriver(page);
  const historyDriver = new PlaywrightVersionHistoryDriver(page, storageHelper);

  const inlineFieldsDriver = new PlaywrightInlineFieldsDriver(page);

  const character = new CharacterDsl(
    new PlaywrightSheetDriver(page),
    setup,
    valueEditorDriver,
    inlineFieldsDriver
  );
  const additionalFields = new AdditionalFieldsDsl(inlineFieldsDriver);
  const historySeed = new HistorySeedDsl(historyDriver, setup);
  const history = new VersionHistoryDsl(
    historyDriver,
    new PlaywrightVersionSaveDriver(page, clock),
    historySeed,
    character
  );

  const layout = new LayoutDsl(
    device.sectionInput === "touch"
      ? new TouchInput(page, viewport, clock)
      : new MouseInput(page, viewport),
    new PlaywrightLayoutEditDriver(page),
    setup,
    new PlaywrightDropPreviewDriver(page, viewport, clock),
    new PlaywrightSectionSlideDriver(page)
  );

  return {
    dom,
    storageHelper,
    clock,
    setup,
    character,
    valueEditor: new ValueEditorDsl(valueEditorDriver),
    additionalFields,
    cardEditor: new CardEditorDsl(new PlaywrightCardEditorDriver(page)),
    screen: new ScreenDsl(viewport),
    layout,
    settings: new SettingsDsl(new PlaywrightSettingsDriver(page)),
    historySeed,
    history,
    comparison: new ComparisonDsl(
      new PlaywrightComparisonDriver(page, storageHelper),
      history,
      historySeed
    ),
    fileExport: new FileExportDsl(new PlaywrightFileExportDriver(page)),
    sectionColumns: new SectionColumnsDsl(new PlaywrightSectionColumnsDriver(page), setup),
    grid: new GridDsl(new PlaywrightGridDriver(page), setup, layout),
    layoutImport: new LayoutImportDsl(new PlaywrightLayoutImportDriver(page, clock)),
    saveIndicator: new SaveIndicatorDsl(new PlaywrightSaveIndicatorDriver(page), character, clock),
    language: new LanguageDsl(new PlaywrightLanguageDriver(page)),
    health: new HealthDsl(new PlaywrightHealthDriver(page), setup),
    abilities: new AbilitiesDsl(new PlaywrightAbilitiesDriver(page), character, setup),
    characterImport: new CharacterImportDsl(
      new PlaywrightCharacterImportDriver(page, clock),
      character,
      additionalFields
    ),
    cardOrder: new CardOrderDsl(new PlaywrightCardOrderDriver(page, viewport), setup),
  };
}
