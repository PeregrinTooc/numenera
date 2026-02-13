import type { ICharacterStorage } from "./ICharacterStorage.js";
import { STORAGE_KEY } from "./storageConstants.js";
import { CompletionNotifier } from "../utils/completionNotifier.js";

const DB_NAME = "numenera-character-db";
const STORE_NAME = "characters";
const DB_VERSION = 1;
const CHARACTER_KEY = "current";

export class IndexedDBStorageImpl implements ICharacterStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async save(character: any): Promise<void> {
    const notifier = new CompletionNotifier("character-save", { data: { source: "indexedDB" } });
    notifier.start();

    try {
      await this.saveInternal(character);
      notifier.complete({ source: "indexedDB" });
    } catch (error) {
      notifier.error(error);
      throw error;
    }
  }

  /**
   * Internal save without event emissions
   * Used during migration to avoid nested events
   */
  private async saveInternal(character: any): Promise<void> {
    if (!this.db) {
      throw new Error("IndexedDB not initialized");
    }

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(character, CHARACTER_KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to save character"));
    });
  }

  async load(): Promise<any | null> {
    const notifier = new CompletionNotifier("character-load", { data: { source: "indexedDB" } });
    notifier.start();

    try {
      if (!this.db) {
        throw new Error("IndexedDB not initialized");
      }

      const result = await new Promise<any | null>((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(CHARACTER_KEY);

        request.onsuccess = () => {
          const result = request.result;
          resolve(result || null);
        };

        request.onerror = () => reject(new Error("Failed to load character"));
      });

      notifier.complete({ source: "indexedDB", found: result !== null });
      return result;
    } catch (error) {
      notifier.error(error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    if (!this.db) {
      throw new Error("IndexedDB not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(CHARACTER_KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to clear character"));
    });
  }

  /**
   * Close the database connection
   * Should be called when done with the storage instance
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if IndexedDB is available
      if (!("indexedDB" in window)) {
        return false;
      }

      // Try to open a test database to verify it actually works
      // (Some browsers report IndexedDB as available but it doesn't work in private mode)
      const testDB = "test-availability";
      return new Promise((resolve) => {
        const request = indexedDB.open(testDB, 1);

        request.onsuccess = () => {
          request.result.close();
          indexedDB.deleteDatabase(testDB);
          resolve(true);
        };

        request.onerror = () => {
          resolve(false);
        };

        request.onblocked = () => {
          resolve(false);
        };

        // Only set timeout in browser (not in test environment)
        // In test environment with vitest globals, 'vi' will be available
        const isTestEnv = typeof (globalThis as any).vi !== "undefined";
        if (!isTestEnv) {
          setTimeout(() => resolve(false), 1000);
        }
      });
    } catch {
      return false;
    }
  }

  /**
   * Migrate data from localStorage to IndexedDB
   * This is called by the factory when IndexedDB is first initialized
   */
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return; // Nothing to migrate
      }

      let character;
      try {
        const parsed = JSON.parse(stored);

        // Handle old versioned format: { version: 1, data: {...} }
        if (parsed && typeof parsed === "object" && "version" in parsed && "data" in parsed) {
          console.log("Migrating from old versioned format to IndexedDB");
          character = parsed.data;
        } else {
          // New format: raw character object
          character = parsed;
        }
      } catch (error) {
        console.error("Failed to parse localStorage data during migration:", error);
        return; // Don't migrate corrupted data
      }

      // Save to IndexedDB using internal method to avoid nested events
      await this.saveInternal(character);

      // Remove from localStorage after successful migration
      localStorage.removeItem(STORAGE_KEY);
      console.log("Successfully migrated character data from localStorage to IndexedDB");
    } catch (error) {
      console.error("Failed to migrate from localStorage:", error);
      // Don't throw - we want the app to continue even if migration fails
    }
  }
}
