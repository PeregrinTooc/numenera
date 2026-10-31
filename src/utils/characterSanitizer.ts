import { Character } from "@/types/character";
import { t } from "@/i18n/index";
import { CHARACTER_DEFAULTS } from "@/data/characterDefaults";
import {
  sanitizeArrayField,
  sanitizeNumber,
  sanitizeString,
  sanitizeXpField,
} from "@/utils/sanitizePrimitives";
import {
  sanitizeDamageTrack,
  sanitizeRecoveryRolls,
  sanitizeStats,
  sanitizeTextFields,
} from "@/utils/sanitizeSections";

/**
 * Result of character sanitization
 */
export interface SanitizeResult {
  character: Character;
  warnings: string[];
}

/**
 * Sanitizes character data by fixing invalid types and filling missing fields.
 * Instead of rejecting invalid data, this function corrects it and reports warnings.
 *
 * @param data - Raw character data (potentially invalid)
 * @returns Sanitized character with list of corrections made
 */
export function sanitizeCharacter(data: unknown): SanitizeResult {
  const warnings: string[] = [];

  // Handle null/undefined input
  if (data === null || data === undefined) {
    warnings.push(t("validation.sanitize.nullInput"));
    return { character: globalThis.structuredClone(CHARACTER_DEFAULTS), warnings };
  }

  // Handle non-object input
  if (typeof data !== "object") {
    warnings.push(t("validation.sanitize.invalidType"));
    return { character: globalThis.structuredClone(CHARACTER_DEFAULTS), warnings };
  }

  const input = data as Record<string, unknown>;

  // Build sanitized character
  const character: Character = {
    name: sanitizeString(input, "name", CHARACTER_DEFAULTS.name, warnings),
    type: sanitizeString(input, "type", CHARACTER_DEFAULTS.type, warnings),
    descriptor: sanitizeString(input, "descriptor", CHARACTER_DEFAULTS.descriptor, warnings),
    focus: sanitizeString(input, "focus", CHARACTER_DEFAULTS.focus, warnings),
    tier: sanitizeNumber(input, "tier", CHARACTER_DEFAULTS.tier, warnings, 1, 6),
    currentXp: sanitizeXpField(input, "currentXp", warnings),
    totalXp: sanitizeXpField(input, "totalXp", warnings),
    shins: sanitizeNumber(input, "shins", CHARACTER_DEFAULTS.shins, warnings, 0),
    armor: sanitizeNumber(input, "armor", CHARACTER_DEFAULTS.armor, warnings, 0),
    effort: sanitizeNumber(input, "effort", CHARACTER_DEFAULTS.effort, warnings, 1, 6),
    maxCyphers: sanitizeNumber(input, "maxCyphers", CHARACTER_DEFAULTS.maxCyphers, warnings, 0),
    stats: sanitizeStats(input.stats, warnings),
    recoveryRolls: sanitizeRecoveryRolls(input.recoveryRolls, warnings),
    damageTrack: sanitizeDamageTrack(input.damageTrack, warnings),
    textFields: sanitizeTextFields(input.textFields, warnings),
    cyphers: sanitizeArrayField(input, "cyphers", warnings),
    artifacts: sanitizeArrayField(input, "artifacts", warnings),
    oddities: sanitizeArrayField(input, "oddities", warnings, "string"),
    abilities: sanitizeArrayField(input, "abilities", warnings),
    equipment: sanitizeArrayField(input, "equipment", warnings),
    attacks: sanitizeArrayField(input, "attacks", warnings),
    specialAbilities: sanitizeArrayField(input, "specialAbilities", warnings),
  };

  // Copy portrait if present and valid
  if (typeof input.portrait === "string") {
    (character as unknown as Record<string, unknown>).portrait = input.portrait;
  }

  return { character, warnings };
}
