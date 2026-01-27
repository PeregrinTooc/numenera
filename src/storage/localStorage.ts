// localStorage adapter for character state persistence
// Simple key-value storage in browser
// Schema version is now only used in file exports (see fileStorage.ts)

import { STORAGE_KEY } from "./storageConstants.js";

/**
 * Save character state to localStorage
 * Stores raw character data without version wrapper
 * Schema version is now only used in file exports (see fileStorage.ts)
 *
 * @param character The character object to save
 */
export function saveCharacterState(character: any): void {
  try {
    const serialized = JSON.stringify(character);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Failed to save character state:", error);
  }
}

/**
 * Load character state from localStorage
 * Handles migration from old versioned format to new raw format
 *
 * @returns The stored character object, or null if not found
 */
export function loadCharacterState(): any | null {
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
      saveCharacterState(character);
      return character;
    }

    // New format: raw character data
    return data;
  } catch (error) {
    console.error("Failed to load character state:", error);
    // On error, clear potentially corrupted data
    clearCharacterState();
    return null;
  }
}

/**
 * Clear character state from localStorage
 */
export function clearCharacterState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear character state:", error);
  }
}
