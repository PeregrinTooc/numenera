// LocalStorage implementation of ICharacterStorage
// Wraps browser localStorage with async interface for consistency

import { ICharacterStorage } from "./ICharacterStorage.js";
import { STORAGE_KEY } from "./storageConstants.js";
import { CompletionNotifier } from "../utils/completionNotifier.js";

/**
 * LocalStorage-based character persistence
 * Uses browser's localStorage API (5-10MB limit)
 */
export class LocalStorageImpl implements ICharacterStorage {
  async init(): Promise<void> {
    // No initialization needed for localStorage
    // It's always available in browsers
  }

  async save(character: any): Promise<void> {
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
  private saveInternal(character: any): void {
    const serialized = JSON.stringify(character);
    localStorage.setItem(STORAGE_KEY, serialized);
  }

  async load(): Promise<any | null> {
    const notifier = new CompletionNotifier("character-load", { data: { source: "localStorage" } });
    notifier.start();

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        notifier.complete({ source: "localStorage", found: false });
        return null;
      }

      const data = JSON.parse(stored);

      // Migration: Check if data has old schema version wrapper
      if (data.schemaVersion !== undefined && data.character !== undefined) {
        // Old format detected: extract character and re-save in new format
        console.log("Migrating from old versioned format to new raw format");
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
      // On error, clear potentially corrupted data
      await this.clear();
      return null;
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
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
