/**
 * Shared test fixtures for card-related E2E tests
 * Eliminates duplication of FULL_CHARACTER object across step definitions
 */

// Base character template used across all card tests
const BASE_CHARACTER = {
  name: "Kael the Wanderer",
  tier: 3,
  type: "Glaive",
  descriptor: "Strong",
  focus: "Bears a Halo of Fire",
  xp: 12,
  shins: 47,
  armor: 2,
  effort: 3,
  maxCyphers: 4,
  stats: {
    might: { pool: 15, edge: 2, current: 12 },
    speed: { pool: 12, edge: 1, current: 12 },
    intellect: { pool: 10, edge: 0, current: 8 },
  },
  recoveryRolls: {
    action: false,
    tenMinutes: false,
    oneHour: false,
    tenHours: false,
    modifier: 0,
  },
  damageTrack: { impairment: "healthy" },
  textFields: { background: "", notes: "" },
};

// Empty arrays for all card types
const EMPTY_ARRAYS = {
  cyphers: [],
  artifacts: [],
  oddities: [],
  abilities: [],
  equipment: [],
  attacks: [],
  specialAbilities: [],
};

/**
 * Creates a character with specific card data
 * All other card arrays are empty
 */
export function createCharacterWithCards<K extends keyof typeof EMPTY_ARRAYS>(
  cardType: K,
  cards: (typeof EMPTY_ARRAYS)[K]
): Record<string, unknown> {
  return {
    ...BASE_CHARACTER,
    ...EMPTY_ARRAYS,
    [cardType]: cards,
  };
}

// ============================================================================
// CARD TYPE CONFIGURATIONS
// ============================================================================

export interface CardTypeConfig {
  // Test selectors
  itemTestId: string; // Selector for card item (e.g., '[data-testid="cypher-item"]')
  addButtonTestId: string; // Selector for add button
  editButtonPrefix: string; // Prefix for edit button testid

  // Field testids for modal (maps field name to testid)
  fieldTestIds: Record<string, string>;

  // Sample data for tests
  sampleCards: unknown[];

  // Empty character for 0-count tests
  emptyCharacterCards: unknown[];
}

