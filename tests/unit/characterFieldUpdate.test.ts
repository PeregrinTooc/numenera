/**
 * applyFieldUpdate - pure field-update logic extracted from main.ts's handleFieldUpdate
 */

import { describe, it, expect } from "vitest";
import { applyFieldUpdate } from "../../src/utils/characterFieldUpdate.js";
import { Character } from "../../src/types/character.js";

function makeCharacter(): Character {
  return {
    name: "Test Character",
    descriptor: "Clever",
    type: "Jack",
    focus: "Who Controls Beasts",
    tier: 1,
    effort: 1,
    currentXp: 0,
    totalXp: 0,
    shins: 0,
    armor: 0,
    maxCyphers: 3,
    stats: {
      might: { pool: 10, edge: 0, current: 10 },
      speed: { pool: 10, edge: 0, current: 10 },
      intellect: { pool: 10, edge: 0, current: 10 },
    },
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
    abilities: [],
    specialAbilities: [],
    attacks: [],
    cyphers: [],
    artifacts: [],
    oddities: [],
    equipment: [],
    textFields: {
      background: "",
      notes: "",
    },
  };
}

describe("applyFieldUpdate", () => {
  it("updates a top-level string field and returns a matching label", () => {
    const character = makeCharacter();
    const result = applyFieldUpdate(character, "name", "New Name");

    expect(result.character.name).toBe("New Name");
    expect(result.label).toBe("Changed name");
  });

  it("updates a top-level numeric field", () => {
    const character = makeCharacter();
    const currentResult = applyFieldUpdate(character, "currentXp", 5);
    expect(currentResult.character.currentXp).toBe(5);
    expect(currentResult.label).toBe("Changed current XP");

    const totalResult = applyFieldUpdate(character, "totalXp", 20);
    expect(totalResult.character.totalXp).toBe(20);
    expect(totalResult.label).toBe("Changed total XP");
  });

  it("updates a nested stat field", () => {
    const character = makeCharacter();
    const result = applyFieldUpdate(character, "mightPool", 25);

    expect(result.character.stats.might.pool).toBe(25);
    expect(result.label).toBe("Changed Might pool");
  });

  it("does not mutate the original character's top-level fields", () => {
    const character = makeCharacter();
    applyFieldUpdate(character, "name", "New Name");

    expect(character.name).toBe("Test Character");
  });

  it("does not mutate the original character's stats when updating a stat field", () => {
    const character = makeCharacter();
    applyFieldUpdate(character, "mightPool", 25);

    expect(character.stats.might.pool).toBe(10);
  });

  it("returns a character whose stats object is not the same reference as the input's", () => {
    const character = makeCharacter();
    const result = applyFieldUpdate(character, "mightPool", 25);

    expect(result.character.stats).not.toBe(character.stats);
    expect(result.character.stats.might).not.toBe(character.stats.might);
  });

  it("does not corrupt other cached copies sharing the same stats reference", () => {
    // Simulates VersionState.navigateToVersion's own shallow copy: a
    // "displayed" character that still shares the stats object with the
    // cached version snapshot it was built from.
    const character = makeCharacter();
    const cachedVersionSnapshot = { ...character, stats: character.stats };

    applyFieldUpdate(character, "mightPool", 25);

    expect(cachedVersionSnapshot.stats.might.pool).toBe(10);
  });
});
