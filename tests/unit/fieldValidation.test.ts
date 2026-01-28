import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  FIELD_CONFIGS,
  validateField,
  getInputType,
  getInputMode,
  getMinValue,
  getMaxValue,
  getMaxLength,
  isNumericField,
  type FieldType,
} from "../../src/utils/unified-validation.js";

describe("fieldValidation", () => {
  describe("FIELD_CONFIGS", () => {
    it("should have configuration for all text fields", () => {
      // Validators are private functions, so we just check structure
      expect(FIELD_CONFIGS.name.inputType).toBe("text");
      expect(FIELD_CONFIGS.name.maxLength).toBe(50);
      expect(typeof FIELD_CONFIGS.name.validator).toBe("function");

      expect(FIELD_CONFIGS.descriptor.inputType).toBe("text");
      expect(FIELD_CONFIGS.descriptor.maxLength).toBe(30);
      expect(typeof FIELD_CONFIGS.descriptor.validator).toBe("function");

      expect(FIELD_CONFIGS.focus.inputType).toBe("text");
      expect(FIELD_CONFIGS.focus.maxLength).toBe(50);
      expect(typeof FIELD_CONFIGS.focus.validator).toBe("function");
    });

    it("should have configuration for tier field", () => {
      expect(FIELD_CONFIGS.tier).toEqual({
        inputType: "number",
        inputMode: "numeric",
        min: 1,
        max: 6,
      });
    });

    it("should have configuration for effort field", () => {
      expect(FIELD_CONFIGS.effort).toEqual({
        inputType: "number",
        inputMode: "numeric",
        min: 1,
        max: 6,
      });
    });

    it("should have configuration for xp field", () => {
      expect(FIELD_CONFIGS.xp).toEqual({
        inputType: "number",
        inputMode: "numeric",
        min: 0,
        max: 9999,
      });
    });

    it("should have configuration for shins field", () => {
      expect(FIELD_CONFIGS.shins).toEqual({
        inputType: "number",
        inputMode: "numeric",
        min: 0,
        max: 999999,
      });
    });

    it("should have configuration for armor field", () => {
      expect(FIELD_CONFIGS.armor).toEqual({
        inputType: "number",
        inputMode: "numeric",
        min: 0,
        max: 10,
      });
    });

    it("should have configuration for maxCyphers field", () => {
      expect(FIELD_CONFIGS.maxCyphers).toEqual({
        inputType: "number",
        inputMode: "numeric",
        min: 0,
        max: 10,
      });
    });

    it("should have configuration for recoveryModifier field", () => {
      expect(FIELD_CONFIGS.recoveryModifier).toEqual({
        inputType: "number",
        inputMode: "numeric",
        min: -10,
        max: 20,
      });
    });

    it("should have configuration for all stat pool fields", () => {
      const statFields: FieldType[] = [
        "mightPool",
        "mightEdge",
        "mightCurrent",
        "speedPool",
        "speedEdge",
        "speedCurrent",
        "intellectPool",
        "intellectEdge",
        "intellectCurrent",
      ];

      statFields.forEach((field) => {
        expect(FIELD_CONFIGS[field]).toEqual({
          inputType: "number",
          inputMode: "numeric",
          min: 0,
          max: 9999,
        });
      });
    });
  });

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

      it("should accept valid xp value", () => {
        const result = validateField("xp", "100");
        expect(result.valid).toBe(true);
      });

      it("should accept xp at minimum (0)", () => {
        const result = validateField("xp", "0");
        expect(result.valid).toBe(true);
      });

      it("should accept xp at maximum (9999)", () => {
        const result = validateField("xp", "9999");
        expect(result.valid).toBe(true);
      });

      it("should reject negative xp", () => {
        const result = validateField("xp", "-1");
        expect(result.valid).toBe(false);
      });

      it("should reject xp above maximum", () => {
        const result = validateField("xp", "10000");
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

  describe("getInputType", () => {
    it("should return 'text' for text fields", () => {
      expect(getInputType("name")).toBe("text");
      expect(getInputType("descriptor")).toBe("text");
      expect(getInputType("focus")).toBe("text");
    });

    it("should return 'number' for numeric fields", () => {
      expect(getInputType("tier")).toBe("number");
      expect(getInputType("xp")).toBe("number");
      expect(getInputType("armor")).toBe("number");
      expect(getInputType("mightPool")).toBe("number");
    });
  });

  describe("getInputMode", () => {
    it("should return undefined for text fields", () => {
      expect(getInputMode("name")).toBeUndefined();
      expect(getInputMode("descriptor")).toBeUndefined();
      expect(getInputMode("focus")).toBeUndefined();
    });

    it("should return 'numeric' for numeric fields", () => {
      expect(getInputMode("tier")).toBe("numeric");
      expect(getInputMode("xp")).toBe("numeric");
      expect(getInputMode("armor")).toBe("numeric");
      expect(getInputMode("mightPool")).toBe("numeric");
    });
  });

  describe("getMinValue", () => {
    it("should return undefined for text fields", () => {
      expect(getMinValue("name")).toBeUndefined();
      expect(getMinValue("descriptor")).toBeUndefined();
      expect(getMinValue("focus")).toBeUndefined();
    });

    it("should return correct minimum for tier (1)", () => {
      expect(getMinValue("tier")).toBe(1);
    });

    it("should return correct minimum for xp (0)", () => {
      expect(getMinValue("xp")).toBe(0);
    });

    it("should return correct minimum for recoveryModifier (-10)", () => {
      expect(getMinValue("recoveryModifier")).toBe(-10);
    });

    it("should return correct minimum for stat pools (0)", () => {
      expect(getMinValue("mightPool")).toBe(0);
      expect(getMinValue("speedEdge")).toBe(0);
      expect(getMinValue("intellectCurrent")).toBe(0);
    });
  });

  describe("getMaxValue", () => {
    it("should return undefined for text fields", () => {
      expect(getMaxValue("name")).toBeUndefined();
      expect(getMaxValue("descriptor")).toBeUndefined();
      expect(getMaxValue("focus")).toBeUndefined();
    });

    it("should return correct maximum for tier (6)", () => {
      expect(getMaxValue("tier")).toBe(6);
    });

    it("should return correct maximum for xp (9999)", () => {
      expect(getMaxValue("xp")).toBe(9999);
    });

    it("should return correct maximum for shins (999999)", () => {
      expect(getMaxValue("shins")).toBe(999999);
    });

    it("should return correct maximum for armor (10)", () => {
      expect(getMaxValue("armor")).toBe(10);
    });

    it("should return correct maximum for recoveryModifier (20)", () => {
      expect(getMaxValue("recoveryModifier")).toBe(20);
    });

    it("should return correct maximum for stat pools (9999)", () => {
      expect(getMaxValue("mightPool")).toBe(9999);
      expect(getMaxValue("speedEdge")).toBe(9999);
      expect(getMaxValue("intellectCurrent")).toBe(9999);
    });
  });

  describe("getMaxLength", () => {
    it("should return correct maxLength for name (50)", () => {
      expect(getMaxLength("name")).toBe(50);
    });

    it("should return correct maxLength for descriptor (30)", () => {
      expect(getMaxLength("descriptor")).toBe(30);
    });

    it("should return correct maxLength for focus (50)", () => {
      expect(getMaxLength("focus")).toBe(50);
    });

    it("should return undefined for numeric fields", () => {
      expect(getMaxLength("tier")).toBeUndefined();
      expect(getMaxLength("xp")).toBeUndefined();
      expect(getMaxLength("armor")).toBeUndefined();
      expect(getMaxLength("mightPool")).toBeUndefined();
    });
  });

  describe("isNumericField", () => {
    it("should return false for text fields", () => {
      expect(isNumericField("name")).toBe(false);
      expect(isNumericField("descriptor")).toBe(false);
      expect(isNumericField("focus")).toBe(false);
    });

    it("should return true for numeric fields", () => {
      expect(isNumericField("tier")).toBe(true);
      expect(isNumericField("effort")).toBe(true);
      expect(isNumericField("xp")).toBe(true);
      expect(isNumericField("shins")).toBe(true);
      expect(isNumericField("armor")).toBe(true);
      expect(isNumericField("maxCyphers")).toBe(true);
      expect(isNumericField("recoveryModifier")).toBe(true);
    });

    it("should return true for stat pool fields", () => {
      expect(isNumericField("mightPool")).toBe(true);
      expect(isNumericField("mightEdge")).toBe(true);
      expect(isNumericField("mightCurrent")).toBe(true);
      expect(isNumericField("speedPool")).toBe(true);
      expect(isNumericField("speedEdge")).toBe(true);
      expect(isNumericField("speedCurrent")).toBe(true);
      expect(isNumericField("intellectPool")).toBe(true);
      expect(isNumericField("intellectEdge")).toBe(true);
      expect(isNumericField("intellectCurrent")).toBe(true);
    });
  });
});
