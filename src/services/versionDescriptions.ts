import type { Character } from "@/types/character";
import { detectChanges } from "@/utils/changeDetection";
import { t } from "@/i18n/index";

/**
 * Translates detectChanges' i18n keys into the description text of a
 * version-history entry. Kept apart from changeDetection.ts so that stays
 * dependency-free (no i18n import). Shared by live version buffering and the
 * description migration, so both compute descriptions identically.
 */
export function describeCharacterChange(before: Character, after: Character): string {
  const changeKeys = detectChanges(before, after);
  return changeKeys.length > 0
    ? changeKeys.map((key) => t(key)).join(", ")
    : t("versionHistory.changes.generic");
}
