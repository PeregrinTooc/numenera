import type { CharacterDiff } from "../utils/characterDiff.js";
import { t } from "../i18n/index.js";

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

  if (diff.basicInfo.name) lines.push(t("versionHistory.changes.basicInfo.name"));
  if (diff.basicInfo.tier) lines.push(t("versionHistory.changes.basicInfo.tier"));
  if (diff.basicInfo.type) lines.push(t("versionHistory.changes.basicInfo.type"));
  if (diff.basicInfo.descriptor) lines.push(t("versionHistory.changes.basicInfo.descriptor"));
  if (diff.basicInfo.focus) lines.push(t("versionHistory.changes.basicInfo.focus"));

  if (diff.stats.might) lines.push(t("versionHistory.changes.stats.might"));
  if (diff.stats.speed) lines.push(t("versionHistory.changes.stats.speed"));
  if (diff.stats.intellect) lines.push(t("versionHistory.changes.stats.intellect"));

  if (diff.resources.xp) lines.push(t("versionHistory.changes.resources.xp"));
  if (diff.resources.shins) lines.push(t("versionHistory.changes.resources.shins"));
  if (diff.resources.armor) lines.push(t("versionHistory.changes.resources.armor"));
  if (diff.resources.effort) lines.push(t("versionHistory.changes.resources.effort"));
  if (diff.resources.maxCyphers) lines.push(t("versionHistory.changes.resources.maxCyphers"));

  if (diff.textFields.background) lines.push(t("versionHistory.changes.textFields.background"));
  if (diff.textFields.notes) lines.push(t("versionHistory.changes.textFields.notes"));

  const collectionTypes: Array<{
    diff: CharacterDiff["collections"][keyof CharacterDiff["collections"]];
    key: string;
  }> = [
    { diff: diff.collections.cyphers, key: "cypher" },
    { diff: diff.collections.artifacts, key: "artifact" },
    { diff: diff.collections.equipment, key: "equipment" },
    { diff: diff.collections.attacks, key: "attack" },
    { diff: diff.collections.abilities, key: "ability" },
    { diff: diff.collections.specialAbilities, key: "specialAbility" },
    { diff: diff.collections.oddities, key: "oddity" },
  ];

  for (const { diff: collectionDiff, key } of collectionTypes) {
    const hasAdded = collectionDiff.right.some((entry) => entry.status === "added");
    const hasRemoved = collectionDiff.left.some((entry) => entry.status === "removed");
    const hasModified = collectionDiff.left.some((entry) => entry.status === "modified");

    if (hasAdded) lines.push(t(`versionHistory.changes.collections.${key}.added`));
    if (hasRemoved) lines.push(t(`versionHistory.changes.collections.${key}.removed`));
    if (hasModified) lines.push(t(`versionHistory.changes.collections.${key}.modified`));
  }

  return lines;
}
