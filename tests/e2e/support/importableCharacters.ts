import type { Character } from "@/types/character";
import { FULL_CHARACTER } from "./cardTestFixtures.js";

/**
 * Overrides of the shared demo character, so only what makes each imported
 * file distinctive needs to be spelled out.
 */
export const IMPORTABLE_CHARACTERS: Record<string, Character> = {
  "test-hero.numenera": {
    ...FULL_CHARACTER,
    name: "Test Hero",
    tier: 3,
    type: "Glaive",
    descriptor: "Strong",
    focus: "Masters Defense",
    currentXp: 10,
    totalXp: 10,
    shins: 50,
    armor: 2,
    effort: 3,
    maxCyphers: 2,
    stats: {
      might: { pool: 18, edge: 1, current: 18 },
      speed: { pool: 12, edge: 0, current: 12 },
      intellect: { pool: 10, edge: 0, current: 10 },
    },
    cyphers: [{ name: "Test Cypher", level: "1d6", effect: "Test effect" }],
    artifacts: [{ name: "Test Artifact", level: "1d6", effect: "Test effect" }],
    oddities: ["Test oddity"],
    abilities: [{ name: "Test Ability", description: "Test description" }],
    equipment: [{ name: "Test Equipment", description: "Test description" }],
    attacks: [
      {
        name: "Test Attack",
        damage: 4,
        modifier: 0,
        range: "Immediate",
        notes: "",
      },
    ],
    specialAbilities: [
      {
        name: "Test Special",
        description: "Test description",
        source: "Type",
      },
    ],
    textFields: {
      background: "Test background story",
      notes: "Test notes",
    },
  },
  "another-hero.numenera": {
    ...FULL_CHARACTER,
    name: "Another Hero",
    tier: 2,
    type: "Nano",
    descriptor: "Clever",
    focus: "Controls Beasts",
    currentXp: 5,
    totalXp: 5,
    shins: 25,
    armor: 1,
    effort: 2,
    maxCyphers: 3,
    stats: {
      might: { pool: 10, edge: 0, current: 10 },
      speed: { pool: 10, edge: 0, current: 10 },
      intellect: { pool: 16, edge: 1, current: 16 },
    },
    cyphers: [{ name: "Another Cypher", level: "1d6+2", effect: "Another effect" }],
    artifacts: [],
    oddities: ["Another oddity"],
    abilities: [{ name: "Another Ability", description: "Another description" }],
    equipment: [{ name: "Another Equipment" }],
    attacks: [],
    specialAbilities: [],
    textFields: {
      background: "Another background",
      notes: "Another notes",
    },
  },
};
