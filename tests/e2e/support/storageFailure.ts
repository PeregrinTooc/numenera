import type { Page } from "@playwright/test";

/**
 * Make every write of the character fail, in IndexedDB and in the localStorage
 * fallback, with a DOMException of the given name ("QuotaExceededError" for a
 * full storage). Only the character store is affected: version history, layout
 * and the storage availability probe keep working.
 */
export async function failStorageWrites(page: Page, errorName: string): Promise<void> {
  await page.evaluate((name) => {
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

/** Undo failStorageWrites. */
export async function restoreStorageWrites(page: Page): Promise<void> {
  await page.evaluate(() => window.__restoreStorageWrites?.());
}
