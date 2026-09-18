import type { Character } from "../../src/types/character.js";

/**
 * Shared unit-test character factory (docs/rules/testing.md "Use Factories").
 * Default shape matches the `createBaseCharacter()` body duplicated across
 * diffDescriptions/changeDetection/characterDiff/versionDescriptions — those
 * suites assert on these exact values, so the default must not drift.
 */
export function createTestCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: "Test Character",
    tier: 1,
    type: "Glaive",
    descriptor: "Strong",
    focus: "Battles",
    portrait: "data:image/png;base64,test",
    currentXp: 0,
    totalXp: 0,
    shins: 10,
    armor: 1,
    effort: 1,
    maxCyphers: 2,
    stats: {
      might: { pool: 10, edge: 0, current: 10 },
      speed: { pool: 10, edge: 0, current: 10 },
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
    damageTrack: { impairment: "healthy" },
    textFields: { background: "", notes: "" },
    ...overrides,
  };
}

/**
 * Preset for empty-state scenarios: blank identity fields, zeroed resources.
 */
export function createEmptyCharacter(overrides: Partial<Character> = {}): Character {
  return createTestCharacter({
    name: "",
    type: "Jack",
    descriptor: "",
    focus: "",
    portrait: undefined,
    armor: 0,
    shins: 0,
    ...overrides,
  });
}

/**
 * Preset with one item of every collection populated, for container/list tests.
 */
export function createCharacterWithItems(overrides: Partial<Character> = {}): Character {
  return createTestCharacter({
    cyphers: [{ name: "Detonation", level: "1d6+2", effect: "Explodes" }],
    artifacts: [{ name: "Lightning Rod", level: "6", effect: "Shoots lightning" }],
    oddities: ["A glowing cube"],
    equipment: [{ name: "Sword" }, { name: "Shield" }],
    abilities: [{ name: "Trained in Defense", description: "Reduces difficulty by 1" }],
    specialAbilities: [{ name: "Bash", description: "Knock down opponent", source: "Glaive" }],
    attacks: [
      { name: "Longsword", damage: 4, modifier: 1, range: "Immediate", notes: "Medium weapon" },
      { name: "Crossbow", damage: 4, modifier: 0, range: "Long", notes: "Long range" },
    ],
    ...overrides,
  });
}
