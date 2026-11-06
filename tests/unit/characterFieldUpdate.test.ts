import { describe, it, expect } from "vitest";
import { applyFieldUpdate } from "@/utils/characterFieldUpdate";
import { createTestCharacter as makeCharacter } from "../factories/character.js";

describe("applyFieldUpdate", () => {
  it("updates a top-level string field", () => {
    const character = makeCharacter();
    const result = applyFieldUpdate(character, "name", "New Name");

    expect(result.name).toBe("New Name");
  });

  it("updates a top-level numeric field", () => {
    const character = makeCharacter();
    const currentResult = applyFieldUpdate(character, "currentXp", 5);
    expect(currentResult.currentXp).toBe(5);

    const totalResult = applyFieldUpdate(character, "totalXp", 20);
    expect(totalResult.totalXp).toBe(20);
  });

  it("updates a nested stat field", () => {
    const character = makeCharacter();
    const result = applyFieldUpdate(character, "mightPool", 25);

    expect(result.stats.might.pool).toBe(25);
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

    expect(result.stats).not.toBe(character.stats);
    expect(result.stats.might).not.toBe(character.stats.might);
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
