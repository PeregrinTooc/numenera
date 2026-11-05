import type { CharacterDiff } from "@/utils/characterDiff";
import {
  BASIC_INFO_FIELDS,
  COLLECTION_KEYS,
  RESOURCE_FIELDS,
  STAT_NAMES,
  TEXT_FIELDS,
} from "@/utils/characterFieldGroups";
import { t } from "@/i18n/index";

const PREFIX = "versionHistory.changes";

/**
 * Translates a CharacterDiff into the uncapped list of change lines shown in
 * Comparison View's header. Deliberately does not cap at 3 or combine same-
 * category changes the way versionDescriptions.ts / detectChanges do for the
 * single-pane version-history description - the header here is meant to
 * narrate exactly what the colour highlighting shows, so nothing is trimmed.
 * Reuses the existing versionHistory.changes.* leaf keys (same wording
 * already shown elsewhere) rather than duplicating translations.
 */
export function describeDiff(diff: CharacterDiff): string[] {
  const lines: string[] = [];

  for (const field of BASIC_INFO_FIELDS) {
    if (diff.basicInfo[field]) lines.push(t(`${PREFIX}.basicInfo.${field}`));
  }
  for (const stat of STAT_NAMES) {
    if (diff.stats[stat]) lines.push(t(`${PREFIX}.stats.${stat}`));
  }
  for (const { key } of RESOURCE_FIELDS) {
    if (diff.resources[key]) lines.push(t(`${PREFIX}.resources.${key}`));
  }
  for (const field of TEXT_FIELDS) {
    if (diff.textFields[field]) lines.push(t(`${PREFIX}.textFields.${field}`));
  }

  for (const { key, i18nKey } of COLLECTION_KEYS) {
    const collectionDiff = diff.collections[key];
    const hasAdded = collectionDiff.right.some((entry) => entry.status === "added");
    const hasRemoved = collectionDiff.left.some((entry) => entry.status === "removed");
    const hasModified = collectionDiff.left.some((entry) => entry.status === "modified");

    if (hasAdded) lines.push(t(`${PREFIX}.collections.${i18nKey}.added`));
    if (hasRemoved) lines.push(t(`${PREFIX}.collections.${i18nKey}.removed`));
    if (hasModified) lines.push(t(`${PREFIX}.collections.${i18nKey}.modified`));
  }

  return lines;
}
