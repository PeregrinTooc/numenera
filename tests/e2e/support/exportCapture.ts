import { expect, type Page } from "@playwright/test";
import { waitForCharacterSheetReady } from "./app-ready.js";

/** What the file-save mock records about the saves the app attempted. */
interface FileSaveRecord {
  dialogs: number;
  writes: number;
  cancelNext: boolean;
  filename?: string;
  data?: string;
}

declare global {
  interface Window {
    __exportedFilename?: string;
    __exportedData?: string;
    __exportError?: string;
    __fileSave?: FileSaveRecord;
  }
}

export interface CapturedExport {
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

/** The export controls in the header, and the browser's save facilities behind them. */
export interface FileExportDriver {
  offerSavePicker(): Promise<void>;
  offerDownloadOnly(): Promise<void>;
  cancelNextSave(): Promise<void>;
  waitForHeader(): Promise<void>;
  expectButton(text: string): Promise<void>;
  expectNoButton(text: string): Promise<void>;
  expectExportButtonVisible(): Promise<void>;
  clickExport(): Promise<void>;
  clickQuickExport(): Promise<void>;
  clickSaveAs(): Promise<void>;
  exportAndCapture(): Promise<CapturedExport>;
  waitForSavedFilename(): Promise<string>;
  waitForSavedData(): Promise<string>;
  savedData(): Promise<string | undefined>;
  saveDialogCount(): Promise<number>;
  waitForSaveDialog(): Promise<void>;
}

/**
 * Captures an export in window.__exportedFilename / __exportedData instead of
 * writing to disk. Each browser keeps the path the app picks for it: the
 * showSaveFilePicker stub only replaces a picker the browser really has
 * (Chromium), so WebKit still runs the real <a download> blob fallback.
 */
export async function installExportCapture(page: Page): Promise<void> {
  await page.evaluate(() => {
    delete window.__exportedFilename;
    delete window.__exportedData;
    delete window.__exportError;

    const pickerWindow = window as unknown as {
      showSaveFilePicker: (options: { suggestedName: string }) => Promise<unknown>;
    };
    if ("showSaveFilePicker" in window) {
      pickerWindow.showSaveFilePicker = async (options) => {
        window.__exportedFilename = options.suggestedName;
        return {
          name: options.suggestedName,
          kind: "file",
          createWritable: async () => ({
            write: async (data: string) => {
              window.__exportedData = data;
            },
            close: async () => {},
          }),
          queryPermission: async () => "granted",
        };
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
        const anchor = element as unknown as { download: string; href: string };
        element.click = () => {
          window.__exportedFilename = anchor.download;
          blobsByUrl
            .get(anchor.href)
            ?.text()
            .then((data) => {
              window.__exportedData = data;
            })
            .catch((error: unknown) => {
              window.__exportError = String(error);
            });
        };
      }
      return element;
    }) as typeof document.createElement;
  });
}

/**
 * Waits until the stubbed export has delivered both filename and data, or a
 * blob read error. Rejects with an "Export capture: ..." message on either
 * an error or a timeout, rather than hanging until the step timeout.
 */
export async function waitForExportCapture(page: Page, timeoutMs = 5000): Promise<CapturedExport> {
  try {
    await page.waitForFunction(
      () =>
        window.__exportError !== undefined ||
        (window.__exportedFilename !== undefined && window.__exportedData !== undefined),
      undefined,
      { timeout: timeoutMs }
    );
  } catch {
    const seen = await page.evaluate(() => ({
      filename: window.__exportedFilename ?? null,
      hasData: window.__exportedData !== undefined,
    }));
    throw new Error(
      `Export capture: nothing captured within ${timeoutMs}ms (filename=${seen.filename}, data=${seen.hasData})`
    );
  }
  const error = await page.evaluate(() => window.__exportError);
  if (error !== undefined) throw new Error(`Export capture: blob read failed: ${error}`);
  return page.evaluate(() => ({
    filename: window.__exportedFilename as string,
    data: window.__exportedData as string,
  }));
}

export class PlaywrightFileExportDriver implements FileExportDriver {
  constructor(private page: Page) {}

  /**
   * Installs the picker before the app boots, then reloads: the header decides
   * once, at construction, whether to offer Quick Export / Save As, and WebKit
   * has no native picker a later stub could reach.
   */
  async offerSavePicker(): Promise<void> {
    await this.page.addInitScript(() => {
      const save: FileSaveRecord = { dialogs: 0, writes: 0, cancelNext: false };
      window.__fileSave = save;
      window.showSaveFilePicker = async (options?: { suggestedName?: string }) => {
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
    });
    await this.page.reload();
    await waitForCharacterSheetReady(this.page);
  }

  async offerDownloadOnly(): Promise<void> {
    await this.page.evaluate(() => {
      const save: FileSaveRecord = { dialogs: 0, writes: 0, cancelNext: false };
      window.__fileSave = save;
      delete window.showSaveFilePicker;

      const originalCreateElement = document.createElement.bind(document);
      document.createElement = function (tagName: string) {
        const element = originalCreateElement(tagName);
        if (tagName === "a") {
          element.click = function () {
            const anchor = element as HTMLAnchorElement;
            save.filename = anchor.download;
            if (anchor.href.startsWith("blob:")) {
              window
                .fetch(anchor.href)
                .then((res) => res.text())
                .then((data) => {
                  save.data = data;
                });
            }
          };
        }
        return element;
      };
    });
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
    await this.page.getByTestId("export-button").click();
  }

  async clickQuickExport(): Promise<void> {
    const button = this.page.getByTestId("quick-export-button");
    await expect(button).toBeVisible();
    const writesBefore = await this.countOf("writes");
    await button.click();
    await this.page.waitForFunction(
      (before: number) => (window.__fileSave?.writes ?? 0) > before,
      writesBefore
    );
  }

  async clickSaveAs(): Promise<void> {
    const button = this.page.getByTestId("save-as-button");
    await expect(button).toBeVisible();
    const dialogsBefore = await this.countOf("dialogs");
    await button.click();
    await this.page.waitForFunction(
      (before: number) => (window.__fileSave?.dialogs ?? 0) > before,
      dialogsBefore
    );
  }

  async exportAndCapture(): Promise<CapturedExport> {
    await installExportCapture(this.page);
    await this.clickExport();
    return waitForExportCapture(this.page);
  }

  async waitForSavedFilename(): Promise<string> {
    await this.page.waitForFunction(() => Boolean(window.__fileSave?.filename));
    return this.page.evaluate(() => window.__fileSave?.filename as string);
  }

  async waitForSavedData(): Promise<string> {
    await this.page.waitForFunction(() => Boolean(window.__fileSave?.data));
    return this.page.evaluate(() => window.__fileSave?.data as string);
  }

  async savedData(): Promise<string | undefined> {
    return this.page.evaluate(() => window.__fileSave?.data);
  }

  async saveDialogCount(): Promise<number> {
    return this.countOf("dialogs");
  }

  async waitForSaveDialog(): Promise<void> {
    await this.page.waitForFunction(() => (window.__fileSave?.dialogs ?? 0) >= 1);
  }

  private async countOf(counter: "dialogs" | "writes"): Promise<number> {
    return this.page.evaluate((name) => window.__fileSave?.[name] ?? 0, counter);
  }
}
