// Unified validation system for Numenera Character Sheet
// Consolidates field validation, character validation, and business rules

import { Character } from "../types/character.js";
import { t } from "../i18n/index.js";

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface CharacterValidationError {
  valid: false;
  errors: string[];
  character?: never;
}

export interface CharacterValidationSuccess {
  valid: true;
  character: Character;
  errors: string[];
}

export type CharacterValidationResult = CharacterValidationSuccess | CharacterValidationError;

// ============================================================================
// FIELD TYPES
// ============================================================================

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

// ============================================================================
// FIELD VALIDATORS
// ============================================================================

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

// ============================================================================
// FIELD CONFIGURATION
// ============================================================================

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

// ============================================================================
// FIELD CONFIGURATION ACCESSORS
// ============================================================================

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

// ============================================================================
// CHARACTER VALIDATION
// ============================================================================

/**
 * Validates a character object against the Character type schema
 * Returns validation result with typed character or list of errors
 */
export function validateCharacter(data: any): CharacterValidationResult {
  const errors: string[] = [];

  // Validate required string fields
  if (data.name === undefined) {
    errors.push("Missing required field: name");
  } else if (typeof data.name !== "string") {
    errors.push("Field 'name' must be a string");
  }

  if (data.type === undefined) {
    errors.push("Missing required field: type");
  } else if (typeof data.type !== "string") {
    errors.push("Field 'type' must be a string");
  }

  if (data.descriptor === undefined) {
    errors.push("Missing required field: descriptor");
  } else if (typeof data.descriptor !== "string") {
    errors.push("Field 'descriptor' must be a string");
  }

  if (data.focus === undefined) {
    errors.push("Missing required field: focus");
  } else if (typeof data.focus !== "string") {
    errors.push("Field 'focus' must be a string");
  }

  // Validate required number fields
  if (data.tier === undefined) {
    errors.push("Missing required field: tier");
  } else if (typeof data.tier !== "number") {
    errors.push("Field 'tier' must be a number");
  }

  if (data.xp === undefined) {
    errors.push("Missing required field: xp");
  } else if (typeof data.xp !== "number") {
    errors.push("Field 'xp' must be a number");
  }

  if (data.shins === undefined) {
    errors.push("Missing required field: shins");
  } else if (typeof data.shins !== "number") {
    errors.push("Field 'shins' must be a number");
  }

  if (data.armor === undefined) {
    errors.push("Missing required field: armor");
  } else if (typeof data.armor !== "number") {
    errors.push("Field 'armor' must be a number");
  }

  if (data.effort === undefined) {
    errors.push("Missing required field: effort");
  } else if (typeof data.effort !== "number") {
    errors.push("Field 'effort' must be a number");
  }

  if (data.maxCyphers === undefined) {
    errors.push("Missing required field: maxCyphers");
  } else if (typeof data.maxCyphers !== "number") {
    errors.push("Field 'maxCyphers' must be a number");
  }

  // Validate stats object
  if (data.stats === undefined) {
    errors.push("Missing required field: stats");
  } else if (typeof data.stats !== "object" || data.stats === null) {
    errors.push("Field 'stats' must be an object");
  } else {
    // Validate stats.might
    if (data.stats.might === undefined) {
      errors.push("Missing required field: stats.might");
    } else {
      validateStatPool(data.stats.might, "stats.might", errors);
    }

    // Validate stats.speed
    if (data.stats.speed === undefined) {
      errors.push("Missing required field: stats.speed");
    } else {
      validateStatPool(data.stats.speed, "stats.speed", errors);
    }

    // Validate stats.intellect
    if (data.stats.intellect === undefined) {
      errors.push("Missing required field: stats.intellect");
    } else {
      validateStatPool(data.stats.intellect, "stats.intellect", errors);
    }
  }

  // Validate array fields
  validateArrayField(data, "cyphers", errors);
  validateArrayField(data, "artifacts", errors);
  validateArrayField(data, "oddities", errors);
  validateArrayField(data, "abilities", errors);
  validateArrayField(data, "equipment", errors);
  validateArrayField(data, "attacks", errors);
  validateArrayField(data, "specialAbilities", errors);

  // Validate recoveryRolls
  if (data.recoveryRolls === undefined) {
    errors.push("Missing required field: recoveryRolls");
  } else if (typeof data.recoveryRolls !== "object" || data.recoveryRolls === null) {
    errors.push("Field 'recoveryRolls' must be an object");
  } else {
    validateBooleanField(data.recoveryRolls, "action", "recoveryRolls.action", errors);
    validateBooleanField(data.recoveryRolls, "tenMinutes", "recoveryRolls.tenMinutes", errors);
    validateBooleanField(data.recoveryRolls, "oneHour", "recoveryRolls.oneHour", errors);
    validateBooleanField(data.recoveryRolls, "tenHours", "recoveryRolls.tenHours", errors);
    validateNumberField(data.recoveryRolls, "modifier", "recoveryRolls.modifier", errors);
  }

  // Validate damageTrack
  if (data.damageTrack === undefined) {
    errors.push("Missing required field: damageTrack");
  } else if (typeof data.damageTrack !== "object" || data.damageTrack === null) {
    errors.push("Field 'damageTrack' must be an object");
  } else {
    if (data.damageTrack.impairment === undefined) {
      errors.push("Missing required field: damageTrack.impairment");
    } else if (typeof data.damageTrack.impairment !== "string") {
      errors.push("Field 'damageTrack.impairment' must be a string");
    }
  }

  // Validate textFields
  if (data.textFields === undefined) {
    errors.push("Missing required field: textFields");
  } else if (typeof data.textFields !== "object" || data.textFields === null) {
    errors.push("Field 'textFields' must be an object");
  } else {
    if (data.textFields.background === undefined) {
      errors.push("Missing required field: textFields.background");
    } else if (typeof data.textFields.background !== "string") {
      errors.push("Field 'textFields.background' must be a string");
    }

    if (data.textFields.notes === undefined) {
      errors.push("Missing required field: textFields.notes");
    } else if (typeof data.textFields.notes !== "string") {
      errors.push("Field 'textFields.notes' must be a string");
    }
  }

  // Return result
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    character: data as Character,
    errors: [],
  };
}

