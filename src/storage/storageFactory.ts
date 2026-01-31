// Storage factory with pluggable backends
// Currently supports: LocalStorage
// Future: IndexedDB, remote server

import { ICharacterStorage } from "./ICharacterStorage.js";
import { IndexedDBStorageImpl } from "./indexedDBStorageImpl.js";
import { LocalStorageImpl } from "./localStorageImpl.js";

let storageInstance: ICharacterStorage | null = null;

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
  const indexedDB = new IndexedDBStorageImpl();
  const isIndexedDBAvailable = await indexedDB.isAvailable();

  if (isIndexedDBAvailable) {
    try {
      await indexedDB.init();
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
