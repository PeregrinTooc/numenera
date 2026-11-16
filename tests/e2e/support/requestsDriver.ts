import type { Page } from "@playwright/test";
import { waitForCharacterSheetReady } from "./app-ready.js";
import { BASE_URL } from "./serverUrl.js";

/** The network requests the sheet makes and the fonts it ends up with. */
export interface RequestsDriver {
  openWatchingRequests(): Promise<void>;
  requestedUrls(): string[];
  loadedFontFamilies(): Promise<string[]>;
}

export class PlaywrightRequestsDriver implements RequestsDriver {
  private urls: string[] = [];

  constructor(private page: Page) {}

  async openWatchingRequests(): Promise<void> {
    this.urls = [];
    this.page.on("request", (request) => this.urls.push(request.url()));
    await this.page.goto(BASE_URL);
    await waitForCharacterSheetReady(this.page);
    // Fonts are only requested once text needs them
    await this.page.evaluate(() => document.fonts.ready);
  }

  requestedUrls(): string[] {
    return this.urls;
  }

  async loadedFontFamilies(): Promise<string[]> {
    return this.page.evaluate(() =>
      [...document.fonts]
        .filter((face) => face.status === "loaded")
        .map((face) => face.family.replace(/"/g, ""))
    );
  }
}
