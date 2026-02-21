// Storage factory with pluggable backends
// Currently supports: LocalStorage
// Future: IndexedDB, remote server

import { ICharacterStorage } from "./ICharacterStorage.js";
import { IndexedDBStorageImpl } from "./indexedDBStorageImpl.js";
import { LocalStorageImpl } from "./localStorageImpl.js";
import { VersionHistoryManager } from "./versionHistory.js";

let storageInstance: ICharacterStorage | null = null;
let versionHistoryInstance: VersionHistoryManager | null = null;

const DB_NAME = "numenera-character-db";

/**
 * Delete the IndexedDB database to clean up corrupted state
 */
async function deleteCorruptedIndexedDB(): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => {
      console.log("Deleted corrupted IndexedDB, will recreate fresh");
      resolve();
    };
    request.onerror = () => {
      console.warn("Failed to delete corrupted IndexedDB");
      resolve(); // Continue anyway
    };
    request.onblocked = () => {
      console.warn("IndexedDB deletion blocked, will use localStorage");
      resolve(); // Continue anyway
    };
  });
}

/**
 * Get the storage instance (singleton pattern)
 * Tries IndexedDB first, falls back to localStorage if unavailable
 *
 * @returns Initialized storage instance
 */
export async function getStorage(): Promise<ICharacterStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  // Try IndexedDB first
  let indexedDB = new IndexedDBStorageImpl();
  const isIndexedDBAvailable = await indexedDB.isAvailable();

  if (isIndexedDBAvailable) {
    try {
      await indexedDB.init();

      // Verify IndexedDB is fully operational by attempting a test load
      // This catches cases where the database exists but object stores don't
      try {
        await indexedDB.load();
      } catch (loadError) {
        console.warn("IndexedDB not fully operational, cleaning up:", loadError);
        indexedDB.close();

        // Auto-cleanup: Delete the corrupted database and try again
        await deleteCorruptedIndexedDB();

        // Try to initialize IndexedDB fresh
        indexedDB = new IndexedDBStorageImpl();
        await indexedDB.init();

        // Verify again after recreation
        await indexedDB.load();
        console.log("IndexedDB recreated successfully");
      }

      // Migrate data from localStorage if it exists
      await indexedDB.migrateFromLocalStorage();
      storageInstance = indexedDB;
      console.log("Using IndexedDB for character storage");
      return storageInstance;
    } catch (error) {
      console.warn("IndexedDB initialization failed, falling back to localStorage:", error);
    }
  }

  // Fallback to localStorage
  storageInstance = new LocalStorageImpl();
  await storageInstance.init();
  console.log("Using localStorage for character storage");
  return storageInstance;
}

/**
 * Save character state to storage
 * Maintains same API as original localStorage.ts for backward compatibility
 *
 * @param character The character object to save
 */
export async function saveCharacterState(character: any): Promise<void> {
  const storage = await getStorage();
  await storage.save(character);
}

/**
 * Load character state from storage
 * Maintains same API as original localStorage.ts for backward compatibility
 *
 * @returns The stored character object, or null if not found
 */
export async function loadCharacterState(): Promise<any | null> {
  const storage = await getStorage();
  return await storage.load();
}

/**
 * Clear stored character state
 * Maintains same API as original localStorage.ts for backward compatibility
 */
export async function clearCharacterState(): Promise<void> {
  const storage = await getStorage();
  await storage.clear();
}

/**
 * Get the version history manager instance (singleton pattern)
 * Initializes on first access
 *
 * @returns Initialized version history manager
 */
export async function getVersionHistory(): Promise<VersionHistoryManager> {
  if (versionHistoryInstance) {
    return versionHistoryInstance;
  }

  versionHistoryInstance = new VersionHistoryManager();
  await versionHistoryInstance.init();
  return versionHistoryInstance;
}
