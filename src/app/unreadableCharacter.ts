import { isCompleteCharacter, isRecord } from "@/utils/typeGuards";
import { sanitizeCharacter } from "@/utils/characterSanitizer";

/** What the user can do with a kept copy of unreadable data. */
export interface UnreadableChoiceHandlers {
  onDownload: () => void;
  onDiscard: () => void;
  onLater: () => void;
}

export interface KeepUnreadableDeps {
  saveBackup: (raw: unknown) => Promise<void>;
  /** Replaces the stored value with the default character so it is not detected again. */
  persistDefault: () => Promise<void>;
  warn: (message: string, raw: unknown) => void;
}

export interface OfferUnreadableDeps {
  loadBackup: () => Promise<unknown>;
  deleteBackup: () => Promise<void>;
  download: (filename: string, content: string) => void;
  showChoice: (handlers: UnreadableChoiceHandlers) => void;
  now: () => Date;
}

/**
 * True when stored data cannot be shown as a character: it is not an object at
 * all (e.g. text that is not valid JSON), or not even sanitizable into a
 * complete character. Merely incomplete characters are repaired by the
 * sanitizer and are not unreadable.
 */
export function isUnreadableCharacter(raw: unknown): boolean {
  if (raw === null || raw === undefined) return false;
  if (!isRecord(raw)) return true;
  return !isCompleteCharacter(sanitizeCharacter(raw).character);
}

/** The data exactly as it was stored: text stays text, objects become JSON. */
export function serializeUnreadable(raw: unknown): string {
  return typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
}

export function unreadableFilename(date: Date): string {
  return `numenera-unreadable-character-${date.toISOString().slice(0, 10)}.json`;
}

/**
 * Copies unreadable stored data to the backup record, then replaces the stored
 * value with the default character. The replacement only happens once the copy
 * is safe, so the data is never the only thing standing between the user and loss.
 *
 * @returns true when the copy was kept
 */
export async function keepUnreadableCharacter(
  raw: unknown,
  deps: KeepUnreadableDeps
): Promise<boolean> {
  deps.warn("Stored character data is unreadable, using default character", raw);
  try {
    await deps.saveBackup(raw);
  } catch (error) {
    deps.warn("Could not keep a copy of the unreadable character; leaving it stored", error);
    return false;
  }
  await deps.persistDefault();
  return true;
}

/**
 * Asks the user what to do when a kept unreadable copy exists. Download and
 * Discard remove the copy; Ask me later (and closing the dialog) keeps it.
 */
export async function offerUnreadableBackup(deps: OfferUnreadableDeps): Promise<void> {
  const backup = await deps.loadBackup();
  if (backup === null || backup === undefined) return;

  deps.showChoice({
    onDownload: () => {
      deps.download(unreadableFilename(deps.now()), serializeUnreadable(backup));
      void deps.deleteBackup();
    },
    onDiscard: () => {
      void deps.deleteBackup();
    },
    onLater: () => {},
  });
}
