import type { Page } from "@playwright/test";
import { waitForSaveComplete } from "./save.js";

const VERSION_COUNTER = '[data-testid="version-counter"]';
const COMPARISON_VIEW = '[data-testid="comparison-view"]';

export interface VersionPosition {
  current: number;
  total: number;
}

export async function readVersionPosition(page: Page): Promise<VersionPosition> {
  const text = (await page.locator(VERSION_COUNTER).textContent()) ?? "";
  const match = text.match(/(\d+)\D+(\d+)/);
  if (!match) {
    throw new Error(`Version counter has unexpected text: "${text}"`);
  }
  return { current: parseInt(match[1], 10), total: parseInt(match[2], 10) };
}

/**
 * Click a version-navigator or banner button and wait until the app has
 * navigated: the counter shows a different position, or (with the opt-in
 * Comparison View enabled) the comparison view has opened instead.
 */
export async function clickAndAwaitNavigation(page: Page, buttonTestId: string): Promise<void> {
  const before = await page.locator(VERSION_COUNTER).textContent();
  await page.locator(`[data-testid="${buttonTestId}"]`).click();
  await page.waitForFunction(
    ({ counter, comparison, previous }) =>
      document.querySelector(comparison) !== null ||
      document.querySelector(counter)?.textContent !== previous,
    { counter: VERSION_COUNTER, comparison: COMPARISON_VIEW, previous: before }
  );
}

/**
 * Resolves once a forced squash has been persisted and the app has finished
 * reacting to it. The app rebuilds the version navigator as the last step of
 * handling "version-squashed", so a counter element without the pre-squash
 * mark means that handling is done. An empty buffer squashes nothing and
 * emits no event. A still-pending auto-save is flushed first: its completion
 * handler reloads the version list and would otherwise jump the navigator to
 * the latest version after the squash.
 */
export async function forceSquash(page: Page): Promise<void> {
  await waitForSaveComplete(page);
  const squashes = await page.evaluate(async (counterSelector) => {
    const service = window.__versionHistoryService;
    if (!service) {
      throw new Error("Version history service not available. Make sure the app has loaded.");
    }
    const hasBufferedChanges = service.getBufferLength() > 0;
    document.querySelector(counterSelector)?.setAttribute("data-pre-squash", "");
    await service.forceSquash();
    return hasBufferedChanges;
  }, VERSION_COUNTER);
  if (squashes) {
    await page.waitForSelector(`${VERSION_COUNTER}:not([data-pre-squash])`);
  }
}
