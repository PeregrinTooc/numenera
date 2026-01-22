// Unit tests for localStorage module
// Tests character state persistence and data migration

import { describe, it, expect, beforeEach } from "vitest";
import {
  saveCharacterState,
  loadCharacterState,
  clearCharacterState,
} from "../../src/storage/localStorage";

describe("localStorage", () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    // Replace global localStorage with mock
    global.localStorage = localStorageMock as any;
    localStorageMock.clear();
  });

  describe("saveCharacterState", () => {
    it("should save character to localStorage", () => {
      const character = {
        name: "Test Character",
        tier: 1,
        abilities: [{ name: "Test Ability", cost: 3, description: "Test" }],
      };

      saveCharacterState(character);

      const stored = localStorage.getItem("numenera-character-state");
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(character);
    });
  });

  describe("loadCharacterState", () => {
    it("should return null when no data exists", () => {
      const result = loadCharacterState();
      expect(result).toBeNull();
    });

    it("should load saved character", () => {
      const character = {
        name: "Test Character",
        tier: 1,
        abilities: [{ name: "Test Ability", cost: 3, description: "Test" }],
      };

      saveCharacterState(character);
      const loaded = loadCharacterState();

      expect(loaded).toEqual(character);
    });

    // THIS TEST WILL FAIL - demonstrating the bug!
    it("should migrate old character data without abilities field", () => {
      // Simulate old localStorage data (before abilities array was added)
      const oldCharacterData = {
        name: "Old Character",
        tier: 2,
        type: "Glaive",
        descriptor: "Strong",
        focus: "Fights",
        textFields: {
          background: "Some background",
          notes: "Some notes",
          equipment: "Some equipment",
        },
        // Note: NO abilities field!
      };

      // Directly set old data in localStorage
      localStorage.setItem("numenera-character-state", JSON.stringify(oldCharacterData));

      // Load should migrate the data
      const loaded = loadCharacterState();

      // Should add abilities array
      expect(loaded).toBeTruthy();
      expect(loaded.abilities).toBeDefined();
      expect(Array.isArray(loaded.abilities)).toBe(true);
      expect(loaded.abilities).toEqual([]);

      // Other fields should remain unchanged
      expect(loaded.name).toBe("Old Character");
      expect(loaded.tier).toBe(2);
    });

    it("should not modify character data that already has abilities", () => {
      const newCharacterData = {
        name: "New Character",
        tier: 3,
        abilities: [{ name: "Existing Ability", cost: 2, description: "Test" }],
      };

      saveCharacterState(newCharacterData);
      const loaded = loadCharacterState();

      expect(loaded.abilities).toEqual(newCharacterData.abilities);
      expect(loaded.abilities.length).toBe(1);
    });
  });

  describe("clearCharacterState", () => {
    it("should remove character from localStorage", () => {
      const character = { name: "Test", tier: 1, abilities: [] };

      saveCharacterState(character);
      expect(loadCharacterState()).toBeTruthy();

      clearCharacterState();
      expect(loadCharacterState()).toBeNull();
    });
  });
});
