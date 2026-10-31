// LocalStorage implementation of ICharacterStorage
// Wraps browser localStorage with async interface for consistency

import { ICharacterStorage } from "./ICharacterStorage.js";
import { STORAGE_KEY, UNREADABLE_BACKUP_STORAGE_KEY } from "./storageConstants.js";
import { CompletionNotifier } from "@/utils/completionNotifier";
import { logger } from "@/utils/logger";
import { isRecord } from "@/utils/typeGuards";
import type { Character } from "@/types/character";

/** True for the legacy `{ schemaVersion, character }` wrapper format. */
function isVersionedWrapper(data: unknown): data is { character: unknown } {
  return isRecord(data) && data.schemaVersion !== undefined && data.character !== undefined;
}

/**
 * LocalStorage-based character persistence
 * Uses browser's localStorage API (5-10MB limit)
 */
export class LocalStorageImpl implements ICharacterStorage {
  async init(): Promise<void> {
    // No initialization needed for localStorage
    // It's always available in browsers
  }

  async save(character: Character): Promise<void> {
    const notifier = new CompletionNotifier("character-save", { data: { source: "localStorage" } });
    notifier.start();

    try {
      this.saveInternal(character);
      notifier.complete({ source: "localStorage" });
    } catch (error) {
      console.error("Failed to save character state:", error);
      notifier.error(error);
      throw error;
    }
  }

  /**
   * Internal save without event emissions
   * Used during migration to avoid nested events
   */
  private saveInternal(character: unknown): void {
    const serialized = JSON.stringify(character);
    localStorage.setItem(STORAGE_KEY, serialized);
  }

  async load(): Promise<unknown> {
    const notifier = new CompletionNotifier("character-load", { data: { source: "localStorage" } });
    notifier.start();

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        notifier.complete({ source: "localStorage", found: false });
        return null;
      }

      let data: unknown;
      try {
        data = JSON.parse(stored);
      } catch (error) {
        // Hand the text back untouched so the app can keep it as a backup; never delete it.
        console.error("Stored character is not valid JSON:", error);
        notifier.complete({ source: "localStorage", found: true, unreadable: true });
        return stored;
      }

      // Migration: Check if data has old schema version wrapper
      if (isVersionedWrapper(data)) {
        // Old format detected: extract character and re-save in new format
        logger.info("Migrating from old versioned format to new raw format");
        const character = data.character;
        this.saveInternal(character);
        notifier.complete({ source: "localStorage", found: true, migrated: true });
        return character;
      }

      // New format: raw character data
      notifier.complete({ source: "localStorage", found: true });
      return data;
    } catch (error) {
      console.error("Failed to load character state:", error);
      notifier.error(error);
      // Leave the stored data alone: it may still be the user's only copy.
      return null;
    }
  }

  async saveCorruptedBackup(raw: unknown): Promise<void> {
    localStorage.setItem(
      UNREADABLE_BACKUP_STORAGE_KEY,
      typeof raw === "string" ? raw : JSON.stringify(raw)
    );
  }

  async loadCorruptedBackup(): Promise<unknown> {
    return localStorage.getItem(UNREADABLE_BACKUP_STORAGE_KEY);
  }

  async clearCorruptedBackup(): Promise<void> {
    localStorage.removeItem(UNREADABLE_BACKUP_STORAGE_KEY);
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Continuing is fine: the stored character stays intact, and the next load falls back to the same data or the default.
      console.error("Failed to clear character state:", error);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Test if localStorage is available and working
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      // localStorage may be disabled in private browsing or blocked by settings
      return false;
    }
  }
}
