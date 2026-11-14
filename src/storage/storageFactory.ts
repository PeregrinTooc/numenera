import { ICharacterStorage } from "./ICharacterStorage.js";
import type { Character } from "@/types/character";
import { IndexedDBStorageImpl } from "./indexedDBStorageImpl.js";
import { LocalStorageImpl } from "./localStorageImpl.js";
import { VersionHistoryManager } from "./versionHistory.js";
import { CHARACTER_DB_NAME } from "./storageConstants.js";
import { sanitizeCharacter } from "@/utils/characterSanitizer";
import { logger } from "@/utils/logger";
import { SystemClock } from "@/services/clock";
import { reportStorageWriteFailure } from "./storageWriteFailure";

let storageInstance: ICharacterStorage | null = null;
let versionHistoryPromise: Promise<VersionHistoryManager> | null = null;

const DB_NAME = CHARACTER_DB_NAME;

async function deleteCorruptedIndexedDB(): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => {
      logger.info("Deleted corrupted IndexedDB, will recreate fresh");
      resolve();
    };
    request.onerror = () => {
      console.warn("Failed to delete corrupted IndexedDB");
      resolve();
    };
    request.onblocked = () => {
      console.warn("IndexedDB deletion blocked, will use localStorage");
      resolve();
    };
  });
}

/**
 * Init IndexedDB and verify it works with a test load. This catches cases where
 * the database exists but object stores don't: the corrupted database is deleted
 * and recreated once.
 */
async function openVerifiedIndexedDB(): Promise<IndexedDBStorageImpl> {
  let storage = new IndexedDBStorageImpl(new SystemClock());
  await storage.init();

  try {
    await storage.load();
  } catch (loadError) {
    console.warn("IndexedDB not fully operational, cleaning up:", loadError);
    storage.close();
    await deleteCorruptedIndexedDB();

    storage = new IndexedDBStorageImpl(new SystemClock());
    await storage.init();
    await storage.load();
    logger.info("IndexedDB recreated successfully");
  }
  return storage;
}

/** A ready IndexedDB storage (with localStorage data migrated in), or null when unavailable or failing. */
async function tryInitIndexedDB(): Promise<ICharacterStorage | null> {
  if (!(await new IndexedDBStorageImpl(new SystemClock()).isAvailable())) {
    return null;
  }
  try {
    const storage = await openVerifiedIndexedDB();
    await storage.migrateFromLocalStorage();
    return storage;
  } catch (error) {
    console.warn("IndexedDB initialization failed, falling back to localStorage:", error);
    return null;
  }
}

/**
 * Get the storage instance (singleton pattern)
 */
async function getStorage(): Promise<ICharacterStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  const indexedDBStorage = await tryInitIndexedDB();
  if (indexedDBStorage) {
    storageInstance = indexedDBStorage;
    logger.info("Using IndexedDB for character storage");
    return storageInstance;
  }

  storageInstance = new LocalStorageImpl();
  await storageInstance.init();
  logger.info("Using localStorage for character storage");
  return storageInstance;
}

export async function saveCharacterState(character: Character): Promise<void> {
  const storage = await getStorage();
  await storage.save(character);
}

/**
 * Fire-and-forget variant of saveCharacterState for synchronous call sites.
 *
 * Components render synchronously and cannot await a save. Use this rather than
 * reaching for the raw localStorage module: writing to localStorage directly
 * creates a second copy of the character that diverges from the real backend
 * (Rule #11).
 *
 * Failures cannot be thrown to the caller, so they are reported through the
 * app-level `storage-write-failed` event (see storageWriteFailure.ts), which
 * tells the user the change was not saved.
 */
export function persistCharacterState(character: Character): void {
  void saveCharacterState(character).catch(reportStorageWriteFailure);
}

/**
 * Runs the raw stored data through sanitizeCharacter so every caller gets
 * migrated data automatically — in particular, saves persisted before the
 * currentXp/totalXp split (which only have a legacy `xp` field) come back
 * with both new fields populated from it, the same way file import and
 * version-history navigation already migrate legacy data.
 */
export async function loadCharacterState(): Promise<Character | null> {
  const raw = await loadRawCharacterState();
  if (!raw) {
    return null;
  }
  return sanitizeCharacter(raw).character;
}

/**
 * Load the stored data exactly as stored (untrusted, may not be a character).
 * Used by boot to keep unreadable data instead of sanitizing it away.
 */
export async function loadRawCharacterState(): Promise<unknown> {
  const storage = await getStorage();
  return storage.load();
}

/** Keep a copy of unreadable stored data; a later copy replaces an earlier one. */
export async function saveCorruptedCharacterBackup(raw: unknown): Promise<void> {
  const storage = await getStorage();
  await storage.saveCorruptedBackup(raw);
}

/** @returns The kept unreadable data exactly as stored, or null if there is none */
export async function loadCorruptedCharacterBackup(): Promise<unknown> {
  const storage = await getStorage();
  return storage.loadCorruptedBackup();
}

/** Remove the kept unreadable data once the user has downloaded or discarded it. */
export async function deleteCorruptedCharacterBackup(): Promise<void> {
  const storage = await getStorage();
  await storage.clearCorruptedBackup();
}

export async function clearCharacterState(): Promise<void> {
  const storage = await getStorage();
  await storage.clear();
}

/**
 * Caches the in-flight promise rather than the instance. Publishing the
 * instance before init() resolved meant a concurrent second caller could
 * receive a manager with db === null, failing with
 * "VersionHistoryManager not initialized".
 */
export function getVersionHistory(): Promise<VersionHistoryManager> {
  if (!versionHistoryPromise) {
    versionHistoryPromise = (async () => {
      const manager = new VersionHistoryManager();
      await manager.init();
      return manager;
    })().catch((error) => {
      // Allow a retry on the next call rather than caching a permanent failure.
      versionHistoryPromise = null;
      throw error;
    });
  }
  return versionHistoryPromise;
}
