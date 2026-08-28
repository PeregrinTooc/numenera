import { describe, it, expect } from "vitest";
import { describeDiff } from "../../src/services/diffDescriptions.js";
import { diffCharacters } from "../../src/utils/characterDiff.js";
import type { Character } from "../../src/types/character.js";

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

describe("describeDiff", () => {
  it("returns an empty array when there are no differences", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();

    const description = describeDiff(diffCharacters(left, right));

    expect(description).toEqual([]);
  });

  it("lists every changed basic info field individually, uncapped", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();
    right.name = "New Name";
    right.tier = 2;
    right.type = "Jack";
    right.descriptor = "Swift";
    right.focus = "Talks to Machines";

    const description = describeDiff(diffCharacters(left, right));

    expect(description).toContain("Changed name");
    expect(description).toContain("Changed tier");
    expect(description).toContain("Changed type");
    expect(description).toContain("Changed descriptor");
    expect(description).toContain("Changed focus");
    expect(description).not.toContain("Edited basic info");
  });

  it("lists more than three changes when more than three fields differ", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();
    right.name = "New Name";
    right.tier = 2;
    right.shins = 99;
    right.armor = 3;

    const description = describeDiff(diffCharacters(left, right));

    expect(description.length).toBeGreaterThan(3);
  });

  it("lists a collection change once per type/status, not per item", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();
    right.cyphers = [
      { name: "Detonation", level: "1d6", effect: "boom" },
      { name: "Shrink Ray", level: "1d8", effect: "shrinks things" },
    ];

    const description = describeDiff(diffCharacters(left, right));

    expect(description.filter((line) => line === "Added cypher")).toHaveLength(1);
  });

  it("lists added and removed for the same collection type separately", () => {
    const left = createBaseCharacter();
    left.cyphers = [{ name: "Old Cypher", level: "1d6", effect: "boom" }];
    const right = createBaseCharacter();
    right.cyphers = [{ name: "New Cypher", level: "1d6", effect: "boom" }];

    const description = describeDiff(diffCharacters(left, right));

    expect(description).toContain("Added cypher");
    expect(description).toContain("Removed cypher");
  });
});
