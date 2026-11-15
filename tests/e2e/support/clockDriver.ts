import type { Page } from "@playwright/test";

/**
 * The app's clock never moves by itself under test; this is how a scenario lets
 * time pass. Callbacks the advance fires run synchronously in the page, so any
 * async work they start (a save, a squash) is awaited through its outcome.
 */
export interface ClockDriver {
  advance(ms: number): Promise<void>;
}

export class PlaywrightClockDriver implements ClockDriver {
  constructor(private page: Page) {}

  async advance(ms: number): Promise<void> {
    await this.page.evaluate((delay) => {
      const clock = window.__manualClock;
      if (!clock) {
        throw new Error("The app is not running on the manual clock");
      }
      clock.advance(delay);
    }, ms);
  }
}
