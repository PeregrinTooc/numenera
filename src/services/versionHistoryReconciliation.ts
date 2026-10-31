import type { Character } from "@/types/character";
import type { VersionHistoryManager } from "@/storage/versionHistory";
import { generateETag } from "@/utils/etag";
import { sanitizeCharacter } from "@/utils/characterSanitizer";
import { describeCharacterChange } from "@/services/versionDescriptions";

/**
 * Rebuilds a version-history squash that was lost when the page closed.
 *
 * Edits are buffered for a few seconds before VersionHistoryService squashes
 * them into one version. An unload inside that window cannot reliably write
 * the version: the squash awaits several IndexedDB and crypto steps, and
 * WebKit tears the page down first. The auto-save, however, is flushed on
 * unload with a single eagerly committed write, so the stored character
 * always holds the latest edit. Comparing it against the latest version on
 * boot recovers exactly what the unload dropped, on every browser — which is
 * why there is no unload flush of the version buffer at all.
 *
 * Safe to call on every app boot: a no-op when the stored character matches
 * the latest version. An empty history is left to the initial-state path.
 */
export async function reconcileVersionHistory(
  versionHistory: VersionHistoryManager,
  character: Character
): Promise<void> {
  const versions = await versionHistory.getAllVersions();
  const latest = versions[versions.length - 1];
  if (!latest || latest.etag === (await generateETag(character))) {
    return;
  }

  const { character: previous } = sanitizeCharacter(latest.character);
  await versionHistory.saveVersion(character, describeCharacterChange(previous, character));
}
