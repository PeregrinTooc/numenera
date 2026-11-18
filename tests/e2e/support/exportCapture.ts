import { expect, type Page } from "@playwright/test";
import { waitForCharacterSheetReady } from "./app-ready.js";

/** What the save recorder has seen of the saves the app attempted. */
interface FileSaveRecord {
  dialogs: number;
  downloads: number;
  writes: number;
  cancelNext: boolean;
  filename?: string;
  data?: string;
  error?: string;
}

declare global {
  interface Window {
    __fileSave?: FileSaveRecord;
  }
}

export interface SavedFile {
  filename: string;
  data: string;
}

export interface ExportedCharacterFile {
  character: Record<string, unknown>;
  version: string;
  schemaVersion: string;
  exportDate: string;
  layout?: unknown[];
  versionHistory?: unknown;
}

/** Which save dialog the app is offered: the browser's own, one in every browser, or none. */
type SaveDialogOffer = "browser's" | "always" | "never";

/**
 * Runs in the page. Records every save the app attempts in window.__fileSave
 * instead of writing to disk: through the save dialog (showSaveFilePicker) or
 * through the <a download> fallback.
 */
function recordSaves(offer: SaveDialogOffer): void {
  const save: FileSaveRecord = { dialogs: 0, downloads: 0, writes: 0, cancelNext: false };
  window.__fileSave = save;

  if (offer === "never") {
    delete window.showSaveFilePicker;
  } else if (offer === "always" || "showSaveFilePicker" in window) {
    window.showSaveFilePicker = async (options) => {
      save.dialogs += 1;
      if (save.cancelNext) throw new window.DOMException("User cancelled", "AbortError");
      const filename = options?.suggestedName || "character.json";
      save.filename = filename;
      // The mock implements only the handle members the app uses.
      return {
        name: filename,
        kind: "file" as const,
        createWritable: async () => ({
          write: async (data: string) => {
            save.data = data;
            save.writes += 1;
          },
          close: async () => {},
        }),
        queryPermission: async () => "granted",
      } as unknown as FileSystemFileHandle;
    };
  }

  // The blob is read from the object, not fetched by its URL: the app revokes
  // the URL right after click(), and under request interception WebKit
  // resolves a fetch of it too late.
  const blobsByUrl = new Map<string, Blob>();
  const originalCreateObjectURL = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (object: Parameters<typeof URL.createObjectURL>[0]) => {
    const url = originalCreateObjectURL(object);
    if (object instanceof Blob) blobsByUrl.set(url, object);
    return url;
  };

  const originalCreateElement = document.createElement.bind(document);
  document.createElement = ((tagName: string) => {
    const element = originalCreateElement(tagName);
    if (tagName.toLowerCase() === "a") {
      const anchor = element as HTMLAnchorElement;
      element.click = () => {
        save.downloads += 1;
        save.filename = anchor.download;
        blobsByUrl
          .get(anchor.href)
          ?.text()
          .then((data) => {
            save.data = data;
          })
          .catch((error: unknown) => {
            save.error = String(error);
          });
      };
    }
    return element;
  }) as typeof document.createElement;
}

/** Records saves through whichever path this browser gives the app. */
export async function recordSavesAsTheBrowserWould(page: Page): Promise<void> {
  await page.evaluate<void, SaveDialogOffer>(recordSaves, "browser's");
}

/** Clicks Export and waits until the app has opened a save dialog or started a download. */
export async function clickExport(page: Page): Promise<void> {
  const attemptsBefore = await saveAttempts(page);
  await page.getByTestId("export-button").click();
  await expect.poll(() => saveAttempts(page)).toBeGreaterThan(attemptsBefore);
}

function saveAttempts(page: Page): Promise<number> {
  return page.evaluate(
    () => (window.__fileSave?.dialogs ?? 0) + (window.__fileSave?.downloads ?? 0)
  );
}

