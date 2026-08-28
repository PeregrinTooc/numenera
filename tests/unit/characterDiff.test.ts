import { describe, it, expect } from "vitest";
import { diffCharacters } from "../../src/utils/characterDiff.js";
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

describe("diffCharacters", () => {
  describe("no changes", () => {
    it("reports hasChanges false when characters are identical", () => {
      const left = createBaseCharacter();
      const right = createBaseCharacter();

      const diff = diffCharacters(left, right);

      expect(diff.hasChanges).toBe(false);
    });

    it("ignores portrait differences", () => {
      const left = createBaseCharacter();
      const right = createBaseCharacter();
      right.portrait = "data:image/png;base64,different";

      const diff = diffCharacters(left, right);

      expect(diff.hasChanges).toBe(false);
    });
  });

  describe("scalar fields", () => {
    it("flags a changed name in both basicInfo entries", () => {
      const left = createBaseCharacter();
      const right = createBaseCharacter();
      right.name = "New Name";

      const diff = diffCharacters(left, right);

      expect(diff.basicInfo.name).toBe(true);
      expect(diff.hasChanges).toBe(true);
    });

    it("does not flag an unchanged tier", () => {
      const left = createBaseCharacter();
      const right = createBaseCharacter();
      right.name = "New Name";

      const diff = diffCharacters(left, right);

      expect(diff.basicInfo.tier).toBe(false);
    });

    it("flags a changed stat when any of pool/edge/current differs", () => {
      const left = createBaseCharacter();
      const right = createBaseCharacter();
      right.stats.might.current = 5;

      const diff = diffCharacters(left, right);

      expect(diff.stats.might).toBe(true);
      expect(diff.stats.speed).toBe(false);
    });

    it("flags a changed resource field", () => {
      const left = createBaseCharacter();
      const right = createBaseCharacter();
      right.shins = 99;

      const diff = diffCharacters(left, right);

      expect(diff.resources.shins).toBe(true);
      expect(diff.resources.armor).toBe(false);
    });

    it("treats currentXp and totalXp as one combined xp field", () => {
      const left = createBaseCharacter();
      const right = createBaseCharacter();
      right.totalXp = 5;

      const diff = diffCharacters(left, right);

      expect(diff.resources.xp).toBe(true);
    });

    it("flags a changed text field", () => {
      const left = createBaseCharacter();
      const right = createBaseCharacter();
      right.textFields.notes = "new notes";

      const diff = diffCharacters(left, right);

      expect(diff.textFields.notes).toBe(true);
      expect(diff.textFields.background).toBe(false);
    });
  });

  describe("collections - cyphers", () => {
    it("marks an added cypher as added on the right, absent on the left", () => {
      const left = createBaseCharacter();
      const right = createBaseCharacter();
      right.cyphers = [{ name: "Detonation", level: "1d6", effect: "boom" }];

      const diff = diffCharacters(left, right);

      expect(diff.collections.cyphers.right).toEqual([
        { item: { name: "Detonation", level: "1d6", effect: "boom" }, status: "added" },
      ]);
      expect(diff.collections.cyphers.left).toEqual([]);
      expect(diff.hasChanges).toBe(true);
    });

    it("marks a removed cypher as removed on the left, absent on the right", () => {
      const left = createBaseCharacter();
      left.cyphers = [{ name: "Detonation", level: "1d6", effect: "boom" }];
      const right = createBaseCharacter();

      const diff = diffCharacters(left, right);

      expect(diff.collections.cyphers.left).toEqual([
        { item: { name: "Detonation", level: "1d6", effect: "boom" }, status: "removed" },
      ]);
      expect(diff.collections.cyphers.right).toEqual([]);
    });

    it("marks a same-named cypher with a different effect as modified on both sides", () => {
      const left = createBaseCharacter();
      left.cyphers = [{ name: "Detonation", level: "1d6", effect: "boom" }];
      const right = createBaseCharacter();
      right.cyphers = [{ name: "Detonation", level: "1d6", effect: "bigger boom" }];

      const diff = diffCharacters(left, right);

      expect(diff.collections.cyphers.left).toEqual([
        { item: { name: "Detonation", level: "1d6", effect: "boom" }, status: "modified" },
      ]);
      expect(diff.collections.cyphers.right).toEqual([
        { item: { name: "Detonation", level: "1d6", effect: "bigger boom" }, status: "modified" },
      ]);
    });

    it("marks a same-named, same-content cypher as unchanged on both sides", () => {
      const left = createBaseCharacter();
      left.cyphers = [{ name: "Detonation", level: "1d6", effect: "boom" }];
      const right = createBaseCharacter();
      right.cyphers = [{ name: "Detonation", level: "1d6", effect: "boom" }];

      const diff = diffCharacters(left, right);

      expect(diff.collections.cyphers.left).toEqual([
        { item: { name: "Detonation", level: "1d6", effect: "boom" }, status: "unchanged" },
      ]);
      expect(diff.hasChanges).toBe(false);
    });

    it("treats a rename as a removal plus an addition, not a modification", () => {
      const left = createBaseCharacter();
      left.cyphers = [{ name: "Old Name", level: "1d6", effect: "boom" }];
      const right = createBaseCharacter();
      right.cyphers = [{ name: "New Name", level: "1d6", effect: "boom" }];

      const diff = diffCharacters(left, right);

      expect(diff.collections.cyphers.left).toEqual([
        { item: { name: "Old Name", level: "1d6", effect: "boom" }, status: "removed" },
      ]);
      expect(diff.collections.cyphers.right).toEqual([
        { item: { name: "New Name", level: "1d6", effect: "boom" }, status: "added" },
      ]);
    });
  });

  describe("collections - oddities (plain strings)", () => {
    it("matches oddities by their own string value", () => {
      const left = createBaseCharacter();
      left.oddities = ["A strange coin"];
      const right = createBaseCharacter();
      right.oddities = ["A strange coin", "A glowing rock"];

      const diff = diffCharacters(left, right);

      expect(diff.collections.oddities.left).toEqual([
        { item: "A strange coin", status: "unchanged" },
      ]);
      expect(diff.collections.oddities.right).toEqual([
        { item: "A strange coin", status: "unchanged" },
        { item: "A glowing rock", status: "added" },
      ]);
    });
  });

  describe("collections - abilities, equipment, attacks, artifacts, specialAbilities", () => {
    it("diffs abilities by name", () => {
      const left = createBaseCharacter();
      const right = createBaseCharacter();
      right.abilities = [{ name: "Onslaught", description: "Hit hard", cost: 3, pool: "might" }];

      const diff = diffCharacters(left, right);

      expect(diff.collections.abilities.right[0].status).toBe("added");
    });

    it("diffs equipment by name", () => {
      const left = createBaseCharacter();
      left.equipment = [{ name: "Rope" }];
      const right = createBaseCharacter();

      const diff = diffCharacters(left, right);

      expect(diff.collections.equipment.left[0].status).toBe("removed");
    });

    it("diffs attacks by name", () => {
      const left = createBaseCharacter();
      left.attacks = [{ name: "Sword", damage: 4, modifier: 0, range: "Immediate" }];
      const right = createBaseCharacter();
      right.attacks = [{ name: "Sword", damage: 6, modifier: 0, range: "Immediate" }];

      const diff = diffCharacters(left, right);

      expect(diff.collections.attacks.left[0].status).toBe("modified");
      expect(diff.collections.attacks.right[0].status).toBe("modified");
    });

    it("diffs artifacts by name", () => {
      const left = createBaseCharacter();
      const right = createBaseCharacter();
      right.artifacts = [{ name: "Strange Device", level: "1d10", effect: "unknown" }];

      const diff = diffCharacters(left, right);

      expect(diff.collections.artifacts.right[0].status).toBe("added");
    });

    it("diffs specialAbilities by name", () => {
      const left = createBaseCharacter();
      left.specialAbilities = [{ name: "Trained", description: "...", source: "Type" }];
      const right = createBaseCharacter();

      const diff = diffCharacters(left, right);

      expect(diff.collections.specialAbilities.left[0].status).toBe("removed");
    });
  });

  describe("hasChanges", () => {
    it("is true when only a collection changed and every scalar field is identical", () => {
      const left = createBaseCharacter();
      const right = createBaseCharacter();
      right.cyphers = [{ name: "Detonation", level: "1d6", effect: "boom" }];

      const diff = diffCharacters(left, right);

      expect(diff.hasChanges).toBe(true);
    });
  });
});
