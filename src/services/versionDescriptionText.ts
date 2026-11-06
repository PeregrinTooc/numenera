import { hasTranslation, t } from "@/i18n/index";

/**
 * A stored version description is a ", "-joined list of i18n keys, translated
 * only when shown, so history follows the current language. A segment that is
 * not a key (data saved before keys were stored) is shown as it was stored.
 */
export const DESCRIPTION_SEPARATOR = ", ";
const RESTORED_KEY = "versionHistory.changes.restored";
const RESTORED_PREFIX = `${RESTORED_KEY}: `;

export function joinDescriptionKeys(keys: string[]): string {
  return keys.join(DESCRIPTION_SEPARATOR);
}

export function restoredDescription(description: string): string {
  return `${RESTORED_PREFIX}${description}`;
}

export function versionDescriptionText(stored: string): string {
  if (stored.startsWith(RESTORED_PREFIX)) {
    const restored = versionDescriptionText(stored.slice(RESTORED_PREFIX.length));
    return t(RESTORED_KEY, { description: restored });
  }
  return stored
    .split(DESCRIPTION_SEPARATOR)
    .map((segment) => (hasTranslation(segment) ? t(segment) : segment))
    .join(DESCRIPTION_SEPARATOR);
}
