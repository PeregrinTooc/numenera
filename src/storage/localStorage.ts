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

  // Migrate equipment from textFields.equipment (string) to equipment array
  if (character.textFields?.equipment && !character.equipment) {
    // Convert old string equipment to new array format
    character.equipment = [
      {
        name: character.textFields.equipment,
        description: undefined,
      },
    ];
    // Remove from textFields
    delete character.textFields.equipment;
  }

  // If equipment is missing entirely, initialize as empty array
  if (!character.equipment) {
    character.equipment = [];
  }

  // Phase 1: Add XP field if missing
  if (character.xp === undefined) {
    character.xp = 0;
  }

  // Phase 1: Add Shins field if missing
  if (character.shins === undefined) {
    character.shins = 0;
  }

  // Phase 1: Add Armor field if missing
  if (character.armor === undefined) {
    character.armor = 0;
  }

  // Phase 1: Add Effort field if missing or migrate from old object format
  if (character.effort === undefined || typeof character.effort === "object") {
    // Handle both undefined and old {max, costPerLevel} format
    character.effort =
      typeof character.effort === "object" ? character.effort.max : character.tier || 1;
  }

  // Phase 1.7: Add maxCyphers field if missing
  if (character.maxCyphers === undefined) {
    character.maxCyphers = (character.tier || 1) + 1;
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
