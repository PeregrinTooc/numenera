import { describe, it, expect } from "vitest";
import { sanitizeCharacter } from "@/utils/characterSanitizer";
import { CHARACTER_DEFAULTS } from "@/data/characterDefaults";
import { createValidHeroCharacter } from "../factories/validationCharacter.js";

describe("characterSanitizer", () => {
  describe("sanitizeCharacter", () => {
    describe("null/undefined input", () => {
      it("should return defaults for null input", () => {
        const result = sanitizeCharacter(null);

        expect(result.character).toEqual(CHARACTER_DEFAULTS);
        expect(result.warnings.length).toBe(1);
        expect(result.warnings[0]).toContain("null");
      });

      it("should return defaults for undefined input", () => {
        const result = sanitizeCharacter(undefined);

        expect(result.character).toEqual(CHARACTER_DEFAULTS);
        expect(result.warnings.length).toBe(1);
      });
    });

    describe("non-object input", () => {
      it("should return defaults for string input", () => {
        const result = sanitizeCharacter("not an object");

        expect(result.character).toEqual(CHARACTER_DEFAULTS);
        expect(result.warnings.length).toBe(1);
        expect(result.warnings[0]).toContain("not an object");
      });

      it("should return defaults for number input", () => {
        const result = sanitizeCharacter(42);

        expect(result.character).toEqual(CHARACTER_DEFAULTS);
        expect(result.warnings.length).toBe(1);
      });

      it("should return defaults for array input", () => {
        const result = sanitizeCharacter([1, 2, 3]);

        // Arrays are technically objects, but should still work
        expect(result.character).toBeDefined();
        expect(result.warnings.length).toBeGreaterThan(0);
      });
    });

    describe("missing fields", () => {
      it("should use defaults for empty object", () => {
        const result = sanitizeCharacter({});

        expect(result.character.name).toBe(CHARACTER_DEFAULTS.name);
        expect(result.character.tier).toBe(CHARACTER_DEFAULTS.tier);
        expect(result.character.type).toBe(CHARACTER_DEFAULTS.type);
        expect(result.warnings.length).toBeGreaterThan(0);
      });

      it("should preserve valid fields and fill missing ones", () => {
        const input = {
          name: "Test Hero",
          tier: 3,
        };

        const result = sanitizeCharacter(input);

        expect(result.character.name).toBe("Test Hero");
        expect(result.character.tier).toBe(3);
        expect(result.character.type).toBe(CHARACTER_DEFAULTS.type);
        expect(result.character.stats).toEqual(CHARACTER_DEFAULTS.stats);
      });
    });

    describe("wrong types", () => {
      it("should replace string field with wrong type", () => {
        const input = {
          name: 123, // should be string
        };

        const result = sanitizeCharacter(input);

        expect(result.character.name).toBe(CHARACTER_DEFAULTS.name);
        expect(result.warnings).toContainEqual(expect.stringContaining("name"));
        expect(result.warnings).toContainEqual(expect.stringContaining("string"));
      });

      it("should replace number field with wrong type", () => {
        const input = {
          tier: "three", // should be number
        };

        const result = sanitizeCharacter(input);

        expect(result.character.tier).toBe(CHARACTER_DEFAULTS.tier);
        expect(result.warnings).toContainEqual(expect.stringContaining("tier"));
        expect(result.warnings).toContainEqual(expect.stringContaining("number"));
      });

      it("should handle NaN values", () => {
        const input = {
          currentXp: NaN,
          totalXp: NaN,
        };

        const result = sanitizeCharacter(input);

        expect(result.character.currentXp).toBe(CHARACTER_DEFAULTS.currentXp);
        expect(result.character.totalXp).toBe(CHARACTER_DEFAULTS.totalXp);
        expect(result.warnings).toContainEqual(expect.stringContaining("currentXp"));
        expect(result.warnings).toContainEqual(expect.stringContaining("totalXp"));
      });
    });

    describe("legacy xp migration", () => {
      it("should populate both currentXp and totalXp from a legacy single xp value", () => {
        const input = { xp: 12 };

        const result = sanitizeCharacter(input);

        expect(result.character.currentXp).toBe(12);
        expect(result.character.totalXp).toBe(12);
      });

      it("should prefer currentXp/totalXp over a legacy xp value when both are present", () => {
        const input = { xp: 12, currentXp: 3, totalXp: 20 };

        const result = sanitizeCharacter(input);

        expect(result.character.currentXp).toBe(3);
        expect(result.character.totalXp).toBe(20);
      });

      it("should default to 0 when neither legacy xp nor the new fields are present", () => {
        const result = sanitizeCharacter({});

        expect(result.character.currentXp).toBe(0);
        expect(result.character.totalXp).toBe(0);
      });
    });

    describe("number bounds", () => {
      it("should clamp tier to valid range", () => {
        const input = { tier: 10 };

        const result = sanitizeCharacter(input);

        expect(result.character.tier).toBe(6); // Max tier is 6
      });

      it("should clamp negative tier to minimum", () => {
        const input = { tier: -5 };

        const result = sanitizeCharacter(input);

        expect(result.character.tier).toBe(1); // Min tier is 1
      });

      it("should clamp effort to valid range", () => {
        const input = { effort: 100 };

        const result = sanitizeCharacter(input);

        expect(result.character.effort).toBe(6); // Max effort is 6
      });
    });

    describe("portrait handling", () => {
      it("should preserve valid portrait string", () => {
        const input = {
          portrait: "data:image/png;base64,abc123",
        };

        const result = sanitizeCharacter(input);

        expect(result.character.portrait).toBe("data:image/png;base64,abc123");
      });

      it("should not include portrait if not a string", () => {
        const input = {
          portrait: 123,
        };

        const result = sanitizeCharacter(input);

        expect(result.character.portrait).toBeUndefined();
      });
    });

    describe("complete valid character", () => {
      it("should return character with no warnings when all fields valid", () => {
        const validCharacter = createValidHeroCharacter();

        const result = sanitizeCharacter(validCharacter);

        expect(result.warnings.length).toBe(0);
        expect(result.character.name).toBe("Test Hero");
        expect(result.character.tier).toBe(3);
        expect(result.character.stats.might.pool).toBe(18);
      });
    });

    describe("unknown fields", () => {
      it("should ignore unknown fields in input", () => {
        const input = {
          name: "Test Hero",
          unknownField: "should be ignored",
          anotherUnknown: 123,
        };

        const result = sanitizeCharacter(input);

        expect(result.character.name).toBe("Test Hero");
        expect(result.character).not.toHaveProperty("unknownField");
        expect(result.character).not.toHaveProperty("anotherUnknown");
      });
    });
  });
});
