// localStorage adapter for character state persistence
// Simple key-value storage in browser with schema versioning

const STORAGE_KEY = "numenera-character-state";

/**
 * SCHEMA VERSION
 *
 * RULE: Increment this version number whenever the Character type changes in src/types/character.ts
 *
 * Version History:
 * - v1: Initial schema (base character structure)
 * - v2: Added ability enhancements (cost, pool, action) - Phase 2
 * - v3: Added attacks and specialAbilities arrays - Phase 3
 *
 * When the version doesn't match, all localStorage data is cleared to prevent corruption.
 */
const SCHEMA_VERSION = 3;

interface StoredData {
  schemaVersion: number;
  character: any;
}

/**
 * Save character state to localStorage with schema version
 * @param character The character object to save
 */
export function saveCharacterState(character: any): void {
  try {
    const data: StoredData = {
      schemaVersion: SCHEMA_VERSION,
      character,
    };
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Failed to save character state:", error);
  }
}

/**
 * Load character state from localStorage with version checking
 * @returns The stored character object, or null if not found or version mismatch
 */
export function loadCharacterState(): any | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data = JSON.parse(stored);

    // Check if data has schema version wrapper
    if (data.schemaVersion !== undefined) {
      // Versioned data: check version match
      if (data.schemaVersion !== SCHEMA_VERSION) {
        console.log(
          `Schema version mismatch (stored: ${data.schemaVersion}, current: ${SCHEMA_VERSION}). Clearing localStorage.`
        );
        clearCharacterState();
        return null;
      }
      return data.character;
    } else {
      // No schema version: treat as raw character data (backwards compatibility for tests)
      console.log("Loading data without schema version (test mode)");
      return data;
    }
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
