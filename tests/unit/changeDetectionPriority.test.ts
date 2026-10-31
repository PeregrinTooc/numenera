import { describe, it, expect } from "vitest";
import { detectChanges } from "@/utils/changeDetection";
import { createTestCharacter as createBaseCharacter } from "../factories/character.js";

describe("Change Detection", () => {
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
