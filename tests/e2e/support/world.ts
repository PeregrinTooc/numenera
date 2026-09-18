import { setWorldConstructor, World, IWorldOptions, setDefaultTimeout } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { TestStorageHelper } from "./testStorageHelper.js";
import { DOMHelpers } from "./dom-helpers.js";
import { ModalDsl } from "./modal.js";
import { FieldsDsl } from "./fields.js";
import { CardsDsl } from "./cards.js";
import { SetupDsl } from "./setup.js";

// Set default timeout for all steps to 30 seconds
setDefaultTimeout(30000);

// Server port is fixed based on environment
const SERVER_PORT = process.env.TEST_PROD === "true" ? 4173 : 3000;

export interface ExportedCharacterFile {
  character: Record<string, unknown>;
  version: string;
  schemaVersion: number;
  exportDate: string;
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
  // section-rearrangement.steps.ts
  exportedLayoutData?: { layout?: unknown[] } | null;
  importedLayout?: Array<{ type: string; id: string }> | null;
  // version-history.steps.ts
  originalCharacterName?: string;
  uploadedPortrait?: string;
  // auto-save-indicator.steps.ts
  savedTimestamp?: string | null;
  saveCount?: number;
  // character-file-export.steps.ts
  exportedFileData?: ExportedCharacterFile | null;
  exportedFilename?: string;
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
  exportedLayoutData?: { layout?: unknown[] } | null;
  importedLayout?: Array<{ type: string; id: string }> | null;
  originalCharacterName?: string;
  uploadedPortrait?: string;
  savedTimestamp?: string | null;
  saveCount?: number;
  exportedFileData?: ExportedCharacterFile | null;
  exportedFilename?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }

  getBaseUrl(): string {
    return `http://localhost:${SERVER_PORT}`;
  }
}

setWorldConstructor(CustomWorldConstructor);
