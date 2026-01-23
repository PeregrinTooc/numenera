import { describe, it, expect, beforeEach } from "vitest";
import {
  saveCharacterState,
  loadCharacterState,
  clearCharacterState,
} from "../../src/storage/localStorage";

describe("localStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("saveCharacterState", () => {
    it("should save character to localStorage with schema version", () => {
      const character = {
        name: "Test Character",
        tier: 1,
        abilities: [
          {
            name: "Test Ability",
            cost: 3,
            description: "Test",
          },
        ],
      };

      saveCharacterState(character);

      const stored = localStorage.getItem("numenera-character-state");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.schemaVersion).toBe(3);
      expect(parsed.character).toEqual(character);
    });
  });

  describe("loadCharacterState", () => {
    it("should return null when no data exists", () => {
      const loaded = loadCharacterState();
      expect(loaded).toBeNull();
    });

    it("should load saved character with schema version", () => {
      const character = {
        name: "Test Character",
        tier: 1,
        abilities: [],
        equipment: [],
        armor: 0,
        effort: 1,
      };

      saveCharacterState(character);
      const loaded = loadCharacterState();

      expect(loaded).toEqual(character);
    });

    it("should load character without schema version (backwards compatibility)", () => {
      const character = {
        name: "Old Character",
        tier: 2,
      };

      // Simulate old data format (no schema version wrapper)
      localStorage.setItem("numenera-character-state", JSON.stringify(character));

      const loaded = loadCharacterState();
      expect(loaded).toEqual(character);
    });

    it("should clear data on schema version mismatch", () => {
      const oldVersionData = {
        schemaVersion: 2,
        character: {
          name: "Old Version Character",
          tier: 1,
        },
      };

      localStorage.setItem("numenera-character-state", JSON.stringify(oldVersionData));

      const loaded = loadCharacterState();
      expect(loaded).toBeNull();

      // Verify localStorage was cleared
      const stored = localStorage.getItem("numenera-character-state");
      expect(stored).toBeNull();
    });
  });

  describe("clearCharacterState", () => {
    it("should remove character from localStorage", () => {
      const character = { name: "Test", tier: 1 };
      saveCharacterState(character);

      clearCharacterState();

      const stored = localStorage.getItem("numenera-character-state");
      expect(stored).toBeNull();
    });
  });
});
