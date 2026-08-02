# XP Badge: Current XP vs Total XP

Date: 2026-08-02
Status: Approved

## Problem

The XP badge on `BasicInfo` shows one number (`Character.xp`). Numenera
distinguishes between XP a character has available to spend and the
lifetime total they've earned (some of which has already been spent on
advancement). The sheet needs to track and display both.

## Scope

In scope:

- Track two numbers: XP not yet spent ("current") and lifetime XP earned
  ("total", includes spent XP).
- Both independently editable via the existing single-field edit modal
  infrastructure.
- Migrate existing saved/exported characters that only have `xp`.

Out of scope (explicitly not building):

- Any XP-spending mechanic or UI (e.g. a "spend to level up" action).
- Any automatic arithmetic linking the two values (editing one never
  changes the other).
- Any cross-field validation between them (e.g. total >= current is not
  enforced) — consistent with how `StatPool`'s Pool/Edge/Current aren't
  cross-validated today.
- A tier-up cost calculator or any other Numenera advancement rules logic.

## Data model

`src/types/character.ts`: replace

```ts
xp: number;
```

with

```ts
currentXp: number;
totalXp: number;
```

Flat fields (not a nested `{ current, total }` object) — XP isn't reused
across three stats the way `StatPool` is, so a shared type isn't
warranted. This matches how `shins`/`armor`/`effort` are flat top-level
numbers.

## Back-compat / migration

`sanitizeCharacter` (`src/utils/unified-validation.ts`) currently does:

```ts
xp: sanitizeNumber(input, "xp", CHARACTER_DEFAULTS.xp, warnings, 0),
```

New behavior: read `currentXp`/`totalXp` if present; otherwise, if a
legacy `xp` field is present, use it for both:

```ts
currentXp: input.currentXp !== undefined
  ? sanitizeNumber(input, "currentXp", CHARACTER_DEFAULTS.currentXp, warnings, 0)
  : sanitizeNumber(input, "xp", CHARACTER_DEFAULTS.currentXp, warnings, 0),
totalXp: input.totalXp !== undefined
  ? sanitizeNumber(input, "totalXp", CHARACTER_DEFAULTS.totalXp, warnings, 0)
  : sanitizeNumber(input, "xp", CHARACTER_DEFAULTS.totalXp, warnings, 0),
```

(Exact implementation may differ, but the outcome must be: old exports
with only `xp` produce `currentXp === totalXp === xp`; new exports with
`currentXp`/`totalXp` are read directly and never fall back to `xp`.)

`CHARACTER_DEFAULTS`, `mockCharacters.ts` (`FULL_CHARACTER`, `NEW_CHARACTER`),
and `validateCharacter`'s required-field check all switch from `xp` to
`currentXp`/`totalXp`.

## UI

`BasicInfo.ts`'s `.xp-badge` (currently the shared circular `.stat-badge`
style also used by Shins/Effort/Armor) becomes its own small rectangular
badge with two side-by-side columns, "Current" and "Total", each an
independent click target — same interaction model as `StatPool`'s
Pool/Edge/Current cells. New CSS lives alongside the existing
`.xp-badge` rule in `src/styles/components/stat-badge.css` (or split into
its own file if that file's header comment ends up misleading). Shins/
Effort/Armor circular badges are untouched.

`data-testid`s: outer container keeps `xp-badge`; the two cells get
`xp-badge-current` and `xp-badge-total`.

## Field wiring

- `unified-validation.ts`: `FieldType` gains `"currentXp" | "totalXp"`
  (remove `"xp"`). `FIELD_CONFIGS` gets both, same numeric config as
  today's `xp` entry (`inputType: "number"`, `inputMode: "numeric"`,
  `min: 0`, `max: 9999`).
- `characterFieldUpdate.ts`: `applyFieldUpdate` gets `"currentXp"` and
  `"totalXp"` cases (replacing the single `"xp"` case).
  `FIELD_LABELS` gets `"Changed current XP"` / `"Changed total XP"`
  (replacing `"Changed XP"`).
- `changeDetection.ts`: `detectResourceChanges` replaces the single
  `oldChar.xp !== newChar.xp` check with an OR over `currentXp` and
  `totalXp`, still pushing one combined `"Updated XP"` change (matches
  how Might/Speed/Intellect push one combined message for three
  sub-fields).
- `BasicInfo.ts`: `FieldType` (component-local) gains `"currentXp"` and
  `"totalXp"`, drops `"xp"`. `openEditModal` reads `character.currentXp`
  / `character.totalXp` accordingly.

## i18n

New keys in `src/i18n/locales/en.json` and `de.json` under `character`:

- `xpCurrent`: "Current" / "Aktuell"
- `xpTotal`: "Total" / "Gesamt"

New aria-labels for the two click targets use `t()` (e.g.
`character.editCurrentXp` / `character.editTotalXp`), not hardcoded
strings — following this file's existing partial precedent
(`character.type.label`, `character.portraitView` already use `t()`)
rather than the hardcoded aria-labels also present in the same file.

The existing `character.xp` key ("XP") is kept for use as the badge's
overall heading/label if the layout wants one; `resourceTracker.xp` is
unrelated (different feature) and untouched.

## Testing plan

- BDD: new scenario(s) added to
  `tests/e2e/features/basic-info-editing.feature` (or
  `character-display.feature`, whichever already owns XP-badge
  scenarios) covering: badge displays both current and total XP;
  editing current XP doesn't change total XP and vice versa; a
  character imported from a legacy export (single `xp` field) shows
  the same value for both.
- Unit: `tests/unit/basicInfo.test.ts`'s existing "should render XP as
  editable badge" test is rewritten (TDD: red first) for the two-value
  badge. `tests/unit/characterFieldUpdate.test.ts`,
  `tests/unit/characterValidation.test.ts`, and
  `tests/unit/editFieldValidation.test.ts` get equivalent updates
  wherever they reference `xp`.
- Any other test/mock referencing `Character.xp` (grep confirms
  `mockCharacters.ts`, `testHelpers.ts`, `characterValidation.test.ts`,
  `fieldValidation.test.ts` among others) is updated to the new fields
  as part of implementation — TDD, one test at a time (Rule 10).

## Version history compatibility

Version history snapshots are persisted in IndexedDB (`versionHistory.ts`,
`saveToDb`) and survive across app upgrades — this is a real migration
path, not just file import. `VersionState.navigateToVersion`
(`src/services/versionState.ts:96`) currently does a raw
`version.character as Character` cast with no sanitization. Old
snapshots saved before this change only have `xp`, so navigating back
to them today would leave `currentXp`/`totalXp` `undefined`.

Fix: `navigateToVersion` runs the loaded snapshot through
`sanitizeCharacter(...).character` before use (same function already
used for file import), so the same `xp` → `currentXp`/`totalXp`
migration applies uniformly whether the legacy data comes from a file
import or from version history. Discard the warnings return value here
(no user-facing warning UI exists for this path today, consistent with
how the rest of `navigateToVersion` already silently trusts stored
data).

## Risks / notes

- This is a breaking change to the `Character` shape. Any character
  JSON exported before this change, and any version-history snapshot
  saved before this change, must still load cleanly via the migration
  above.
