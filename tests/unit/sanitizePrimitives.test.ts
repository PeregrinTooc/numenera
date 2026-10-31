import { describe, it, expect } from "vitest";
import { sanitizeCharacter } from "@/utils/characterSanitizer";

describe("sanitizePrimitives", () => {
  describe("sanitizeCharacter", () => {
    describe("array field sanitization", () => {
      it("should sanitize missing array fields", () => {
        const input = {};

        const result = sanitizeCharacter(input);

        expect(result.character.cyphers).toEqual([]);
        expect(result.character.artifacts).toEqual([]);
        expect(result.character.oddities).toEqual([]);
        expect(result.character.abilities).toEqual([]);
      });

      it("should preserve oddities, which are plain strings", () => {
        const input = {
          oddities: ["A glowing cube that hums when near water", "A piece of cold metal"],
        };

        const result = sanitizeCharacter(input);

        expect(result.character.oddities).toEqual([
          "A glowing cube that hums when near water",
          "A piece of cold metal",
        ]);
        expect(result.warnings.filter((w) => w.includes("oddities"))).toEqual([]);
      });

      it("should drop non-string oddities and warn", () => {
        const input = { oddities: ["valid", 42, null, { name: "object" }] };

        const result = sanitizeCharacter(input);

        expect(result.character.oddities).toEqual(["valid"]);
        expect(result.warnings.filter((w) => w.includes("oddities"))).toHaveLength(3);
      });

      it("should drop non-object items from object collections and warn", () => {
        const input = { cyphers: ["not an object", { name: "Detonation" }] };

        const result = sanitizeCharacter(input);

        expect(result.character.cyphers).toEqual([{ name: "Detonation" }]);
        expect(result.warnings.filter((w) => w.includes("cyphers"))).toHaveLength(1);
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
  });
});
