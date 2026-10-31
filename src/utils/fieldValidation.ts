import { t } from "@/i18n/index";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export type FieldType =
  | "name"
  | "tier"
  | "descriptor"
  | "focus"
  | "currentXp"
  | "totalXp"
  | "shins"
  | "armor"
  | "maxCyphers"
  | "effort"
  | "recoveryModifier"
  | "mightPool"
  | "mightEdge"
  | "mightCurrent"
  | "speedPool"
  | "speedEdge"
  | "speedCurrent"
  | "intellectPool"
  | "intellectEdge"
  | "intellectCurrent";

/**
 * Name validation: must not be empty, max 50 characters
 */
export function validateName(value: string): ValidationResult {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: t("validation.name.empty") };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: t("validation.name.tooLong") };
  }

  return { valid: true };
}

/**
 * Descriptor validation: must not be empty, max 30 characters
 */
export function validateDescriptor(value: string): ValidationResult {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: t("validation.descriptor.empty") };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: t("validation.descriptor.tooLong") };
  }

  return { valid: true };
}

/**
 * Focus validation: must not be empty, max 50 characters
 */
export function validateFocus(value: string): ValidationResult {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: t("validation.focus.empty") };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: t("validation.focus.tooLong") };
  }

  return { valid: true };
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
  currentXp: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
  totalXp: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
  shins: { inputType: "number", inputMode: "numeric", min: 0, max: 999999 },
  armor: { inputType: "number", inputMode: "numeric", min: 0, max: 10 },
  maxCyphers: { inputType: "number", inputMode: "numeric", min: 0, max: 10 },
  recoveryModifier: { inputType: "number", inputMode: "numeric", min: -10, max: 20 },

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
 * Tier validation: must be between 1-6 (Numenera rules)
 * Constrains values rather than rejecting them
 */
export function validateTier(value: string | number): number {
  const numValue = typeof value === "string" ? parseInt(value, 10) : value;

  // Handle invalid numbers
  if (isNaN(numValue)) {
    return 1; // Default to minimum
  }

  // Constrain to valid range
  if (numValue < 1) return 1;
  if (numValue > 6) return 6;

  return numValue;
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
