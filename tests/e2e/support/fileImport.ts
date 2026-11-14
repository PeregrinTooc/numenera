import { expect, type Page } from "@playwright/test";
import type { ClockDriver } from "./clockDriver.js";
import { IMPORT_FEEDBACK_DELAY_MS } from "@/app/fileActions";
import { SCHEMA_VERSION } from "@/storage/storageConstants";

/**
 * Imports a file through the app's real import flow: Import button, native
 * <input type="file">, parser and sanitizer.
 *
 * The File System Access picker is removed first so every engine takes the
 * <input type="file"> path (WebKit and Firefox have no picker anyway), which
 * Playwright can answer with its `filechooser` event.
 *
 * The app shows import warnings and the layout prompt a moment after the
 * character appears, so the clock is advanced past that moment once the
 * character is on the sheet. A file with no character has nothing to wait for.
 */
export async function importFile(
  page: Page,
  clock: ClockDriver,
  filename: string,
  content: unknown
): Promise<void> {
  await page.evaluate(() => {
    const pickerWindow = window as unknown as { showOpenFilePicker?: unknown };
    delete pickerWindow.showOpenFilePicker;
  });

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByTestId("import-button").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: filename,
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(content)),
  });

  const name = importedName(content);
  if (name === undefined) return;
  const shown = page.getByTestId("character-name");
  // Advancing while the import is still parsing is harmless: nothing is pending yet.
  await expect
    .poll(async () => {
      await clock.advance(IMPORT_FEEDBACK_DELAY_MS);
      return (await shown.textContent())?.trim();
    })
    .toBe(name);
  await clock.advance(IMPORT_FEEDBACK_DELAY_MS);
}

function importedName(content: unknown): string | undefined {
  if (typeof content !== "object" || content === null || !("character" in content)) return;
  const { character } = content;
  if (typeof character !== "object" || character === null || !("name" in character)) return;
  return typeof character.name === "string" ? character.name : undefined;
}

export function numeneraFile(
  character: unknown,
  schemaVersion: string = SCHEMA_VERSION
): Record<string, unknown> {
  return {
    version: "1.0",
    schemaVersion,
    exportDate: new Date().toISOString(),
    character,
  };
}
