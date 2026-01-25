// Field validation configuration and utilities
// Centralizes validation logic to eliminate duplication in EditFieldModal

import { t } from "../i18n/index.js";
import { validateName, validateDescriptor, validateFocus } from "./validation.js";

export type FieldType =
  | "name"
  | "tier"
  | "descriptor"
  | "focus"
  | "xp"
  | "shins"
  | "armor"
  | "maxCyphers"
  | "effort"
  | "mightPool"
  | "mightEdge"
  | "mightCurrent"
  | "speedPool"
  | "speedEdge"
  | "speedCurrent"
  | "intellectPool"
  | "intellectEdge"
  | "intellectCurrent";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FieldConfig {
  inputType: "text" | "number";
  inputMode?: "numeric";
  min?: number;
  max?: number;
  maxLength?: number;
  validator?: (value: string) => ValidationResult;
}

/**
 * Configuration for all editable fields
 * Defines validation rules, input types, and constraints
 */
export const FIELD_CONFIGS: Record<FieldType, FieldConfig> = {
  // Text fields with custom validators
  name: { inputType: "text", maxLength: 50, validator: validateName },
  descriptor: { inputType: "text", maxLength: 30, validator: validateDescriptor },
  focus: { inputType: "text", maxLength: 50, validator: validateFocus },

  // Numeric fields with range constraints
  tier: { inputType: "number", inputMode: "numeric", min: 1, max: 6 },
  effort: { inputType: "number", inputMode: "numeric", min: 1, max: 6 },
  xp: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
  shins: { inputType: "number", inputMode: "numeric", min: 0, max: 999999 },
  armor: { inputType: "number", inputMode: "numeric", min: 0, max: 10 },
  maxCyphers: { inputType: "number", inputMode: "numeric", min: 0, max: 10 },

  // Stat pool fields
  mightPool: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
  mightEdge: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
  mightCurrent: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
  speedPool: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
  speedEdge: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
  speedCurrent: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
  intellectPool: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
  intellectEdge: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
  intellectCurrent: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
};

/**
 * Validates a numeric field value against its configuration
 */
function validateNumericField(
  value: string,
  min: number,
  max: number,
  fieldType: FieldType
): ValidationResult {
  const num = parseInt(value, 10);

  if (isNaN(num) || !Number.isInteger(Number(value))) {
    return {
      valid: false,
      error: t(`validation.${fieldType}.invalid`),
    };
  }

  if (num < min || num > max) {
    return {
      valid: false,
      error: t(`validation.${fieldType}.invalid`),
    };
  }

  return { valid: true };
}

/**
 * Validates a field value based on its type and configuration
 * Centralizes all validation logic in one place
 */
export function validateField(fieldType: FieldType, value: string): ValidationResult {
  const config = FIELD_CONFIGS[fieldType];

  // Text fields with custom validators
  if (config.validator) {
    return config.validator(value);
  }

  // Numeric fields
  if (config.inputType === "number" && config.min !== undefined && config.max !== undefined) {
    return validateNumericField(value, config.min, config.max, fieldType);
  }

  // Default: valid
  return { valid: true };
}

/**
 * Gets the input type for a field
 */
export function getInputType(fieldType: FieldType): string {
  return FIELD_CONFIGS[fieldType].inputType;
}

/**
 * Gets the input mode for a field (for mobile keyboards)
 */
export function getInputMode(fieldType: FieldType): string | undefined {
  return FIELD_CONFIGS[fieldType].inputMode;
}

/**
 * Gets the min value for a numeric field
 */
export function getMinValue(fieldType: FieldType): number | undefined {
  return FIELD_CONFIGS[fieldType].min;
}

/**
 * Gets the max value for a numeric field
 */
export function getMaxValue(fieldType: FieldType): number | undefined {
  return FIELD_CONFIGS[fieldType].max;
}

/**
 * Gets the max length for a text field
 */
export function getMaxLength(fieldType: FieldType): number | undefined {
  return FIELD_CONFIGS[fieldType].maxLength;
}

/**
 * Checks if a field is numeric
 */
export function isNumericField(fieldType: FieldType): boolean {
  return FIELD_CONFIGS[fieldType].inputType === "number";
}
