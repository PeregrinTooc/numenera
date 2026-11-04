import { Character } from "@/types/character";
import { asRecord, isRecord } from "@/utils/typeGuards";

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

type PrimitiveType = "string" | "number" | "boolean";

const STRING_FIELDS = ["name", "type", "descriptor", "focus"] as const;
const NUMBER_FIELDS = [
  "tier",
  "currentXp",
  "totalXp",
  "shins",
  "armor",
  "effort",
  "maxCyphers",
] as const;
const STAT_NAMES = ["might", "speed", "intellect"] as const;
const STAT_POOL_FIELDS = ["pool", "edge", "current"] as const;
const ARRAY_FIELDS = [
  "cyphers",
  "artifacts",
  "oddities",
  "abilities",
  "equipment",
  "attacks",
  "specialAbilities",
] as const;
const RECOVERY_BOOLEAN_FIELDS = ["action", "tenMinutes", "oneHour", "tenHours"] as const;

/** A required field must be present and of the given primitive type; `path` is how errors name it. */
function requireField(
  obj: Record<string, unknown>,
  key: string,
  type: PrimitiveType,
  path: string,
  errors: string[]
): void {
  if (obj[key] === undefined) {
    errors.push(`Missing required field: ${path}`);
  } else if (typeof obj[key] !== type) {
    errors.push(`Field '${path}' must be a ${type}`);
  }
}

/** A required field that must be an object; returns it, or null after recording the error. */
function requireObject(
  data: Record<string, unknown>,
  key: string,
  errors: string[]
): Record<string, unknown> | null {
  const value = data[key];
  if (value === undefined) {
    errors.push(`Missing required field: ${key}`);
    return null;
  }
  if (!isRecord(value)) {
    errors.push(`Field '${key}' must be an object`);
    return null;
  }
  return value;
}

function validateBasicFields(data: Record<string, unknown>, errors: string[]): void {
  for (const key of STRING_FIELDS) requireField(data, key, "string", key, errors);
  for (const key of NUMBER_FIELDS) requireField(data, key, "number", key, errors);
}

function validateStats(data: Record<string, unknown>, errors: string[]): void {
  const stats = requireObject(data, "stats", errors);
  if (!stats) return;
  for (const stat of STAT_NAMES) {
    if (stats[stat] === undefined) {
      errors.push(`Missing required field: stats.${stat}`);
    } else {
      validateStatPool(stats[stat], `stats.${stat}`, errors);
    }
  }
}

function validateStatPool(value: unknown, path: string, errors: string[]): void {
  const pool = asRecord(value);
  for (const key of STAT_POOL_FIELDS) requireField(pool, key, "number", `${path}.${key}`, errors);
}

function validateCollections(data: Record<string, unknown>, errors: string[]): void {
  for (const key of ARRAY_FIELDS) {
    if (data[key] === undefined) {
      errors.push(`Missing required field: ${key}`);
    } else if (!Array.isArray(data[key])) {
      errors.push(`Field '${key}' must be an array`);
    }
  }
}

function validateRecoveryRolls(data: Record<string, unknown>, errors: string[]): void {
  const rolls = requireObject(data, "recoveryRolls", errors);
  if (!rolls) return;
  for (const key of RECOVERY_BOOLEAN_FIELDS) {
    requireField(rolls, key, "boolean", `recoveryRolls.${key}`, errors);
  }
  requireField(rolls, "modifier", "number", "recoveryRolls.modifier", errors);
}

function validateDamageTrack(data: Record<string, unknown>, errors: string[]): void {
  const track = requireObject(data, "damageTrack", errors);
  if (!track) return;
  requireField(track, "impairment", "string", "damageTrack.impairment", errors);
}

function validateTextFields(data: Record<string, unknown>, errors: string[]): void {
  const textFields = requireObject(data, "textFields", errors);
  if (!textFields) return;
  requireField(textFields, "background", "string", "textFields.background", errors);
  requireField(textFields, "notes", "string", "textFields.notes", errors);
}

export function validateCharacter(input: unknown): CharacterValidationResult {
  const errors: string[] = [];
  // Anything that is not an object validates as an empty one: every required field is reported missing
  const data = asRecord(input);

  validateBasicFields(data, errors);
  validateStats(data, errors);
  validateCollections(data, errors);
  validateRecoveryRolls(data, errors);
  validateDamageTrack(data, errors);
  validateTextFields(data, errors);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    character: data as unknown as Character,
    errors: [],
  };
}
