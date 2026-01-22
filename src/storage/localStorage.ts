// localStorage adapter for character state persistence
// Simple key-value storage in browser

const STORAGE_KEY = "numenera-character-state";

/**
 * Save character state to localStorage
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
 * Migrate old character data to new format
 * @param character The character object to migrate
 * @returns Migrated character object
 */
function migrateCharacterData(character: any): any {
  // Add abilities array if missing (migration from old format)
  if (!character.abilities) {
    character.abilities = [];
  }
  return character;
}

/**
 * Load character state from localStorage
 * @returns The stored character object, or null if not found
 */
export function loadCharacterState(): any | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    const character = JSON.parse(stored);
    return migrateCharacterData(character);
  } catch (error) {
    console.error("Failed to load character state:", error);
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