// ============================================================================
// CHARACTER VALIDATION HELPERS
// ============================================================================

/**
 * Helper: Validate a StatPool object
 */
function validateStatPool(pool: any, path: string, errors: string[]): void {
  if (pool.pool === undefined) {
    errors.push(`Missing required field: ${path}.pool`);
  } else if (typeof pool.pool !== "number") {
    errors.push(`Field '${path}.pool' must be a number`);
  }

  if (pool.edge === undefined) {
    errors.push(`Missing required field: ${path}.edge`);
  } else if (typeof pool.edge !== "number") {
    errors.push(`Field '${path}.edge' must be a number`);
  }

  if (pool.current === undefined) {
    errors.push(`Missing required field: ${path}.current`);
  } else if (typeof pool.current !== "number") {
    errors.push(`Field '${path}.current' must be a number`);
  }
}

/**
 * Helper: Validate an array field exists and is an array
 */
function validateArrayField(data: any, fieldName: string, errors: string[]): void {
  if (data[fieldName] === undefined) {
    errors.push(`Missing required field: ${fieldName}`);
  } else if (!Array.isArray(data[fieldName])) {
    errors.push(`Field '${fieldName}' must be an array`);
  }
}

/**
 * Helper: Validate a boolean field
 */
function validateBooleanField(obj: any, fieldName: string, path: string, errors: string[]): void {
  if (obj[fieldName] === undefined) {
    errors.push(`Missing required field: ${path}`);
  } else if (typeof obj[fieldName] !== "boolean") {
    errors.push(`Field '${path}' must be a boolean`);
  }
}

/**
 * Helper: Validate a number field
 */
function validateNumberField(obj: any, fieldName: string, path: string, errors: string[]): void {
  if (obj[fieldName] === undefined) {
    errors.push(`Missing required field: ${path}`);
  } else if (typeof obj[fieldName] !== "number") {
    errors.push(`Field '${path}' must be a number`);
  }
}
