import type { Page } from "@playwright/test";

declare global {
  interface Window {
    __exportedFilename?: string;
    __exportedData?: string;
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
              });
          }
        };
      }
      return element;
    }) as typeof document.createElement;
  });
}

/** Waits until the stubbed export has delivered both filename and data. */
export async function waitForExportCapture(page: Page): Promise<CapturedExport> {
  await page.waitForFunction(
    () => window.__exportedFilename !== undefined && window.__exportedData !== undefined
  );
  return page.evaluate(() => ({
    filename: window.__exportedFilename as string,
    data: window.__exportedData as string,
  }));
}
