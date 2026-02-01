import { describe, it, expect } from "vitest";
import { detectChanges } from "../../src/utils/changeDetection.js";
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
    xp: 0,
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

describe("Change Detection", () => {
  describe("No Changes", () => {
    it("should return empty array when characters are identical", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();

      const changes = detectChanges(char1, char2);

      expect(changes).toEqual([]);
    });

    it("should ignore portrait changes", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.portrait = "data:image/png;base64,different";

      const changes = detectChanges(char1, char2);

      expect(changes).toEqual([]);
    });
  });

  describe("Basic Info Changes", () => {
    it("should detect name change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.name = "New Name";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Changed name");
    });

    it("should detect tier change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.tier = 2;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Changed tier");
    });

    it("should detect type change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.type = "Jack";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Changed type");
    });

    it("should detect descriptor change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.descriptor = "Swift";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Changed descriptor");
    });

    it("should detect focus change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.focus = "Masters Defense";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Changed focus");
    });

    it("should combine multiple basic info changes", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.name = "New Name";
      char2.tier = 2;
      char2.type = "Jack";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Edited basic info");
      expect(changes).not.toContain("Changed name");
      expect(changes).not.toContain("Changed tier");
      expect(changes).not.toContain("Changed type");
    });
  });

  describe("Stat Changes", () => {
    it("should detect might pool change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.might.pool = 12;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Updated might");
    });

    it("should detect speed pool change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.speed.pool = 12;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Updated speed");
    });

    it("should detect intellect pool change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.intellect.pool = 12;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Updated intellect");
    });

    it("should detect edge changes", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.might.edge = 1;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Updated might");
    });

    it("should detect current value changes", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.might.current = 8;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Updated might");
    });

    it("should combine multiple stat changes", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.might.pool = 12;
      char2.stats.speed.edge = 1;
      char2.stats.intellect.current = 8;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Updated stats");
      expect(changes).not.toContain("Updated might");
      expect(changes).not.toContain("Updated speed");
      expect(changes).not.toContain("Updated intellect");
    });
  });

  describe("Collection Changes - Cyphers", () => {
    it("should detect added cypher", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.cyphers = [{ name: "Detonation", level: "3", effect: "Explodes" }];

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Added cypher");
    });

    it("should detect removed cypher", () => {
      const char1 = createBaseCharacter();
      char1.cyphers = [{ name: "Detonation", level: "3", effect: "Explodes" }];
      const char2 = createBaseCharacter();

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Removed cypher");
    });

    it("should detect modified cypher", () => {
      const char1 = createBaseCharacter();
      char1.cyphers = [{ name: "Detonation", level: "3", effect: "Explodes" }];
      const char2 = createBaseCharacter();
      char2.cyphers = [{ name: "Detonation", level: "5", effect: "Explodes" }];

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Modified cypher");
    });
  });

  describe("Collection Changes - Equipment", () => {
    it("should detect added equipment", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.equipment = [{ name: "Sword", description: "Sharp" }];

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Added equipment");
    });

    it("should detect removed equipment", () => {
      const char1 = createBaseCharacter();
      char1.equipment = [{ name: "Sword", description: "Sharp" }];
      const char2 = createBaseCharacter();

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Removed equipment");
    });

    it("should detect modified equipment", () => {
      const char1 = createBaseCharacter();
      char1.equipment = [{ name: "Sword", description: "Sharp" }];
      const char2 = createBaseCharacter();
      char2.equipment = [{ name: "Sword", description: "Very sharp" }];

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Modified equipment");
    });
  });

  describe("Collection Changes - Attacks", () => {
    it("should detect added attack", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.attacks = [{ name: "Sword Strike", modifier: 0, damage: 4, range: "Immediate" }];

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Added attack");
    });
  });

  describe("Collection Changes - Abilities", () => {
    it("should detect added ability", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.abilities = [{ name: "Bash", cost: 1, description: "Attack" }];

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Added ability");
    });
  });

  describe("Text Field Changes", () => {
    it("should detect background change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.textFields.background = "New background story";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Updated background");
    });

    it("should detect notes change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.textFields.notes = "Some notes";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Updated notes");
    });

    it("should combine text field changes", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.textFields.background = "New background";
      char2.textFields.notes = "New notes";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Updated text fields");
      expect(changes).not.toContain("Updated background");
      expect(changes).not.toContain("Updated notes");
    });
  });

  describe("Priority Ordering", () => {
    it("should prioritize name over stats", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.name = "New Name";
      char2.stats.might.pool = 12;

      const changes = detectChanges(char1, char2);

      expect(changes[0]).toBe("Changed name");
      expect(changes[1]).toBe("Updated might");
    });

    it("should prioritize basic info over collections", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.tier = 2;
      char2.cyphers = [{ name: "Test", level: "1", effect: "" }];

      const changes = detectChanges(char1, char2);

      expect(changes[0]).toBe("Changed tier");
      expect(changes[1]).toBe("Added cypher");
    });

    it("should prioritize stats over text fields", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.might.pool = 12;
      char2.textFields.notes = "Notes";

      const changes = detectChanges(char1, char2);

      expect(changes[0]).toBe("Updated might");
      expect(changes[1]).toBe("Updated notes");
    });

    it("should limit to top 3 changes when many changes occur", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.name = "New Name";
      char2.tier = 2;
      char2.stats.might.pool = 12;
      char2.cyphers = [{ name: "Test", level: "1", effect: "" }];
      char2.textFields.notes = "Notes";

      const changes = detectChanges(char1, char2);

      expect(changes).toHaveLength(3);
      expect(changes[0]).toBe("Changed name");
      expect(changes[1]).toBe("Changed tier");
      expect(changes[2]).toBe("Updated might");
    });
  });

  describe("Resource Tracker Changes", () => {
    it("should detect XP change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.xp = 5;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Updated XP");
    });

    it("should detect shins change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.shins = 20;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Updated shins");
    });

    it("should detect armor change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.armor = 2;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Updated armor");
    });

    it("should combine resource changes", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.xp = 5;
      char2.shins = 20;
      char2.armor = 2;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("Updated resources");
      expect(changes).not.toContain("Updated XP");
      expect(changes).not.toContain("Updated shins");
    });
  });
});
