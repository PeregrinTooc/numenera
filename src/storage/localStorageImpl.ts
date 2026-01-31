// LocalStorage implementation of ICharacterStorage
// Wraps browser localStorage with async interface for consistency

import { ICharacterStorage } from "./ICharacterStorage.js";
import { STORAGE_KEY } from "./storageConstants.js";

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
    try {
      const serialized = JSON.stringify(character);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error("Failed to save character state:", error);
      throw error;
    }
  }

  async load(): Promise<any | null> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const data = JSON.parse(stored);

      // Migration: Check if data has old schema version wrapper
      if (data.schemaVersion !== undefined && data.character !== undefined) {
        // Old format detected: extract character and re-save in new format
        console.log("Migrating from old versioned format to new raw format");
        const character = data.character;
        await this.save(character);
        return character;
      }

      // New format: raw character data
      return data;
    } catch (error) {
      console.error("Failed to load character state:", error);
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
