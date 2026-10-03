import type { Page } from "@playwright/test";

declare global {
  interface Window {
    __exportedFilename?: string;
    __exportedData?: string;
    __exportError?: string;
  }
}

export interface CapturedExport {
  filename: string;
  data: string;
}

/**
 * Stubs both export paths the app uses — showSaveFilePicker (Chromium) and the
 * <a download> blob fallback (WebKit/Firefox) — so an export lands in
 * window.__exportedFilename / __exportedData instead of on disk.
 */
export async function installExportCapture(page: Page): Promise<void> {
  await page.evaluate(() => {
    delete window.__exportedFilename;
    delete window.__exportedData;
    delete window.__exportError;

    const pickerWindow = window as unknown as {
      showSaveFilePicker: (options: { suggestedName: string }) => Promise<unknown>;
    };
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

    const originalCreateElement = document.createElement.bind(document);
    document.createElement = ((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName.toLowerCase() === "a") {
        const anchor = element as unknown as { download: string; href: string };
        element.click = () => {
          window.__exportedFilename = anchor.download;
          if (anchor.href.startsWith("blob:")) {
            void window
              .fetch(anchor.href)
              .then((res) => res.text())
              .then((data) => {
                window.__exportedData = data;
              })
              .catch((error: unknown) => {
                window.__exportError = String(error);
              });
          }
        };
      }
      return element;
    }) as typeof document.createElement;
  });
}

/**
 * Waits until the stubbed export has delivered both filename and data, or a
 * blob fetch error. Rejects with an "Export capture: ..." message on either
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
  if (error !== undefined) throw new Error(`Export capture: blob fetch failed: ${error}`);
  return page.evaluate(() => ({
    filename: window.__exportedFilename as string,
    data: window.__exportedData as string,
  }));
}
