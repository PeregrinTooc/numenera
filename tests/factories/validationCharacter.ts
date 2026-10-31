import type { Character } from "@/types/character";

/** A fully valid character with non-default values, used by validation and sanitizer specs. */
export function createValidHeroCharacter(): Character {
  return {
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
    cyphers: [],
    artifacts: [],
    oddities: [],
    abilities: [],
    equipment: [],
    attacks: [],
    specialAbilities: [],
    recoveryRolls: {
      action: false,
      tenMinutes: false,
      oneHour: false,
      tenHours: false,
      modifier: 0,
    },
    damageTrack: {
      impairment: "healthy",
    },
    textFields: {
      background: "",
      notes: "",
    },
  };
}
