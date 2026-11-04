import type { ICharacterStorage } from "./ICharacterStorage.js";
import { STORAGE_KEY, CHARACTER_DB_NAME } from "./storageConstants.js";
import { openDatabase, requireDatabase, runRequest, transactionDone } from "./idb.js";
import type { Character } from "@/types/character";
import { logger } from "@/utils/logger";

const DB_NAME = CHARACTER_DB_NAME;
const STORE_NAME = "characters";
const DB_VERSION = 1;
const CHARACTER_KEY = "current";
const UNREADABLE_BACKUP_KEY = "unreadable-backup";
const DEFAULT_AVAILABILITY_TIMEOUT_MS = 1000;

export class IndexedDBStorageImpl implements ICharacterStorage {
  private db: IDBDatabase | null = null;

  /**
   * @param availabilityTimeoutMs How long isAvailable() waits for the probe database to
   *   open before reporting IndexedDB as unusable (some browsers hang in private mode).
   */
  constructor(private readonly availabilityTimeoutMs: number = DEFAULT_AVAILABILITY_TIMEOUT_MS) {}

  async init(): Promise<void> {
    this.db = await openDatabase(
      DB_NAME,
      DB_VERSION,
      (db) => {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
      () => new Error("Failed to open IndexedDB")
    );
  }

  async save(character: Character): Promise<void> {
    await this.saveInternal(character);
  }

  private async saveInternal(character: unknown): Promise<void> {
    return this.putInternal(CHARACTER_KEY, character);
  }

  private async putInternal(key: string, value: unknown): Promise<void> {
    const transaction = this.requireStore().transaction([STORE_NAME], "readwrite");
    const request = transaction.objectStore(STORE_NAME).put(value, key);
    const done = transactionDone(
      transaction,
      () => request.error ?? new Error("Failed to save character")
    );

    // Commit as soon as the request is queued instead of waiting for the implicit
    // auto-commit. A save issued from an unload handler otherwise commits too late:
    // the reloaded page can read the previous value and overwrite the edit.
    transaction.commit();
    return done;
  }

  async load(): Promise<unknown> {
    return this.loadInternal();
  }

  private async loadInternal(): Promise<unknown> {
    return this.getInternal(CHARACTER_KEY);
  }

  private async getInternal(key: string): Promise<unknown> {
    const result = await runRequest(
      this.requireStore(),
      STORE_NAME,
      "readonly",
      (store) => store.get(key),
      () => new Error("Failed to load character")
    );
    return result || null;
  }

  async saveCorruptedBackup(raw: unknown): Promise<void> {
    await this.putInternal(UNREADABLE_BACKUP_KEY, raw);
  }

  async loadCorruptedBackup(): Promise<unknown> {
    return (await this.getInternal(UNREADABLE_BACKUP_KEY)) ?? null;
  }

  async clearCorruptedBackup(): Promise<void> {
    await this.deleteInternal(UNREADABLE_BACKUP_KEY);
  }

  async clear(): Promise<void> {
    await this.deleteInternal(CHARACTER_KEY);
  }

  private async deleteInternal(key: string): Promise<void> {
    await runRequest(
      this.requireStore(),
      STORE_NAME,
      "readwrite",
      (store) => store.delete(key),
      () => new Error("Failed to clear character")
    );
  }

  private requireStore(): IDBDatabase {
    const db = requireDatabase(this.db, "IndexedDB not initialized");
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      throw new Error(`Object store '${STORE_NAME}' not found in database`);
    }
    return db;
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

        setTimeout(() => resolve(false), this.availabilityTimeoutMs);
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
      // Verify database and object store are ready
      if (!this.db || !this.db.objectStoreNames.contains(STORE_NAME)) {
        console.warn("IndexedDB not ready for migration, skipping localStorage migration");
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return; // Nothing to migrate
      }

      // Migration is one-way and one-time: adopt the localStorage copy only when
      // IndexedDB is genuinely empty. This runs on every page load, so without
      // the guard a stale localStorage entry is replayed over newer IndexedDB
      // data and silently reverts the user's most recent edits.
      const existing = await this.loadInternal();
      if (existing !== null) {
        localStorage.removeItem(STORAGE_KEY);
        logger.info("IndexedDB already populated; discarded stale localStorage copy");
        return;
      }

      let character;
      try {
        const parsed = JSON.parse(stored);

        // Handle old versioned format: { version: 1, data: {...} }
        if (parsed && typeof parsed === "object" && "version" in parsed && "data" in parsed) {
          logger.info("Migrating from old versioned format to IndexedDB");
          character = parsed.data;
        } else {
          // New format: raw character object
          character = parsed;
        }
      } catch (error) {
        // Adopt the unparseable text as-is instead of leaving it behind: the stale-copy
        // cleanup above would delete it on a later load. The app sees a value that is no
        // character, keeps it as the unreadable backup and offers it for download.
        console.error("Failed to parse localStorage data during migration:", error);
        character = stored;
      }

      // Save to IndexedDB using internal method to avoid nested events
      await this.saveInternal(character);

      // Remove from localStorage after successful migration
      localStorage.removeItem(STORAGE_KEY);
      logger.info("Successfully migrated character data from localStorage to IndexedDB");
    } catch (error) {
      console.error("Failed to migrate from localStorage:", error);
      // Don't throw - we want the app to continue even if migration fails
    }
  }
}
