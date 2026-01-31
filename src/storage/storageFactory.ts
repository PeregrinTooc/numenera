// Storage factory with pluggable backends
// Currently supports: LocalStorage
// Future: IndexedDB, remote server

import { ICharacterStorage } from "./ICharacterStorage.js";
import { LocalStorageImpl } from "./localStorageImpl.js";

let storageInstance: ICharacterStorage | null = null;

/**
 * Get the storage instance (singleton pattern)
 * Currently returns LocalStorage implementation
 * Future: Will try IndexedDB first, fallback to LocalStorage
 *
 * @returns Initialized storage instance
 */
export async function getStorage(): Promise<ICharacterStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  // For now, only localStorage is supported
  // Phase 2 will add IndexedDB with fallback logic
  storageInstance = new LocalStorageImpl();
  await storageInstance.init();
  console.log("Using localStorage storage");
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
