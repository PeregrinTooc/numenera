import type { Character } from "@/types/character";
import { detectChanges } from "@/utils/changeDetection";
import { joinDescriptionKeys } from "./versionDescriptionText.js";

/**
 * The stored description of a version-history entry: detectChanges' i18n keys,
 * translated when shown (see versionDescriptionText). Shared by live version
 * buffering, reconciliation and the description migration.
 */
export function describeCharacterChange(before: Character, after: Character): string {
  const changeKeys = detectChanges(before, after);
  return changeKeys.length > 0 ? joinDescriptionKeys(changeKeys) : "versionHistory.changes.generic";
}
