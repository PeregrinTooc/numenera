// Unit tests for edit field validation
import { describe, it, expect } from "vitest";
import {
  validateTier,
  validateName,
  validateDescriptor,
  validateFocus,
} from "../../src/utils/validation.js";

// Tests
describe("Tier Validation", () => {
  it("should accept valid tier values (1-6)", () => {
    expect(validateTier(1)).toBe(1);
    expect(validateTier(3)).toBe(3);
    expect(validateTier(6)).toBe(6);
  });

  it("should constrain tier below minimum to 1", () => {
    expect(validateTier(0)).toBe(1);
    expect(validateTier(-1)).toBe(1);
    expect(validateTier(-100)).toBe(1);
  });

  it("should constrain tier above maximum to 6", () => {
    expect(validateTier(7)).toBe(6);
    expect(validateTier(10)).toBe(6);
    expect(validateTier(100)).toBe(6);
  });

  it("should handle string inputs", () => {
    expect(validateTier("3")).toBe(3);
    expect(validateTier("0")).toBe(1);
    expect(validateTier("7")).toBe(6);
  });

  it("should handle invalid string inputs", () => {
    expect(validateTier("abc")).toBe(1);
    expect(validateTier("")).toBe(1);
    expect(validateTier("3.5")).toBe(3); // parseInt truncates
  });
});

describe("Name Validation", () => {
  it("should accept valid names", () => {
    expect(validateName("Kael the Wanderer").valid).toBe(true);
    expect(validateName("Jane").valid).toBe(true);
    expect(validateName("A").valid).toBe(true);
  });

  it("should reject empty names", () => {
    const result = validateName("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Name cannot be empty");
  });

  it("should reject whitespace-only names", () => {
    const result = validateName("   ");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Name cannot be empty");
  });

  it("should reject names over 50 characters", () => {
    const longName = "A".repeat(51);
    const result = validateName(longName);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Name must be 50 characters or less");
  });

  it("should accept names exactly 50 characters", () => {
    const maxName = "A".repeat(50);
    expect(validateName(maxName).valid).toBe(true);
  });

  it("should trim whitespace before validation", () => {
    expect(validateName("  Kael  ").valid).toBe(true);
  });
});

describe("Descriptor Validation", () => {
  it("should accept valid descriptors", () => {
    expect(validateDescriptor("Strong").valid).toBe(true);
    expect(validateDescriptor("Swift").valid).toBe(true);
    expect(validateDescriptor("Clever").valid).toBe(true);
  });

  it("should reject empty descriptors", () => {
    const result = validateDescriptor("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Descriptor cannot be empty");
  });

  it("should reject whitespace-only descriptors", () => {
    const result = validateDescriptor("   ");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Descriptor cannot be empty");
  });

  it("should reject descriptors over 30 characters", () => {
    const longDesc = "A".repeat(31);
    const result = validateDescriptor(longDesc);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Descriptor must be 30 characters or less");
  });

  it("should accept descriptors exactly 30 characters", () => {
    const maxDesc = "A".repeat(30);
    expect(validateDescriptor(maxDesc).valid).toBe(true);
  });

  it("should accept multi-word descriptors", () => {
    expect(validateDescriptor("Stealthy and Quick").valid).toBe(true);
  });
});

describe("Focus Validation", () => {
  it("should accept valid focus phrases", () => {
    expect(validateFocus("Bears a Halo of Fire").valid).toBe(true);
    expect(validateFocus("Commands Mental Powers").valid).toBe(true);
    expect(validateFocus("Wields Two Weapons").valid).toBe(true);
  });

  it("should reject empty focus", () => {
    const result = validateFocus("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Focus cannot be empty");
  });

  it("should reject whitespace-only focus", () => {
    const result = validateFocus("   ");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Focus cannot be empty");
  });

  it("should reject focus over 50 characters", () => {
    const longFocus = "A".repeat(51);
    const result = validateFocus(longFocus);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Focus must be 50 characters or less");
  });

  it("should accept focus exactly 50 characters", () => {
    const maxFocus = "A".repeat(50);
    expect(validateFocus(maxFocus).valid).toBe(true);
  });

  it("should trim whitespace before validation", () => {
    expect(validateFocus("  Bears a Halo of Fire  ").valid).toBe(true);
  });
});
