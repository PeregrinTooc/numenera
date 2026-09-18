import { describe, it, expect } from "vitest";
import { detectChanges } from "../../src/utils/changeDetection.js";
import { createTestCharacter as createBaseCharacter } from "../factories/character.js";

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

      expect(changes).toContain("versionHistory.changes.basicInfo.name");
    });

    it("should detect tier change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.tier = 2;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.basicInfo.tier");
    });

    it("should detect type change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.type = "Jack";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.basicInfo.type");
    });

    it("should detect descriptor change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.descriptor = "Swift";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.basicInfo.descriptor");
    });

    it("should detect focus change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.focus = "Masters Defense";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.basicInfo.focus");
    });

    it("should combine multiple basic info changes", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.name = "New Name";
      char2.tier = 2;
      char2.type = "Jack";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.basicInfo.combined");
      expect(changes).not.toContain("versionHistory.changes.basicInfo.name");
      expect(changes).not.toContain("versionHistory.changes.basicInfo.tier");
      expect(changes).not.toContain("versionHistory.changes.basicInfo.type");
    });
  });

  describe("Stat Changes", () => {
    it("should detect might pool change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.might.pool = 12;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.stats.might");
    });

    it("should detect speed pool change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.speed.pool = 12;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.stats.speed");
    });

    it("should detect intellect pool change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.intellect.pool = 12;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.stats.intellect");
    });

    it("should detect edge changes", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.might.edge = 1;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.stats.might");
    });

    it("should detect current value changes", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.might.current = 8;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.stats.might");
    });

    it("should combine multiple stat changes", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.might.pool = 12;
      char2.stats.speed.edge = 1;
      char2.stats.intellect.current = 8;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.stats.combined");
      expect(changes).not.toContain("versionHistory.changes.stats.might");
      expect(changes).not.toContain("versionHistory.changes.stats.speed");
      expect(changes).not.toContain("versionHistory.changes.stats.intellect");
    });
  });

  describe("Collection Changes - Cyphers", () => {
    it("should detect added cypher", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.cyphers = [{ name: "Detonation", level: "3", effect: "Explodes" }];

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.collections.cypher.added");
    });

    it("should detect removed cypher", () => {
      const char1 = createBaseCharacter();
      char1.cyphers = [{ name: "Detonation", level: "3", effect: "Explodes" }];
      const char2 = createBaseCharacter();

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.collections.cypher.removed");
    });

    it("should detect modified cypher", () => {
      const char1 = createBaseCharacter();
      char1.cyphers = [{ name: "Detonation", level: "3", effect: "Explodes" }];
      const char2 = createBaseCharacter();
      char2.cyphers = [{ name: "Detonation", level: "5", effect: "Explodes" }];

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.collections.cypher.modified");
    });
  });

  describe("Collection Changes - Equipment", () => {
    it("should detect added equipment", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.equipment = [{ name: "Sword", description: "Sharp" }];

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.collections.equipment.added");
    });

    it("should detect removed equipment", () => {
      const char1 = createBaseCharacter();
      char1.equipment = [{ name: "Sword", description: "Sharp" }];
      const char2 = createBaseCharacter();

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.collections.equipment.removed");
    });

    it("should detect modified equipment", () => {
      const char1 = createBaseCharacter();
      char1.equipment = [{ name: "Sword", description: "Sharp" }];
      const char2 = createBaseCharacter();
      char2.equipment = [{ name: "Sword", description: "Very sharp" }];

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.collections.equipment.modified");
    });
  });

  describe("Collection Changes - Attacks", () => {
    it("should detect added attack", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.attacks = [{ name: "Sword Strike", modifier: 0, damage: 4, range: "Immediate" }];

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.collections.attack.added");
    });
  });

  describe("Collection Changes - Abilities", () => {
    it("should detect added ability", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.abilities = [{ name: "Bash", cost: 1, description: "Attack" }];

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.collections.ability.added");
    });
  });

  describe("Text Field Changes", () => {
    it("should detect background change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.textFields.background = "New background story";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.textFields.background");
    });

    it("should detect notes change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.textFields.notes = "Some notes";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.textFields.notes");
    });

    it("should combine text field changes", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.textFields.background = "New background";
      char2.textFields.notes = "New notes";

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.textFields.combined");
      expect(changes).not.toContain("versionHistory.changes.textFields.background");
      expect(changes).not.toContain("versionHistory.changes.textFields.notes");
    });
  });

  describe("Priority Ordering", () => {
    it("should prioritize name over stats", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.name = "New Name";
      char2.stats.might.pool = 12;

      const changes = detectChanges(char1, char2);

      expect(changes[0]).toBe("versionHistory.changes.basicInfo.name");
      expect(changes[1]).toBe("versionHistory.changes.stats.might");
    });

    it("should prioritize basic info over collections", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.tier = 2;
      char2.cyphers = [{ name: "Test", level: "1", effect: "" }];

      const changes = detectChanges(char1, char2);

      expect(changes[0]).toBe("versionHistory.changes.basicInfo.tier");
      expect(changes[1]).toBe("versionHistory.changes.collections.cypher.added");
    });

    it("should prioritize stats over text fields", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.stats.might.pool = 12;
      char2.textFields.notes = "Notes";

      const changes = detectChanges(char1, char2);

      expect(changes[0]).toBe("versionHistory.changes.stats.might");
      expect(changes[1]).toBe("versionHistory.changes.textFields.notes");
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
      expect(changes[0]).toBe("versionHistory.changes.basicInfo.name");
      expect(changes[1]).toBe("versionHistory.changes.basicInfo.tier");
      expect(changes[2]).toBe("versionHistory.changes.stats.might");
    });
  });

  describe("Resource Tracker Changes", () => {
    it("should detect currentXp change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.currentXp = 5;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.resources.xp");
    });

    it("should detect totalXp change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.totalXp = 20;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.resources.xp");
    });

    it("should detect currentXp and totalXp changing together as a single Updated XP entry", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.currentXp = 5;
      char2.totalXp = 20;

      const changes = detectChanges(char1, char2);

      expect(changes.filter((c) => c === "versionHistory.changes.resources.xp")).toHaveLength(1);
    });

    it("should detect shins change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.shins = 20;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.resources.shins");
    });

    it("should detect armor change", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.armor = 2;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.resources.armor");
    });

    it("should combine resource changes", () => {
      const char1 = createBaseCharacter();
      const char2 = createBaseCharacter();
      char2.currentXp = 5;
      char2.shins = 20;
      char2.armor = 2;

      const changes = detectChanges(char1, char2);

      expect(changes).toContain("versionHistory.changes.resources.combined");
      expect(changes).not.toContain("versionHistory.changes.resources.xp");
      expect(changes).not.toContain("versionHistory.changes.resources.shins");
    });
  });
});
