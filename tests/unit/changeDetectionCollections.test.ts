import { describe, it, expect } from "vitest";
import { detectChanges } from "@/utils/changeDetection";
import { createTestCharacter as createBaseCharacter } from "../factories/character.js";

describe("Change Detection", () => {
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
});
