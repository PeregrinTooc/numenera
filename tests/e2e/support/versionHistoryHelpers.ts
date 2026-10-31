import type { Page } from "@playwright/test";

/**
 * Force immediate squash for testing
 * Replaces arbitrary timeout waits with deterministic squash control
 */
export async function forceSquash(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const service = window.__versionHistoryService;
    if (!service) {
      throw new Error("Version history service not available. Make sure the app has loaded.");
    }
    await service.forceSquash();
  });
  // Small wait for UI to update after squash
  await page.waitForTimeout(100);
}
