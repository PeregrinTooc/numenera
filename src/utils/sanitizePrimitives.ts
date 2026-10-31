import { t } from "@/i18n/index";
import { CHARACTER_DEFAULTS } from "@/data/characterDefaults";

export function sanitizeString(
  input: Record<string, unknown>,
  field: string,
  defaultValue: string,
  warnings: string[]
): string {
  if (input[field] === undefined) {
    warnings.push(t("validation.sanitize.missingField", { field }));
    return defaultValue;
  }
  if (typeof input[field] !== "string") {
    warnings.push(t("validation.sanitize.wrongType", { field, expected: "string" }));
    return defaultValue;
  }
  return input[field] as string;
}

export function sanitizeNumber(
  input: Record<string, unknown>,
  field: string,
  defaultValue: number,
  warnings: string[],
  min?: number,
  max?: number
): number {
  if (input[field] === undefined) {
    warnings.push(t("validation.sanitize.missingField", { field }));
    return defaultValue;
  }
  if (typeof input[field] !== "number" || isNaN(input[field] as number)) {
    warnings.push(t("validation.sanitize.wrongType", { field, expected: "number" }));
    return defaultValue;
  }

  let value = input[field] as number;

  if (min !== undefined && value < min) {
    value = min;
  }
  if (max !== undefined && value > max) {
    value = max;
  }

  return value;
}

/**
 * Sanitizes an XP field (currentXp or totalXp), falling back to a legacy
 * single `xp` value when the new field is absent — lets old saves/exports
 * with only `xp` populate both new fields with that value.
 */
export function sanitizeXpField(
  input: Record<string, unknown>,
  field: "currentXp" | "totalXp",
  warnings: string[]
): number {
  if (input[field] !== undefined) {
    return sanitizeNumber(input, field, CHARACTER_DEFAULTS[field], warnings, 0);
  }
  if (input.xp !== undefined) {
    return sanitizeNumber(input, "xp", CHARACTER_DEFAULTS[field], warnings, 0);
  }
  warnings.push(t("validation.sanitize.missingField", { field }));
  return CHARACTER_DEFAULTS[field];
}

/**
 * Kind of item a collection holds.
 *
 * Most character collections are arrays of objects, but `oddities` is a plain
 * `string[]` (see src/types/character.ts). Assuming "object" for every
 * collection silently deleted every oddity on import.
 */
type ArrayItemKind = "object" | "string";

export function sanitizeArrayField<T>(
  input: Record<string, unknown>,
  field: string,
  warnings: string[],
  itemKind: ArrayItemKind = "object"
): T[] {
  if (input[field] === undefined) {
    warnings.push(t("validation.sanitize.missingField", { field }));
    return [];
  }
  if (!Array.isArray(input[field])) {
    warnings.push(t("validation.sanitize.wrongType", { field, expected: "array" }));
    return [];
  }

  // Keep only items of the expected kind; warn about anything else
  const arr = input[field] as unknown[];
  const result: T[] = [];

  const isExpectedKind = (item: unknown): boolean =>
    itemKind === "string" ? typeof item === "string" : item !== null && typeof item === "object";

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (isExpectedKind(item)) {
      result.push(item as T);
    } else {
      warnings.push(t("validation.sanitize.invalidArrayItem", { field, index: i }));
    }
  }

  return result;
}
