# Current Feature: Wire Up `detectChanges` for Meaningful Version Descriptions

## Overview

`src/utils/changeDetection.ts` (184 lines, unit-tested) computes a
human-readable description of what changed between two character versions
(e.g. "Changed name", "Updated might", "Added cypher") but has no callers.
Card/collection edits (add/remove/modify a cypher, ability, artifact, etc.)
all funnel through `handleCharacterUpdated` in `src/main.ts`, which buffers
every change with the hardcoded literal `"Updated character"` regardless of
what actually changed. Direct field edits (name, tier, stats, ...) already
get a specific label from `applyFieldUpdate`'s `FIELD_LABELS` map, so this
feature is scoped to the collection/card path. See `docs/PROJECT_REVIEW.md`
§3 and `docs/IMPLEMENTATION_PLAN.md` Phase 4 for the original defect
writeup.

## Goals

- Call `detectChanges(oldCharacter, newCharacter)` from the
  `handleCharacterUpdated` buffering path in `src/main.ts` instead of the
  hardcoded `"Updated character"` fallback, so card/collection edits get a
  specific description ("Added cypher", "Removed ability", ...).
- Translate `detectChanges`'s hardcoded English strings into i18n keys per
  Rule #4, present in both `en.json` and `de.json`.
- Decide how per-item collection changes read in German.

## Architecture

**`detectChanges` returns i18n key strings, not display text.** It stays a
pure, dependency-free util (no `t()` import, still trivially unit-testable
with plain string assertions on the key names). The call site in
`src/main.ts` — the only place that needs actual UI text — maps each
returned key through `t()` before handing the resolved string to
`service.bufferChange()`. This mirrors the existing `FIELD_LABELS` /
`applyFieldUpdate` pattern (resolve once, store the resolved text as the
version's `description`), so no change to `VersionHistoryService`,
`VersionWarningBanner`, or the storage schema is needed — `description`
stays a plain string end to end. `squashDescriptions` needs no changes; it
joins/dedupes strings regardless of where they came from.

**German pluralization/gender decision:** rather than interpolating an item
name into a shared template (`"Added {{item}}"`), each action+item-type
pair gets its own fully-authored compound key (`versionHistory.changes
.collections.cypher.added`, `...cypher.removed`, `...cypher.modified`, one
set per collection type). This sidesteps German gendering/pluralization
entirely — each language authors its own natural phrasing per key, no
string concatenation, no parameterization logic needed. ~40 keys total
(5 basic-info + 1 combined, 3 stats + 1 combined, 5 resources + 1 combined,
7 collections × 3 actions = 21, 2 text fields + 1 combined).

**Key namespace:** `versionHistory.changes.*`, mirroring the existing
`versionHistory.*` namespace already used by `VersionNavigator` /
`VersionWarningBanner`.

| `detectChanges` internal category           | Key                                                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `Changed name`                              | `versionHistory.changes.basicInfo.name`                                                                                        |
| `Changed tier`                              | `versionHistory.changes.basicInfo.tier`                                                                                        |
| `Changed type`                              | `versionHistory.changes.basicInfo.type`                                                                                        |
| `Changed descriptor`                        | `versionHistory.changes.basicInfo.descriptor`                                                                                  |
| `Changed focus`                             | `versionHistory.changes.basicInfo.focus`                                                                                       |
| `Edited basic info` (combined)              | `versionHistory.changes.basicInfo.combined`                                                                                    |
| `Updated might/speed/intellect`             | `versionHistory.changes.stats.{might,speed,intellect}`                                                                         |
| `Updated stats` (combined)                  | `versionHistory.changes.stats.combined`                                                                                        |
| `Updated XP/shins/armor/effort/max cyphers` | `versionHistory.changes.resources.{xp,shins,armor,effort,maxCyphers}`                                                          |
| `Updated resources` (combined)              | `versionHistory.changes.resources.combined`                                                                                    |
| `Added/Removed/Modified <item>`             | `versionHistory.changes.collections.{cypher,artifact,equipment,attack,ability,specialAbility,oddity}.{added,removed,modified}` |
| `Updated background/notes`                  | `versionHistory.changes.textFields.{background,notes}`                                                                         |
| `Updated text fields` (combined)            | `versionHistory.changes.textFields.combined`                                                                                   |

## Implementation Steps

1. **BDD**: add new scenarios to `tests/e2e/features/version-history.feature`
   covering card add/remove/modify descriptions, a mixed-category squash
   window, and German rendering. _(this step — done below)_
2. **TDD, `changeDetection.ts`**: change every category function to return
   key strings (`versionHistory.changes.basicInfo.name` etc.) instead of
   English literals; update the combining logic's return values to the
   `.combined` keys. Update `tests/unit/changeDetection.test.ts` assertions
   to match (red → green, one function at a time: basic info, stats,
   resources, collections, text fields, then the combining logic).
3. Add all ~40 keys to `en.json` and `de.json` under `versionHistory.changes`.
4. **`src/main.ts`, `handleCharacterUpdated`**: replace
   `service.bufferChange(currentCharacter, "Updated character")` with a call
   to `detectChanges(characterBeforeUpdate, currentCharacter)`, map each
   returned key through `t()`, join with the same style `squashDescriptions`
   uses (`.join(", ")`) if more than one key comes back from a single event,
   and pass the resolved string to `bufferChange`. Handle the empty-array
   case (no detected change) by keeping today's fallback text so a
   card-refresh-only event never buffers a blank description.
5. Run the new E2E scenarios to green; run the full suite before commit
   (Rule #8).

## Unit Tests

`tests/unit/changeDetection.test.ts` — update existing assertions from
English literals to key strings; no new test _cases_ needed since the
detection logic itself doesn't change, only its output values.

## Edge Cases

- A `character-updated` event that doesn't actually change the character
  (re-render only) — `detectChanges` already returns `[]` for this; the
  main.ts call site must not buffer an empty/blank description.
- Multiple different collection types changed within one buffered event —
  `detectChanges` already caps at 3 and doesn't combine collections, so up
  to 3 keys come back; all must be translated and joined.
- Language switched mid-session — only affects descriptions generated
  _after_ the switch (existing versions keep the text resolved at the time
  they were created, matching current `FIELD_LABELS` behavior).

## Success Criteria

- Card add/remove/modify each produce a specific, correct description
  instead of "Updated character".
- All `detectChanges` output keys exist in both `en.json` and `de.json`;
  `npm run check:i18n` passes.
- New and existing E2E scenarios in `version-history.feature` pass in both
  languages.
- `npm run test:unit`, `npm run test:e2e:prod`, and `npm run lint` all pass.

## E2E Tests

File: `tests/e2e/features/version-history.feature` (new scenarios added
under "Meaningful Version Descriptions").
