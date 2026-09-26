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

/**
 * Wait for the "New" button's own render+save to land in storage.
 *
 * Clicking "new-button" re-runs the same render -> saveCharacterState
 * pipeline as the initial bootstrap (see src/main.ts), fired from a click
 * handler that Playwright's click() does not await. A step that writes to
 * storage right after the click (e.g. importing a file, or loading a
 * different character) can race that save and get silently overwritten
 * once it lands. NEW_CHARACTER (src/data/mockCharacters.ts) always has an
 * empty name, which no other character in these tests does, so waiting
 * for a persisted character with that empty name is a reliable signal
 * that this specific save has completed.
 */
export async function waitForNewCharacterPersisted(page: Page): Promise<void> {
  await page.waitForFunction(async () => {
    if (!window.__testStorage) return false;
    const character = await window.__testStorage.loadCharacterState();
    return character !== null && character.name === "";
  });
}

/**
 * Navigate to the character sheet and click "New" to start with an empty
 * character, waiting out both async races along the way: the page's own
 * bootstrap save (before the click can be trusted to land) and the New
 * button's render+save (before anything after this helper touches storage).
 */
export async function startNewCharacter(page: Page, baseUrl: string): Promise<void> {
  await page.goto(baseUrl);
  await waitForCharacterSheetReady(page);
  await page.getByTestId("new-button").click();
  await waitForNewCharacterPersisted(page);
}
