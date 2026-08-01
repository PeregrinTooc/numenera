import type { Page } from "@playwright/test";
import "./testStorageHelper.js";

/**
 * Wait for the character sheet page to be fully ready after a navigation:
 * rendered AND the app's own initial persist-to-storage has landed.
 *
 * "load"/"domcontentloaded" fire before the app's async bootstrap
 * (renderCharacterSheet -> saveCharacterState, see src/main.ts) has run.
 * Steps that read or write storage right after navigating can race that
 * bootstrap save — reading storage before it lands returns null, and a
 * step that only writes when it sees a non-null character silently
 * no-ops. Waiting for both the rendered DOM and a persisted character
 * closes that window.
 */
export async function waitForCharacterSheetReady(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="character-name"]');
  await page.waitForFunction(async () => {
    if (!window.__testStorage) return false;
    const character = await window.__testStorage.loadCharacterState();
    return character !== null;
  });
}
