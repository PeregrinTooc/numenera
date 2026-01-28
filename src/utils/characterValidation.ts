// DEPRECATED: This module has been replaced by unified-validation.ts
// Please import from unified-validation.ts instead
// This file will be removed in a future version
//
// Character validation utilities for file import
// Validates character data structure and types

import { Character } from "../types/character.js";

export interface ValidationError {
  valid: false;
  errors: string[];
  character?: never;
}

export interface ValidationSuccess {
  valid: true;
  character: Character;
  errors: string[];
}

export type ValidationResult = ValidationSuccess | ValidationError;

/**
 * Validates a character object against the Character type schema
 * Returns validation result with typed character or list of errors
 */
export function validateCharacter(data: any): ValidationResult {
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
