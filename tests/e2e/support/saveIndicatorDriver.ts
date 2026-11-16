import { expect, type Locator, type Page } from "@playwright/test";
import { waitForSaveComplete } from "./save.js";

const INDICATOR = '[data-testid="save-indicator"]';
const EDGE_TOLERANCE_PX = 100;
const MAX_SUBTLE_FONT_SIZE_PX = 16;

declare global {
  interface Window {
    __saveIndicatorUpdates?: number;
    __saveIndicatorObserver?: MutationObserver;
  }
}

/** What the save indicator shows and how it looks. */
export interface SaveIndicatorDriver {
  text(): Promise<string>;
  expectVisible(): Promise<void>;
  expectShowsText(text: string): Promise<void>;
  expectShowsTime(): Promise<void>;
  expectNotShowingText(text: string): Promise<void>;
  expectAlertShowing(text: string): Promise<void>;
  expectNoAlert(): Promise<void>;
  expectInsideViewport(): Promise<void>;
  expectInLowerRightCorner(): Promise<void>;
  expectSubtleStyling(): Promise<void>;
  startCountingUpdates(): Promise<void>;
  stopCountingUpdates(): Promise<number>;
}

export class PlaywrightSaveIndicatorDriver implements SaveIndicatorDriver {
  constructor(private page: Page) {}

  private get indicator(): Locator {
    return this.page.locator(INDICATOR);
  }

  async text(): Promise<string> {
    await expect(this.indicator).toBeVisible();
    return (await this.indicator.textContent()) ?? "";
  }

  async expectVisible(): Promise<void> {
    await expect(this.indicator).toBeVisible();
  }

  async expectShowsText(text: string): Promise<void> {
    await expect(this.indicator).toContainText(text);
  }

  async expectShowsTime(): Promise<void> {
    await expect(this.indicator).toHaveText(/\d{1,2}:\d{2}:\d{2}(\s?[AP]M)?/);
  }

  async expectNotShowingText(text: string): Promise<void> {
    await expect(this.indicator).not.toContainText(text);
  }

  async expectAlertShowing(text: string): Promise<void> {
    const alert = this.page.locator(`${INDICATOR}[role="alert"]`);
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(text);
  }

  async expectNoAlert(): Promise<void> {
    await expect(this.page.locator(`${INDICATOR}[role="alert"]`)).toHaveCount(0);
  }

  async expectInsideViewport(): Promise<void> {
    const box = await this.indicator.boundingBox();
    const viewport = this.page.viewportSize();
    if (!box || !viewport) {
      throw new Error("The save indicator or the viewport has no measurable size");
    }
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  }

  async expectInLowerRightCorner(): Promise<void> {
    await expect(this.indicator).toBeVisible();
    const box = await this.indicator.boundingBox();
    const viewport = this.page.viewportSize();
    if (!box || !viewport) {
      throw new Error("The save indicator or the viewport has no measurable size");
    }
    expect(box.x + box.width).toBeGreaterThan(viewport.width - EDGE_TOLERANCE_PX);
    expect(box.y + box.height).toBeGreaterThan(viewport.height - EDGE_TOLERANCE_PX);
  }

  async expectSubtleStyling(): Promise<void> {
    await expect(this.indicator).toBeVisible();
    const styles = await this.indicator.evaluate((el: HTMLElement) => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        fontSize: computed.fontSize,
        opacity: computed.opacity,
      };
    });
    expect(styles.position).toBe("fixed");
    expect(parseFloat(styles.fontSize)).toBeLessThan(MAX_SUBTLE_FONT_SIZE_PX);
    expect(parseFloat(styles.opacity)).toBeGreaterThan(0);
    expect(parseFloat(styles.opacity)).toBeLessThanOrEqual(1);
  }

  async startCountingUpdates(): Promise<void> {
    await this.page.evaluate((selector) => {
      const indicator = document.querySelector(selector);
      if (!indicator) {
        throw new Error("The save indicator is not on the page");
      }
      window.__saveIndicatorUpdates = 0;
      const observer = new MutationObserver(() => {
        window.__saveIndicatorUpdates = (window.__saveIndicatorUpdates ?? 0) + 1;
      });
      observer.observe(indicator, { childList: true, subtree: true, characterData: true });
      window.__saveIndicatorObserver = observer;
    }, INDICATOR);
  }

  async stopCountingUpdates(): Promise<number> {
    await waitForSaveComplete(this.page);
    return this.page.evaluate(() => {
      window.__saveIndicatorObserver?.disconnect();
      return window.__saveIndicatorUpdates ?? 0;
    });
  }
}
