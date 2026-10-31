import { describe, it, expect } from "vitest";
import { sanitizeCharacter } from "@/utils/characterSanitizer";
import { CHARACTER_DEFAULTS } from "@/data/characterDefaults";

describe("sanitizeSections", () => {
  describe("sanitizeCharacter", () => {
    describe("stats sanitization", () => {
      it("should sanitize invalid stats object", () => {
        const input = {
          stats: "not an object",
        };

        const result = sanitizeCharacter(input);

        expect(result.character.stats).toEqual(CHARACTER_DEFAULTS.stats);
        expect(result.warnings).toContainEqual(expect.stringContaining("stats"));
      });

      it("should sanitize missing stat pool", () => {
        const input = {
          stats: {
            might: { pool: 15, edge: 1, current: 15 },
            // speed and intellect missing
          },
        };

        const result = sanitizeCharacter(input);

        expect(result.character.stats.might).toEqual({ pool: 15, edge: 1, current: 15 });
        expect(result.character.stats.speed).toEqual(CHARACTER_DEFAULTS.stats.speed);
        expect(result.character.stats.intellect).toEqual(CHARACTER_DEFAULTS.stats.intellect);
      });

      it("should sanitize partial stat pool", () => {
        const input = {
          stats: {
            might: { pool: 15 }, // missing edge and current
            speed: { pool: 10, edge: 0, current: 10 },
            intellect: { pool: 10, edge: 0, current: 10 },
          },
        };

        const result = sanitizeCharacter(input);

        expect(result.character.stats.might.pool).toBe(15);
        expect(result.character.stats.might.edge).toBe(CHARACTER_DEFAULTS.stats.might.edge);
        expect(result.character.stats.might.current).toBe(CHARACTER_DEFAULTS.stats.might.current);
      });

      it("should clamp negative pool values to 0", () => {
        const input = {
          stats: {
            might: { pool: -10, edge: -5, current: -20 },
            speed: { pool: 10, edge: 0, current: 10 },
            intellect: { pool: 10, edge: 0, current: 10 },
          },
        };

        const result = sanitizeCharacter(input);

        expect(result.character.stats.might.pool).toBe(0);
        expect(result.character.stats.might.edge).toBe(0);
        expect(result.character.stats.might.current).toBe(0);
      });
    });

    describe("recoveryRolls sanitization", () => {
      it("should sanitize missing recoveryRolls", () => {
        const input = {};

        const result = sanitizeCharacter(input);

        expect(result.character.recoveryRolls).toEqual(CHARACTER_DEFAULTS.recoveryRolls);
      });

      it("should sanitize partial recoveryRolls", () => {
        const input = {
          recoveryRolls: {
            action: true,
            // other fields missing
          },
        };

        const result = sanitizeCharacter(input);

        expect(result.character.recoveryRolls.action).toBe(true);
        expect(result.character.recoveryRolls.tenMinutes).toBe(false);
        expect(result.character.recoveryRolls.modifier).toBe(0);
      });

      it("should sanitize wrong type in recoveryRolls", () => {
        const input = {
          recoveryRolls: {
            action: "yes", // should be boolean
            tenMinutes: false,
            oneHour: false,
            tenHours: false,
            modifier: 0,
          },
        };

        const result = sanitizeCharacter(input);

        expect(result.character.recoveryRolls.action).toBe(false); // default
        expect(result.warnings).toContainEqual(expect.stringContaining("recoveryRolls.action"));
      });
    });

    describe("damageTrack sanitization", () => {
      it("should sanitize missing damageTrack", () => {
        const input = {};

        const result = sanitizeCharacter(input);

        expect(result.character.damageTrack).toEqual(CHARACTER_DEFAULTS.damageTrack);
      });

      it("should sanitize invalid impairment value", () => {
        const input = {
          damageTrack: {
            impairment: "wounded", // invalid value
          },
        };

        const result = sanitizeCharacter(input);

        expect(result.character.damageTrack.impairment).toBe("healthy");
        expect(result.warnings).toContainEqual(expect.stringContaining("damageTrack.impairment"));
      });

      it("should accept valid impairment values", () => {
        const validValues = ["healthy", "impaired", "debilitated"] as const;

        for (const value of validValues) {
          const input = {
            damageTrack: { impairment: value },
          };

          const result = sanitizeCharacter(input);

          expect(result.character.damageTrack.impairment).toBe(value);
        }
      });
    });

    describe("textFields sanitization", () => {
      it("should sanitize missing textFields", () => {
        const input = {};

        const result = sanitizeCharacter(input);

        expect(result.character.textFields).toEqual(CHARACTER_DEFAULTS.textFields);
      });

      it("should preserve valid textFields", () => {
        const input = {
          textFields: {
            background: "A long backstory...",
            notes: "Some notes...",
          },
        };

        const result = sanitizeCharacter(input);

        expect(result.character.textFields.background).toBe("A long backstory...");
        expect(result.character.textFields.notes).toBe("Some notes...");
      });

      it("should use defaults for wrong type textFields", () => {
        const input = {
          textFields: {
            background: 123, // should be string
            notes: true, // should be string
          },
        };

        const result = sanitizeCharacter(input);

        expect(result.character.textFields.background).toBe(
          CHARACTER_DEFAULTS.textFields.background
        );
        expect(result.character.textFields.notes).toBe(CHARACTER_DEFAULTS.textFields.notes);
      });
    });
  });
});
