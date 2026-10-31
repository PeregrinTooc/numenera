import { describe, it, expect } from "vitest";
import {
  FIELD_CONFIGS,
  getInputType,
  getInputMode,
  getMinValue,
  getMaxValue,
  getMaxLength,
  isNumericField,
  type FieldType,
} from "@/utils/fieldValidation";

describe("fieldConfig", () => {
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

    it("should have configuration for currentXp field", () => {
      expect(FIELD_CONFIGS.currentXp).toEqual({
        inputType: "number",
        inputMode: "numeric",
        min: 0,
        max: 9999,
      });
    });

    it("should have configuration for totalXp field", () => {
      expect(FIELD_CONFIGS.totalXp).toEqual({
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

  describe("getInputType", () => {
    it("should return 'text' for text fields", () => {
      expect(getInputType("name")).toBe("text");
      expect(getInputType("descriptor")).toBe("text");
      expect(getInputType("focus")).toBe("text");
    });

    it("should return 'number' for numeric fields", () => {
      expect(getInputType("tier")).toBe("number");
      expect(getInputType("currentXp")).toBe("number");
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
      expect(getInputMode("currentXp")).toBe("numeric");
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

    it("should return correct minimum for currentXp (0)", () => {
      expect(getMinValue("currentXp")).toBe(0);
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

    it("should return correct maximum for currentXp (9999)", () => {
      expect(getMaxValue("currentXp")).toBe(9999);
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
      expect(getMaxLength("currentXp")).toBeUndefined();
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
      expect(isNumericField("currentXp")).toBe(true);
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
