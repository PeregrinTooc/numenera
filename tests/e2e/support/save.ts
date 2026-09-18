import type { Page } from "@playwright/test";

/**
 * Wait for auto-save to complete
 * This uses a simple timeout that's slightly longer than the debounce period
 *
 * Strategy: The auto-save has a 300ms debounce. We wait 400ms to ensure
 * the debounce has fired and the save has completed. This is faster than
 * polling and checking state repeatedly.
 */
export async function waitForSaveComplete(page: Page, timeoutMs: number = 400): Promise<void> {
  // Simple timeout - faster than polling for state that's usually already complete
  await page.waitForTimeout(timeoutMs);
}
