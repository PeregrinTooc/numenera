import type { Page } from "@playwright/test";

/** Resolves once any pending or in-flight auto-save has been written to storage. */
export async function waitForSaveComplete(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const service = window.__autoSaveService;
    if (!service) {
      throw new Error("waitForSaveComplete: window.__autoSaveService is not available");
    }
    await service.flush();
  });
}
