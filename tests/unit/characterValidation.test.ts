import { describe, it, expect } from "vitest";
import { validateCharacter } from "../../src/utils/unified-validation.js";
import { Character } from "../../src/types/character";

describe("characterValidation", () => {
  describe("validateCharacter", () => {
    it("should validate a complete valid character", () => {
      const validCharacter: Character = {
        name: "Test Hero",
        tier: 3,
        type: "Glaive",
        descriptor: "Strong",
        focus: "Masters Defense",
        xp: 10,
        shins: 50,
        armor: 2,
        effort: 3,
        maxCyphers: 2,
        stats: {
          might: { pool: 18, edge: 1, current: 18 },
          speed: { pool: 12, edge: 0, current: 12 },
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
        damageTrack: {
          impairment: "healthy",
        },
        textFields: {
          background: "",
          notes: "",
        },
      };

      const result = validateCharacter(validCharacter);
      expect(result.valid).toBe(true);
      expect(result.character).toEqual(validCharacter);
      expect(result.errors).toEqual([]);
    });

    it("should reject character with missing name", () => {
      const invalidChar = {
        tier: 1,
        type: "Glaive",
      } as any;

      const result = validateCharacter(invalidChar);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: name");
    });

    it("should reject character with invalid name type", () => {
      const invalidChar = {
        name: 123,
        tier: 1,
      } as any;

      const result = validateCharacter(invalidChar);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Field 'name' must be a string");
    });

    it("should reject character with invalid tier type", () => {
      const invalidChar = {
        name: "Test",
        tier: "three",
      } as any;

      const result = validateCharacter(invalidChar);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Field 'tier' must be a number");
    });

    it("should reject character with missing stats", () => {
      const invalidChar = {
        name: "Test",
        tier: 1,
      } as any;

      const result = validateCharacter(invalidChar);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: stats");
    });

    it("should reject character with invalid stats structure", () => {
      const invalidChar = {
        name: "Test",
        tier: 1,
        stats: {
          might: { pool: 10 }, // missing edge and current
        },
      } as any;

      const result = validateCharacter(invalidChar);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: stats.might.edge");
    });

    it("should reject character with invalid array field", () => {
      const invalidChar = {
        name: "Test",
        tier: 1,
        stats: {
          might: { pool: 10, edge: 0, current: 10 },
          speed: { pool: 10, edge: 0, current: 10 },
          intellect: { pool: 10, edge: 0, current: 10 },
        },
        cyphers: "not an array",
      } as any;

      const result = validateCharacter(invalidChar);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Field 'cyphers' must be an array");
    });

    it("should provide all errors for multiple issues", () => {
      const invalidChar = {
        name: 123,
        tier: "two",
        stats: "invalid",
      } as any;

      const result = validateCharacter(invalidChar);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });

    it("should accept character with optional fields missing", () => {
      const minimalChar = {
        name: "Minimal Hero",
        tier: 1,
        type: "",
        descriptor: "",
        focus: "",
        xp: 0,
        shins: 0,
        armor: 0,
        effort: 0,
        maxCyphers: 0,
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
        damageTrack: {
          impairment: "healthy",
        },
        textFields: {
          background: "",
          notes: "",
        },
      };

      const result = validateCharacter(minimalChar);
      expect(result.valid).toBe(true);
    });
  });
});
