import { setWorldConstructor, World, IWorldOptions, setDefaultTimeout } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { serverPort } from "./hooks.js";

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
    return `http://localhost:${serverPort}`;
  }
}

setWorldConstructor(CustomWorldConstructor);