export const CARD_CONFIGS: Record<string, CardTypeConfig> = {
  cypher: {
    itemTestId: '[data-testid="cypher-item"]',
    addButtonTestId: '[data-testid="add-cypher-button"]',
    editButtonPrefix: "cypher-edit-button-",
    fieldTestIds: {
      name: '[data-testid="edit-cypher-name"]',
      level: '[data-testid="edit-cypher-level"]',
      effect: '[data-testid="edit-cypher-effect"]',
    },
    sampleCards: [
      { name: "Detonation (Cell)", level: "1d6+2", effect: "Explodes in an immediate radius" },
      { name: "Stim (Injector)", level: "1d6", effect: "Restores 1d6 + 2 points to one Pool" },
    ],
    emptyCharacterCards: [],
  },

  equipment: {
    itemTestId: '[data-testid^="equipment-item-"]',
    addButtonTestId: '[data-testid="add-equipment-button"]',
    editButtonPrefix: "equipment-edit-button-",
    fieldTestIds: {
      name: '[data-testid="edit-field-name"]',
      description: '[data-testid="edit-field-description"]',
    },
    sampleCards: [
      { name: "Medium armor", description: "Provides protection without hindering movement" },
      { name: "Broadsword", description: "Heavy melee weapon" },
      { name: "Explorer's pack", description: undefined },
      { name: "50 feet of rope", description: undefined },
    ],
    emptyCharacterCards: [],
  },

  artifact: {
    itemTestId: '[data-testid^="artifact-item-"]',
    addButtonTestId: '[data-testid="add-artifact-button"]',
    editButtonPrefix: "artifact-edit-button-",
    fieldTestIds: {
      name: '[data-testid="edit-artifact-name"]',
      level: '[data-testid="edit-artifact-level"]',
      effect: '[data-testid="edit-artifact-effect"]',
    },
    sampleCards: [
      { name: "Lightning Rod", level: "6", effect: "Projects lightning bolt up to long range" },
      { name: "Healing Crystal", level: "1d6+2", effect: "Heals wounds over time" },
    ],
    emptyCharacterCards: [],
  },

  oddity: {
    itemTestId: '[data-testid="oddity-item"]',
    addButtonTestId: '[data-testid="add-oddity-button"]',
    editButtonPrefix: "oddity-edit-button-",
    fieldTestIds: {
      oddity: '[data-testid="edit-field-oddity"]',
    },
    sampleCards: [
      "A glowing cube that hums when near water",
      "A piece of transparent metal that's always cold",
    ],
    emptyCharacterCards: [],
  },

  attack: {
    itemTestId: '[data-testid^="attack-item-"]',
    addButtonTestId: '[data-testid="add-attack-button"]',
    editButtonPrefix: "attack-edit-button-",
    fieldTestIds: {
      name: '[data-testid="edit-attack-name"]',
      damage: '[data-testid="edit-attack-damage"]',
      modifier: '[data-testid="edit-attack-modifier"]',
      range: '[data-testid="edit-attack-range"]',
    },
    sampleCards: [
      { name: "Broadsword", damage: 6, modifier: 1, range: "Immediate", notes: undefined },
      { name: "Crossbow", damage: 4, modifier: 0, range: "Long", notes: undefined },
    ],
    emptyCharacterCards: [],
  },

  ability: {
    itemTestId: '[data-testid^="ability-item-"]',
    addButtonTestId: '[data-testid="add-ability-button"]',
    editButtonPrefix: "ability-edit-button-",
    fieldTestIds: {
      name: '[data-testid="edit-ability-name"]',
      cost: '[data-testid="edit-ability-cost"]',
      pool: '[data-testid="edit-ability-pool"]',
      description: '[data-testid="edit-ability-description"]',
    },
    sampleCards: [
      { name: "Bash", cost: 1, pool: "might", description: "Strike a foe with your weapon" },
      {
        name: "Fleet of Foot",
        cost: 1,
        pool: "speed",
        description: "Move a short distance as part of another action",
      },
    ],
    emptyCharacterCards: [],
  },

  "special-ability": {
    itemTestId: '[data-testid^="special-ability-item-"]',
    addButtonTestId: '[data-testid="add-special-ability-button"]',
    editButtonPrefix: "special-ability-edit-button-",
    fieldTestIds: {
      name: '[data-testid="edit-special-ability-name"]',
      source: '[data-testid="edit-special-ability-source"]',
      description: '[data-testid="edit-special-ability-description"]',
    },
    sampleCards: [
      {
        name: "Practiced in Armor",
        source: "Type",
        description: "You can wear armor for long periods",
      },
      {
        name: "Fire Affinity",
        source: "Focus",
        description: "You are trained in fire-based attacks",
      },
    ],
    emptyCharacterCards: [],
  },
};

// ============================================================================
// CARD TYPE TO CHARACTER PROPERTY MAPPING
// ============================================================================

export const CARD_TYPE_TO_PROPERTY: Record<string, string> = {
  cypher: "cyphers",
  equipment: "equipment",
  artifact: "artifacts",
  oddity: "oddities",
  attack: "attacks",
  ability: "abilities",
  "special-ability": "specialAbilities",
};

/**
 * Creates a test character with the specified number of cards for a given type
 */
export function createTestCharacterWithCardCount(
  cardType: string,
  count: number
): Record<string, unknown> {
  const config = CARD_CONFIGS[cardType];
  const property = CARD_TYPE_TO_PROPERTY[cardType];

  if (!config || !property) {
    throw new Error(`Unknown card type: ${cardType}`);
  }

  const cards = config.sampleCards.slice(0, count);

  return {
    ...BASE_CHARACTER,
    ...EMPTY_ARRAYS,
    [property]: cards,
  };
}

/**
 * Creates a minimal empty character for ability-0 tests
 */
export function createEmptyAbilitiesCharacter(): Record<string, unknown> {
  return {
    name: "Test Character",
    tier: 1,
    type: "Glaive",
    descriptor: "Strong",
    focus: "Test Focus",
    xp: 0,
    shins: 0,
    armor: 0,
    effort: 1,
    maxCyphers: 2,
    stats: {
      might: { pool: 10, edge: 0, current: 10 },
      speed: { pool: 10, edge: 0, current: 10 },
      intellect: { pool: 10, edge: 0, current: 10 },
    },
    ...EMPTY_ARRAYS,
    recoveryRolls: {
      action: false,
      tenMinutes: false,
      oneHour: false,
      tenHours: false,
      modifier: 0,
    },
    damageTrack: { impairment: "healthy" },
    textFields: { background: "", notes: "" },
  };
}
