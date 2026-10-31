import { describe, it, expect } from "vitest";
import { detectChanges } from "@/utils/changeDetection";
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
});
