import type { CharacterVersion } from "../types/versionHistory.js";
import type { VersionHistoryManager } from "../storage/versionHistory.js";
import { sanitizeCharacter } from "../utils/unified-validation.js";
import { describeCharacterChange } from "./versionDescriptions.js";

// Pre-fix raw literal used by the old hardcoded "Updated character" fallback
// (see the description below) — not the new versionHistory.changes.generic
// i18n key. This is what OLD stored data looks like, not what new data
// produces.
const LEGACY_DESCRIPTION = "Updated character";

/**
 * One-time-per-version backfill for stored descriptions that still carry the
 * old hardcoded "Updated character" literal from before detectChanges was
 * wired up (see docs/FEATURES.md, Version History). Each stored version
 * keeps a full character snapshot (everything but the portrait), so the
 * diff that should have produced a specific description is still
 * reconstructable from the previous version's snapshot.
 *
 * Safe to call on every app boot: it only does work for versions whose
 * description still contains the legacy literal, so it's a no-op once
 * everything's been migrated — the same lazy, structural-detection idea as
 * sanitizeCharacter's legacy-field handling, rather than a one-time
 * destructive migration gated by a version marker.
 *
 * A stored description can be a compound string (e.g.
 * "Changed name, Updated character") produced by squashDescriptions()
 * combining several buffered changes, so matching is done per
 * comma-separated segment rather than exact equality. When matched, the
 * whole description is recomputed from the snapshot diff rather than just
 * patching the legacy segment — detectChanges independently rediscovers
 * every change between the two snapshots, including cases where distinct
 * card operations were deduped into a single legacy-literal occurrence
 * before this fix, so a full recompute is strictly more accurate than any
 * partial patch.
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

    // Snapshots are persisted in IndexedDB and can predate later Character
    // shape changes (e.g. the xp -> currentXp/totalXp split), so sanitize on
    // the way in rather than trusting the raw stored shape — same precedent
    // as VersionState.navigateToVersion.
    const { character: prev } = sanitizeCharacter(versions[i - 1].character);
    const { character: curr } = sanitizeCharacter(version.character);
    const newDescription = describeCharacterChange(prev, curr);

    if (newDescription !== version.description) {
      await versionHistory.updateVersionDescription(version.id, newDescription);
    }
  }
}
