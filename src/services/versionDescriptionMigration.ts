import type { CharacterVersion } from "@/types/versionHistory";
import type { VersionHistoryManager } from "@/storage/versionHistory";
import { sanitizeCharacter } from "@/utils/characterSanitizer";
import { describeCharacterChange } from "./versionDescriptions.js";

// The raw literal stored data may still carry, not the versionHistory.changes.generic i18n key.
const LEGACY_DESCRIPTION = "Updated character";

/**
 * Backfills stored descriptions that still carry the "Updated character"
 * literal. Each stored version keeps a full character snapshot (everything but
 * the portrait), so the description is recomputed from the diff against the
 * previous version's snapshot.
 *
 * Safe to call on every app boot: it only touches versions whose description
 * still contains the literal, with no version marker to gate it.
 *
 * A stored description can be a compound string (e.g. "Changed name, Updated
 * character") from squashDescriptions(), so matching is per comma-separated
 * segment. The whole description is recomputed rather than patching the
 * segment: a squash may have deduped distinct card operations into a single
 * literal, which only the full diff recovers.
 */
export async function migrateLegacyVersionDescriptions(
  versionHistory: VersionHistoryManager,
  versions: CharacterVersion[]
): Promise<void> {
  for (let i = 1; i < versions.length; i++) {
    const version = versions[i];
    if (!version.description.split(", ").includes(LEGACY_DESCRIPTION)) {
      continue;
    }

    // Stored snapshots can predate later Character shape changes (e.g. the
    // xp -> currentXp/totalXp split), so sanitize rather than trust the shape.
    const { character: prev } = sanitizeCharacter(versions[i - 1].character);
    const { character: curr } = sanitizeCharacter(version.character);
    const newDescription = describeCharacterChange(prev, curr);

    if (newDescription !== version.description) {
      await versionHistory.updateVersionDescription(version.id, newDescription);
    }
  }
}
