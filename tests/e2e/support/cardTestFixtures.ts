import { FULL_CHARACTER } from "@/data/mockCharacters";

// Re-exported so every card fixture builds on the same demo character the
// app itself ships (src/data/mockCharacters.ts), instead of a hand-copied
// twin that could silently drift from it.
export { FULL_CHARACTER };

export const EMPTY_ARRAYS = {
  cyphers: [],
  artifacts: [],
  oddities: [],
  abilities: [],
  equipment: [],
  attacks: [],
  specialAbilities: [],
};

export function createCharacterWithCards<K extends keyof typeof EMPTY_ARRAYS>(
  cardType: K,
  cards: (typeof EMPTY_ARRAYS)[K]
): Record<string, unknown> {
  return {
    ...FULL_CHARACTER,
    ...EMPTY_ARRAYS,
    [cardType]: cards,
  };
}

export interface CardTypeConfig {
  itemTestId: string; // Selector for card item (e.g., '[data-testid="cypher-item"]')
  addButtonTestId: string;
  editButtonPrefix: string;

  fieldTestIds: Record<string, string>;

  sampleCards: unknown[];

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
    itemTestId: '[data-testid="equipment-item"]',
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
    itemTestId: '[data-testid="artifact-item"]',
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
    itemTestId: '[data-testid="attack-item"]',
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
    itemTestId: '[data-testid="special-ability-item"]',
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

export const CARD_TYPE_TO_PROPERTY: Record<string, string> = {
  cypher: "cyphers",
  equipment: "equipment",
  artifact: "artifacts",
  oddity: "oddities",
  attack: "attacks",
  ability: "abilities",
  "special-ability": "specialAbilities",
};
