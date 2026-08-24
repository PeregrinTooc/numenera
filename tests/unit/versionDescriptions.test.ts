import { describe, it, expect } from "vitest";
import { describeCharacterChange } from "../../src/services/versionDescriptions.js";
import type { Character } from "../../src/types/character.js";

// Helper to create a base character for testing
function createBaseCharacter(): Character {
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
  };
}

describe("describeCharacterChange", () => {
  it("translates a single detected change into its English text", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();
    after.name = "New Name";

    expect(describeCharacterChange(before, after)).toBe("Changed name");
  });

  it("translates and joins multiple detected changes with a comma", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();
    after.tier = 2;
    after.cyphers = [{ name: "Test", level: "1", effect: "" }];

    expect(describeCharacterChange(before, after)).toBe("Changed tier, Added cypher");
  });

  it("translates a combined-category key (e.g. multiple basic info changes)", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();
    after.name = "New Name";
    after.tier = 2;
    after.type = "Jack";

    expect(describeCharacterChange(before, after)).toBe("Edited basic info");
  });

  it("falls back to the translated generic description when nothing is detected", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();

    expect(describeCharacterChange(before, after)).toBe("Updated character");
  });

  it("ignores portrait-only changes and still falls back to generic", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();
    after.portrait = "data:image/png;base64,different";

    expect(describeCharacterChange(before, after)).toBe("Updated character");
  });
});
