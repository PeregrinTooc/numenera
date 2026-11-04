import { setWorldConstructor, World, IWorldOptions, setDefaultTimeout } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { TestStorageHelper } from "./testStorageHelper.js";
import { DOMHelpers } from "./dom-helpers.js";
import { ModalDsl } from "./modal.js";
import { FieldsDsl } from "./fields.js";
import { CardsDsl } from "./cards.js";
import { SetupDsl } from "./setup.js";
import { BASE_URL } from "./serverUrl.js";

// Set default timeout for all steps to 30 seconds
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
  modal: ModalDsl;
  fields: FieldsDsl;
  cards: CardsDsl;
  setup: SetupDsl;
  previousCardCount?: number;
  // card-reordering.steps.ts
  draggedCypherName?: string;
  // section-rearrangement.steps.ts
  importedLayout?: Array<{ type: string; id: string }> | null;
  scrollYBeforeSwipe?: number;
  heldDropTarget?: { name: string; box: { x: number; y: number; width: number; height: number } };
  // version-history.steps.ts
  originalCharacterName?: string;
  uploadedPortrait?: string;
  // auto-save-indicator.steps.ts
  savedTimestamp?: string | null;
  saveCount?: number;
  // character-file-export.steps.ts
  exportedFileData?: ExportedCharacterFile | null;
  exportedFilename?: string;
  // additional-fields-textarea.steps.ts
  tappedTextarea?: string;
  getBaseUrl(): string;
}

export class CustomWorldConstructor extends World implements CustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page!: Page;
  storageHelper!: TestStorageHelper;
  dom!: DOMHelpers;
  modal!: ModalDsl;
  fields!: FieldsDsl;
  cards!: CardsDsl;
  setup!: SetupDsl;
  previousCardCount?: number;
  // card-reordering.steps.ts
  draggedCypherName?: string;
  importedLayout?: Array<{ type: string; id: string }> | null;
  scrollYBeforeSwipe?: number;
  heldDropTarget?: { name: string; box: { x: number; y: number; width: number; height: number } };
  originalCharacterName?: string;
  uploadedPortrait?: string;
  savedTimestamp?: string | null;
  saveCount?: number;
  exportedFileData?: ExportedCharacterFile | null;
  exportedFilename?: string;
  tappedTextarea?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }

  getBaseUrl(): string {
    return BASE_URL;
  }
}

setWorldConstructor(CustomWorldConstructor);
