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
import { MouseInput, TouchInput } from "./sectionInput.js";
import { ScreenDsl } from "./screen.js";
import { PlaywrightViewportDriver } from "./viewportDriver.js";
import { VersionHistoryDsl } from "./versionHistory.js";
import { HistorySeedDsl } from "./historySeed.js";
import { ComparisonDsl } from "./comparison.js";
import { PlaywrightComparisonDriver } from "./comparisonDriver.js";
import { PlaywrightVersionHistoryDriver } from "./versionHistoryDriver.js";
import { PlaywrightVersionSaveDriver } from "./versionSaveDriver.js";
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
  historySeed: HistorySeedDsl;
  history: VersionHistoryDsl;
  comparison: ComparisonDsl;
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

  const character = new CharacterDsl(new PlaywrightSheetDriver(page), setup, valueEditorDriver);
  const historySeed = new HistorySeedDsl(historyDriver, setup);
  const history = new VersionHistoryDsl(
    historyDriver,
    new PlaywrightVersionSaveDriver(page, clock),
    historySeed,
    character
  );

  return {
    dom,
    storageHelper,
    clock,
    setup,
    character,
    valueEditor: new ValueEditorDsl(valueEditorDriver),
    additionalFields: new AdditionalFieldsDsl(new PlaywrightInlineFieldsDriver(page)),
    cardEditor: new CardEditorDsl(new PlaywrightCardEditorDriver(page)),
    screen: new ScreenDsl(viewport),
    layout: new LayoutDsl(
      device.sectionInput === "touch"
        ? new TouchInput(page, viewport, clock)
        : new MouseInput(page, viewport)
    ),
    historySeed,
    history,
    comparison: new ComparisonDsl(
      new PlaywrightComparisonDriver(page, storageHelper),
      history,
      historySeed
    ),
  };
}
