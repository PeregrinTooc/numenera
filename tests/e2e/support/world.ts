import { setWorldConstructor, World, IWorldOptions, setDefaultTimeout } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";

// Set default timeout for all steps to 30 seconds
setDefaultTimeout(30000);

export interface CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page: Page;
  getBaseUrl(): string;
}

export class CustomWorldConstructor extends World implements CustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page!: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }

  getBaseUrl(): string {
    return process.env.TEST_PROD === "true" ? "http://localhost:4173" : "http://localhost:3000";
  }
}

setWorldConstructor(CustomWorldConstructor);
