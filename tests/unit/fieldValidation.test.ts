import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateField } from "@/utils/fieldValidation";

describe("fieldValidation", () => {
  describe("validateField", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe("text fields with custom validators", () => {
      it("should use custom validator for name field", () => {
        const result = validateField("name", "Test Name");
        expect(result.valid).toBe(true);
      });

      it("should use custom validator for descriptor field", () => {
        const result = validateField("descriptor", "Clever");
        expect(result.valid).toBe(true);
      });

      it("should use custom validator for focus field", () => {
        const result = validateField("focus", "Crafts Illusions");
        expect(result.valid).toBe(true);
      });

      it("should return custom validator errors for empty name", () => {
        const result = validateField("name", "");
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error).toContain("empty");
      });

      it("should return custom validator errors for empty descriptor", () => {
        const result = validateField("descriptor", "");
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error).toContain("empty");
      });

      it("should return custom validator errors for empty focus", () => {
        const result = validateField("focus", "");
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error).toContain("empty");
      });
    });

    describe("numeric field validation", () => {
      it("should accept valid tier value", () => {
        const result = validateField("tier", "3");
        expect(result.valid).toBe(true);
      });

      it("should reject tier below minimum", () => {
        const result = validateField("tier", "0");
        expect(result.valid).toBe(false);
      });

      it("should reject tier above maximum", () => {
        const result = validateField("tier", "7");
        expect(result.valid).toBe(false);
      });

      it("should reject non-numeric tier value", () => {
        const result = validateField("tier", "abc");
        expect(result.valid).toBe(false);
      });

      it("should reject decimal tier value", () => {
        const result = validateField("tier", "3.5");
        expect(result.valid).toBe(false);
      });

      it("should accept valid currentXp value", () => {
        const result = validateField("currentXp", "100");
        expect(result.valid).toBe(true);
      });

      it("should accept currentXp at minimum (0)", () => {
        const result = validateField("currentXp", "0");
        expect(result.valid).toBe(true);
      });

      it("should accept currentXp at maximum (9999)", () => {
        const result = validateField("currentXp", "9999");
        expect(result.valid).toBe(true);
      });

      it("should reject negative currentXp", () => {
        const result = validateField("currentXp", "-1");
        expect(result.valid).toBe(false);
      });

      it("should reject currentXp above maximum", () => {
        const result = validateField("currentXp", "10000");
        expect(result.valid).toBe(false);
      });

      it("should accept valid shins value", () => {
        const result = validateField("shins", "1000");
        expect(result.valid).toBe(true);
      });

      it("should accept shins at maximum (999999)", () => {
        const result = validateField("shins", "999999");
        expect(result.valid).toBe(true);
      });

      it("should reject shins above maximum", () => {
        const result = validateField("shins", "1000000");
        expect(result.valid).toBe(false);
      });

      it("should accept valid armor value", () => {
        const result = validateField("armor", "3");
        expect(result.valid).toBe(true);
      });

      it("should accept armor at maximum (10)", () => {
        const result = validateField("armor", "10");
        expect(result.valid).toBe(true);
      });

      it("should reject armor above maximum", () => {
        const result = validateField("armor", "11");
        expect(result.valid).toBe(false);
      });

      it("should accept valid recoveryModifier value", () => {
        const result = validateField("recoveryModifier", "5");
        expect(result.valid).toBe(true);
      });

      it("should accept negative recoveryModifier", () => {
        const result = validateField("recoveryModifier", "-5");
        expect(result.valid).toBe(true);
      });

      it("should accept recoveryModifier at minimum (-10)", () => {
        const result = validateField("recoveryModifier", "-10");
        expect(result.valid).toBe(true);
      });

      it("should accept recoveryModifier at maximum (20)", () => {
        const result = validateField("recoveryModifier", "20");
        expect(result.valid).toBe(true);
      });

      it("should reject recoveryModifier below minimum", () => {
        const result = validateField("recoveryModifier", "-11");
        expect(result.valid).toBe(false);
      });

      it("should reject recoveryModifier above maximum", () => {
        const result = validateField("recoveryModifier", "21");
        expect(result.valid).toBe(false);
      });

      it("should accept valid stat pool values", () => {
        expect(validateField("mightPool", "15").valid).toBe(true);
        expect(validateField("speedEdge", "2").valid).toBe(true);
        expect(validateField("intellectCurrent", "10").valid).toBe(true);
      });

      it("should accept stat pool at minimum (0)", () => {
        expect(validateField("mightPool", "0").valid).toBe(true);
      });

      it("should accept stat pool at maximum (9999)", () => {
        expect(validateField("speedEdge", "9999").valid).toBe(true);
      });

      it("should reject stat pool below minimum", () => {
        expect(validateField("intellectPool", "-1").valid).toBe(false);
      });

      it("should reject stat pool above maximum", () => {
        expect(validateField("mightEdge", "10000").valid).toBe(false);
      });
    });
  });
});
