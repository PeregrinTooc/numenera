import type { Page } from "@playwright/test";

/** The auto-save debounce is 300ms; a fixed wait just past it is faster than polling state. */
export async function waitForSaveComplete(page: Page, timeoutMs: number = 400): Promise<void> {
  await page.waitForTimeout(timeoutMs);
}
