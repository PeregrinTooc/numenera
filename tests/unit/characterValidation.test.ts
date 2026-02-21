import { describe, it, expect } from "vitest";
import {
  validateCharacter,
  sanitizeCharacter,
  CHARACTER_DEFAULTS,
} from "../../src/utils/unified-validation.js";
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
          xp: NaN,
        };

        const result = sanitizeCharacter(input);

        expect(result.character.xp).toBe(CHARACTER_DEFAULTS.xp);
        expect(result.warnings).toContainEqual(expect.stringContaining("xp"));
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

    describe("array field sanitization", () => {
      it("should sanitize missing array fields", () => {
        const input = {};

        const result = sanitizeCharacter(input);

        expect(result.character.cyphers).toEqual([]);
        expect(result.character.artifacts).toEqual([]);
        expect(result.character.oddities).toEqual([]);
        expect(result.character.abilities).toEqual([]);
      });

      it("should sanitize non-array fields", () => {
        const input = {
          cyphers: "not an array",
          artifacts: 123,
        };

        const result = sanitizeCharacter(input);

        expect(result.character.cyphers).toEqual([]);
        expect(result.character.artifacts).toEqual([]);
        expect(result.warnings).toContainEqual(expect.stringContaining("cyphers"));
        expect(result.warnings).toContainEqual(expect.stringContaining("artifacts"));
      });

      it("should filter out non-object items from arrays", () => {
        const input = {
          cyphers: [
            { name: "Valid Cypher", level: 3, effect: "Does something" },
            "invalid string item",
            null,
            123,
            { name: "Another Cypher", level: 2, effect: "Does another thing" },
          ],
        };

        const result = sanitizeCharacter(input);

        expect(result.character.cyphers.length).toBe(2);
        expect(result.character.cyphers[0].name).toBe("Valid Cypher");
        expect(result.character.cyphers[1].name).toBe("Another Cypher");
        expect(result.warnings.length).toBeGreaterThan(0);
      });

      it("should preserve valid array items", () => {
        const input = {
          cyphers: [
            { name: "Cypher 1", level: 3, effect: "Effect 1" },
            { name: "Cypher 2", level: 5, effect: "Effect 2" },
          ],
        };

        const result = sanitizeCharacter(input);

        expect(result.character.cyphers.length).toBe(2);
        expect(result.character.cyphers[0]).toEqual({
          name: "Cypher 1",
          level: 3,
          effect: "Effect 1",
        });
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

    describe("portrait handling", () => {
      it("should preserve valid portrait string", () => {
        const input = {
          portrait: "data:image/png;base64,abc123",
        };

        const result = sanitizeCharacter(input);

        expect((result.character as any).portrait).toBe("data:image/png;base64,abc123");
      });

      it("should not include portrait if not a string", () => {
        const input = {
          portrait: 123,
        };

        const result = sanitizeCharacter(input);

        expect((result.character as any).portrait).toBeUndefined();
      });
    });

    describe("complete valid character", () => {
      it("should return character with no warnings when all fields valid", () => {
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
        expect((result.character as any).unknownField).toBeUndefined();
        expect((result.character as any).anotherUnknown).toBeUndefined();
      });
    });
  });
});
