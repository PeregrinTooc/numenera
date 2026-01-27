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
    it("should save character to localStorage as raw data", () => {
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
      expect(parsed).toEqual(character);
      expect(parsed.schemaVersion).toBeUndefined(); // No version wrapper
    });
  });

  describe("loadCharacterState", () => {
    it("should return null when no data exists", () => {
      const loaded = loadCharacterState();
      expect(loaded).toBeNull();
    });

    it("should load saved character as raw data", () => {
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

    it("should migrate old versioned format to new raw format", () => {
      const character = {
        name: "Old Format Character",
        tier: 2,
      };

      // Simulate old format with schema version wrapper
      const oldVersionData = {
        schemaVersion: 4,
        character: character,
      };

      localStorage.setItem("numenera-character-state", JSON.stringify(oldVersionData));

      const loaded = loadCharacterState();
      expect(loaded).toEqual(character);

      // Verify it was migrated: re-saved in new format
      const stored = localStorage.getItem("numenera-character-state");
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual(character);
      expect(parsed.schemaVersion).toBeUndefined(); // No wrapper after migration
    });

    it("should handle corrupted data gracefully", () => {
      localStorage.setItem("numenera-character-state", "invalid json{");

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
