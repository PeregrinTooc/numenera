import type { Page } from "@playwright/test";
import { SCHEMA_VERSION } from "@/storage/storageConstants";

/**
 * Imports a file through the app's real import flow: Import button, native
 * <input type="file">, parser and sanitizer.
 *
 * The File System Access picker is removed first so every engine takes the
 * <input type="file"> path (WebKit and Firefox have no picker anyway), which
 * Playwright can answer with its `filechooser` event.
 */
export async function importFile(page: Page, filename: string, content: unknown): Promise<void> {
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
}

/** Wraps a character in the .numenera file envelope the exporter writes. */
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
