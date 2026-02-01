import { setWorldConstructor, World, IWorldOptions, setDefaultTimeout } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { TestStorageHelper } from "./testStorageHelper.js";

// Set default timeout for all steps to 30 seconds
setDefaultTimeout(30000);

// Server port is fixed based on environment
const SERVER_PORT = process.env.TEST_PROD === "true" ? 4173 : 3000;

export interface CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page: Page;
  storageHelper: TestStorageHelper;
  getBaseUrl(): string;
}

export class CustomWorldConstructor extends World implements CustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page!: Page;
  storageHelper!: TestStorageHelper;

  constructor(options: IWorldOptions) {
    super(options);
  }

  getBaseUrl(): string {
    return `http://localhost:${SERVER_PORT}`;
  }
}

setWorldConstructor(CustomWorldConstructor);
