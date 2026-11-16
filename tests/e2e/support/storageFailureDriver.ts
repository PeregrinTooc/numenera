import type { Page } from "@playwright/test";

/** Makes the browser's character storage reject writes, and lets it work again. */
export interface StorageFailureDriver {
  failWrites(errorName: string): Promise<void>;
  restoreWrites(): Promise<void>;
}

/**
 * Makes every write of the character fail, in IndexedDB and in the localStorage
 * fallback, with a DOMException of the given name ("QuotaExceededError" for a
 * full storage). Only the character store is affected: version history, layout
 * and the storage availability probe keep working.
 */
export class PlaywrightStorageFailureDriver implements StorageFailureDriver {
  constructor(private page: Page) {}

  async failWrites(errorName: string): Promise<void> {
    await this.page.evaluate((name) => {
      const originalPut = window.IDBObjectStore.prototype.put;
      const originalSetItem = Storage.prototype.setItem;
      window.IDBObjectStore.prototype.put = function (value: unknown, key?: string) {
        if (this.name === "characters") throw new DOMException("simulated failure", name);
        return originalPut.call(this, value, key);
      };
      Storage.prototype.setItem = function (key: string, value: string) {
        if (key === "numenera-character-state") throw new DOMException("simulated failure", name);
        return originalSetItem.call(this, key, value);
      };
      window.__restoreStorageWrites = () => {
        window.IDBObjectStore.prototype.put = originalPut;
        Storage.prototype.setItem = originalSetItem;
      };
    }, errorName);
  }

  async restoreWrites(): Promise<void> {
    await this.page.evaluate(() => window.__restoreStorageWrites?.());
  }
}
