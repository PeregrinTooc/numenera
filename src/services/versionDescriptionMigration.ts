import type { CharacterVersion } from "@/types/versionHistory";
import type { VersionHistoryManager } from "@/storage/versionHistory";
import { sanitizeCharacter } from "@/utils/characterSanitizer";
import en from "@/i18n/locales/en.json";
import de from "@/i18n/locales/de.json";
import { describeCharacterChange } from "./versionDescriptions.js";
import {
  DESCRIPTION_SEPARATOR,
  joinDescriptionKeys,
  restoredDescription,
} from "./versionDescriptionText.js";

const PREFIX = "versionHistory.changes";

// Text that descriptions were stored as before they became keys.
const LEGACY_GENERIC = "Updated character";
const LEGACY_RESTORED_PREFIX = "Restored: ";
const LEGACY_FIELD_LABELS: Record<string, string> = {
  "Changed current XP": `${PREFIX}.resources.xp`,
  "Changed total XP": `${PREFIX}.resources.xp`,
  "Changed shins": `${PREFIX}.resources.shins`,
  "Changed armor": `${PREFIX}.resources.armor`,
  "Changed max cyphers": `${PREFIX}.resources.maxCyphers`,
  "Changed effort": `${PREFIX}.resources.effort`,
  "Changed Might pool": `${PREFIX}.stats.might`,
  "Changed Might edge": `${PREFIX}.stats.might`,
  "Changed current Might": `${PREFIX}.stats.might`,
  "Changed Speed pool": `${PREFIX}.stats.speed`,
  "Changed Speed edge": `${PREFIX}.stats.speed`,
  "Changed current Speed": `${PREFIX}.stats.speed`,
  "Changed Intellect pool": `${PREFIX}.stats.intellect`,
  "Changed Intellect edge": `${PREFIX}.stats.intellect`,
  "Changed current Intellect": `${PREFIX}.stats.intellect`,
};

/** Each translation under `tree`, in every language, mapped to its key. */
function keysByText(tree: unknown, path: string, into: Map<string, string>): Map<string, string> {
  if (typeof tree === "string") {
    into.set(tree, path);
  } else if (typeof tree === "object" && tree !== null) {
    for (const [key, value] of Object.entries(tree)) keysByText(value, `${path}.${key}`, into);
  }
  return into;
}

const KEY_BY_TEXT = new Map<string, string>(Object.entries(LEGACY_FIELD_LABELS));
keysByText(en.versionHistory.changes, PREFIX, KEY_BY_TEXT);
keysByText(de.versionHistory.changes, PREFIX, KEY_BY_TEXT);

/** Stored text as keys; text that is not a known translation stays as it is. */
function textToKeys(description: string): string {
  if (description.startsWith(LEGACY_RESTORED_PREFIX)) {
    return restoredDescription(textToKeys(description.slice(LEGACY_RESTORED_PREFIX.length)));
  }
  return joinDescriptionKeys(
    description.split(DESCRIPTION_SEPARATOR).map((segment) => KEY_BY_TEXT.get(segment) ?? segment)
  );
}

/**
 * The description from the diff against the previous version's snapshot, for
 * a description that still carries the uninformative "Updated character"
 * literal. A squash may have deduped distinct card operations into that one
 * literal, which only the full diff recovers. Snapshots can predate later
 * Character shape changes (e.g. the xp -> currentXp/totalXp split), so they
 * are sanitized rather than trusted.
 */
function recomputedDescription(previous: CharacterVersion, version: CharacterVersion): string {
  const { character: prev } = sanitizeCharacter(previous.character);
  const { character: curr } = sanitizeCharacter(version.character);
  return describeCharacterChange(prev, curr);
}

/**
 * Rewrites stored descriptions saved as text, in English or German, as i18n
 * keys. Safe to call on every app boot: descriptions already stored as keys
 * come out unchanged and are not written.
 */
export async function migrateLegacyVersionDescriptions(
  versionHistory: VersionHistoryManager,
  versions: CharacterVersion[]
): Promise<void> {
  for (let i = 0; i < versions.length; i++) {
    const version = versions[i];
    const isLegacyGeneric =
      i > 0 && version.description.split(DESCRIPTION_SEPARATOR).includes(LEGACY_GENERIC);
    const newDescription = isLegacyGeneric
      ? recomputedDescription(versions[i - 1], version)
      : textToKeys(version.description);

    if (newDescription !== version.description) {
      await versionHistory.updateVersionDescription(version.id, newDescription);
    }
  }
}
