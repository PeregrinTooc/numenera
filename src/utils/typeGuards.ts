import type { Character } from "@/types/character";

/** Narrow an unknown value to a plain string-keyed object (arrays are excluded). */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Structural check that stored data has every section the sheet renders.
 * Deliberately shallow (presence and array-ness only): field-level repair is sanitizeCharacter's job.
 */
export function isCompleteCharacter(value: unknown): value is Character {
  if (!isRecord(value)) return false;
  const { stats } = value;
  return (
    isRecord(stats) &&
    Boolean(stats.might) &&
    Boolean(stats.speed) &&
    Boolean(stats.intellect) &&
    [
      "abilities",
      "cyphers",
      "artifacts",
      "equipment",
      "attacks",
      "specialAbilities",
      "oddities",
    ].every((key) => Array.isArray(value[key])) &&
    Boolean(value.recoveryRolls) &&
    Boolean(value.damageTrack) &&
    Boolean(value.textFields)
  );
}

/** The value itself when it is a plain object, otherwise an empty record. */
export function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}
