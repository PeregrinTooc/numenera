import type { Character } from "../types/character.js";
import { detectChanges } from "../utils/changeDetection.js";
import { t } from "../i18n/index.js";

/**
 * Translates detectChanges' i18n key output into the final description text
 * used for a version-history entry. Kept separate from changeDetection.ts,
 * which is deliberately dependency-free (no i18n import) so it stays a pure,
 * easily unit-testable util — this is the one place that resolves those keys
 * with t(), shared by both live version buffering (main.ts) and the legacy
 * description migration, so both compute descriptions identically.
 */
export function describeCharacterChange(before: Character, after: Character): string {
  const changeKeys = detectChanges(before, after);
  return changeKeys.length > 0
    ? changeKeys.map((key) => t(key)).join(", ")
    : t("versionHistory.changes.generic");
}
