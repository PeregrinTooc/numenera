import { expect } from "@playwright/test";
import type { RequestsDriver } from "./requestsDriver.js";
import { BASE_URL } from "./serverUrl.js";

export class RequestsDsl {
  constructor(private requests: RequestsDriver) {}

  async opensTheSheetAndWatchesRequests(): Promise<void> {
    await this.requests.openWatchingRequests();
  }

  expectNothingRequestedFromAnotherSite(): void {
    const ownOrigin = new URL(BASE_URL).origin;
    const elsewhere = this.requests
      .requestedUrls()
      .filter((url) => /^https?:/.test(url) && new URL(url).origin !== ownOrigin);
    expect(elsewhere).toEqual([]);
  }

  async expectFontsLoaded(first: string, second: string): Promise<void> {
    expect(await this.requests.loadedFontFamilies()).toEqual(
      expect.arrayContaining([first, second])
    );
  }
}