/** The file the app saved, once both its name and its contents have arrived. */
export async function savedFile(page: Page): Promise<SavedFile> {
  await page.waitForFunction(
    () => window.__fileSave?.error !== undefined || window.__fileSave?.data !== undefined
  );
  const save = await page.evaluate(() => window.__fileSave);
  if (save?.error !== undefined) throw new Error(`Reading the saved file failed: ${save.error}`);
  return { filename: save?.filename ?? "", data: save?.data ?? "" };
}

/** The export controls in the header, and the browser's save facilities behind them. */
export interface FileExportDriver {
  offerSaveDialog(): Promise<void>;
  offerDownloadOnly(): Promise<void>;
  recordSavesAsTheBrowserWould(): Promise<void>;
  cancelNextSave(): Promise<void>;
  waitForHeader(): Promise<void>;
  expectButton(text: string): Promise<void>;
  expectNoButton(text: string): Promise<void>;
  expectExportButtonVisible(): Promise<void>;
  clickExport(): Promise<void>;
  clickQuickExport(): Promise<void>;
  clickSaveAs(): Promise<void>;
  savedFile(): Promise<SavedFile>;
  savedData(): Promise<string | undefined>;
  saveDialogCount(): Promise<number>;
  downloadCount(): Promise<number>;
}

export class PlaywrightFileExportDriver implements FileExportDriver {
  constructor(private page: Page) {}

  /**
   * Installs the dialog before the app boots, then reloads: the header decides
   * once, at construction, whether to offer Quick Export / Save As, and WebKit
   * has no native dialog a later stub could reach.
   */
  async offerSaveDialog(): Promise<void> {
    await this.page.addInitScript<SaveDialogOffer>(recordSaves, "always");
    await this.page.reload();
    await waitForCharacterSheetReady(this.page);
  }

  async offerDownloadOnly(): Promise<void> {
    await this.page.evaluate<void, SaveDialogOffer>(recordSaves, "never");
  }

  async recordSavesAsTheBrowserWould(): Promise<void> {
    await recordSavesAsTheBrowserWould(this.page);
  }

  async cancelNextSave(): Promise<void> {
    await this.page.evaluate(() => {
      if (window.__fileSave) window.__fileSave.cancelNext = true;
    });
  }

  async waitForHeader(): Promise<void> {
    await this.page.waitForSelector(".character-header", { state: "visible" });
  }

  async expectButton(text: string): Promise<void> {
    await expect(this.page.locator(`button:has-text("${text}")`)).toBeVisible();
  }

  // Exact text, so "Export" does not match "Quick Export".
  async expectNoButton(text: string): Promise<void> {
    await expect(this.page.locator(`button:text-is("${text}")`)).not.toBeVisible();
  }

  async expectExportButtonVisible(): Promise<void> {
    await expect(this.page.getByTestId("export-button")).toBeVisible();
  }

  async clickExport(): Promise<void> {
    await clickExport(this.page);
  }

  async clickQuickExport(): Promise<void> {
    const button = this.page.getByTestId("quick-export-button");
    await expect(button).toBeVisible();
    const writesBefore = await this.countOf("writes");
    await button.click();
    await expect.poll(() => this.countOf("writes")).toBeGreaterThan(writesBefore);
  }

  async clickSaveAs(): Promise<void> {
    const button = this.page.getByTestId("save-as-button");
    await expect(button).toBeVisible();
    const dialogsBefore = await this.countOf("dialogs");
    await button.click();
    await expect.poll(() => this.countOf("dialogs")).toBeGreaterThan(dialogsBefore);
  }

  async savedFile(): Promise<SavedFile> {
    return savedFile(this.page);
  }

  async savedData(): Promise<string | undefined> {
    return this.page.evaluate(() => window.__fileSave?.data);
  }

  async saveDialogCount(): Promise<number> {
    return this.countOf("dialogs");
  }

  async downloadCount(): Promise<number> {
    return this.countOf("downloads");
  }

  private async countOf(counter: "dialogs" | "downloads" | "writes"): Promise<number> {
    return this.page.evaluate((name) => window.__fileSave?.[name] ?? 0, counter);
  }
}
