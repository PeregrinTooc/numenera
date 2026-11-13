import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const COMPARE_FIELD_TEST_IDS: Record<string, string> = {
  "character name": "character-name",
  tier: "character-tier",
};

export function panePrefix(side: "left" | "right"): string {
  return `[data-testid="compare-pane-${side}"]`;
}

// For the pane's own compound testids (compare-pane-left-backward etc.),
// which are a single attribute value, not a descendant of panePrefix().
export function paneControl(side: "left" | "right", control: string): string {
  return `[data-testid="compare-pane-${side}-${control}"]`;
}

/** Click a comparison pane's arrow and wait until that pane's counter shows a different position. */
export async function clickPaneArrowAndAwaitMove(
  page: Page,
  side: "left" | "right",
  direction: "backward" | "forward"
): Promise<void> {
  const counter = page.locator(paneControl(side, "counter"));
  const before = (await counter.textContent()) ?? "";
  await page.locator(paneControl(side, direction)).click();
  await expect(counter).not.toHaveText(before);
}

async function latestVersionId(page: Page): Promise<string | undefined> {
  return page.evaluate(async () => {
    const versions = (await window.__testVersionHistory?.getAllVersions()) ?? [];
    return versions[versions.length - 1]?.id;
  });
}

/** Click a pane's restore button and wait until the restored version is the newest stored one. */
export async function restoreFromPane(page: Page, side: "left" | "right"): Promise<void> {
  const before = await latestVersionId(page);
  await page.locator(paneControl(side, "restore")).click();
  await expect.poll(() => latestVersionId(page)).not.toBe(before);
}
