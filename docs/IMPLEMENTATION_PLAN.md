# Implementation Plan — Addressing the July 2026 Review

Companion to `docs/PROJECT_REVIEW.md`. Each item states the defect, the change,
how to prove it, and what it depends on.

Work top to bottom. The phases are ordered so that later verification is
trustworthy: the test suite cannot isolate scenarios until Phase 0 lands, so
fixing it first makes every subsequent phase's evidence meaningful.

Every item follows the project's own rules: a Gherkin scenario or unit test comes
first (Rules #2, #3), one test at a time (Rule #10), and the work is presented
before commit (Rule #1).

---

## Phase 0 — Make the test suite trustworthy

Nothing else can be verified with confidence until this is done.

### 0.1 Fix the IndexedDB names used by test cleanup

**Defect:** §2.11. `tests/e2e/support/hooks.ts:110` and `src/main.ts:776,799`
target `NumeneraCharacterDB`. The real databases are `numenera-character-db` and
`numenera-version-history-db`, so cleanup deletes nothing and character state and
version history leak between scenarios.

**Change**

- Export the database names as constants from `src/storage/storageConstants.ts`
  and import them in `indexedDBStorageImpl.ts`, `versionHistory.ts` and the test
  helpers, so the names can never drift apart again.
- `window.__testStorage.clearCharacterState` should call the adapter's `clear()`
  through `storageFactory` rather than deleting a database by name.
- `window.__testVersionHistory.clearVersions` should call
  `VersionHistoryManager.clear()`, which already exists, instead of hand-rolling
  a transaction against a hardcoded name.
- Update the `Before` hook to delete both real databases.

**Verify:** add a scenario that creates a cypher, then asserts in a following
scenario that the sheet starts empty. It must fail before the fix.

**Risk:** low. May expose scenarios that were passing only because of leaked
state — that is the point, and any such failure is a real defect to log.

### 0.2 Raise the Cucumber step timeout

**Defect:** §2.11. `cucumber.cjs:10` sets `timeout: 300` — 300 ms per step.

**Change:** raise to `15000`. Correct the `failFast: false // Stop on first
failure` comment, which contradicts its value.

**Verify:** the suite still passes and stops needing the `waitForTimeout` calls
added in `885cf75`, `b175258` and `e299f56`. Remove those once green.

### 0.3 Make the E2E browser resolvable

**Defect:** the pre-push hook and `npm run test:e2e:*` fail outright in any
environment that cannot download Playwright's pinned browser build.

**Change:** honour an optional `PW_EXEC_PATH` environment variable in
`tests/e2e/support/hooks.ts` when launching Chromium. Unset in CI and for normal
local use, so default behaviour is unchanged.

**Verify:** `PW_EXEC_PATH=/path/to/chromium npm run test:e2e:all` runs the suite;
without it, behaviour is exactly as today.

---

## Phase 1 — Data loss and corruption

### 1.1 Route all persistence through the storage factory

**Defect:** §2.2 (verified). Three modules write straight to localStorage, and
`migrateFromLocalStorage()` replays that stale copy over IndexedDB on the next
load, reverting every edit made after the last card operation.

**Change**

- In `CollectionBehavior.ts`, `BasicInfo.ts` and `RecoveryDamageSection.ts`,
  replace `import { saveCharacterState } from "../storage/localStorage.js"` with
  the `storageFactory` equivalent. The factory's function is `async`; these call
  sites currently ignore the return value, so either `await` it or attach a
  `.catch()` — do not leave an unhandled rejection.
- Make `migrateFromLocalStorage()` run **once**, not on every load: it should
  no-op when the IndexedDB record already exists, and only adopt the localStorage
  copy when IndexedDB is genuinely empty.
- Consider deleting `src/storage/localStorage.ts` entirely once nothing imports
  it, so the trap cannot be re-entered. `LocalStorageImpl` is the real fallback
  and is unaffected.

**Verify:** the probe from the review, promoted to a unit test —

```ts
saveToLocalStorage({ name: "Hero", xp: 5 });
await idb.save({ name: "Hero", xp: 50 });
await idb.migrateFromLocalStorage();
expect((await idb.load()).xp).toBe(50);
```

Plus an E2E scenario: add a cypher, edit XP, reload, assert XP survived.

**Depends on:** 0.1 (the scenario needs real isolation).

### 1.2 Preserve oddities on import

**Defect:** §2.3 (verified). `sanitizeArrayField` drops non-object array items,
and `Character.oddities` is `string[]`, so every import wipes them.

**Change:** give `sanitizeArrayField` an expected item kind, or add a dedicated
`sanitizeStringArray` for oddities. Keep the warning behaviour for items that are
genuinely the wrong type.

**Verify:** unit test — sanitising a character with two string oddities returns
both and produces no warnings. Extend
`tests/e2e/features/character-file-import.feature` with an oddity round-trip.

### 1.3 Make the ETag reflect the whole character

**Defect:** §2.4 (verified). The array passed as `JSON.stringify`'s second
argument is a recursive key filter, so nested data is stripped and characters
differing in stats or cypher effects hash identically.

**Change:** replace the key-array with a deterministic serialiser that sorts keys
recursively, then hash that. Continue to exclude `portrait`.

**Verify:** unit tests — changing `stats.might.pool`, changing
`cyphers[0].effect`, and reordering object keys. The first two must change the
hash; the third must not.

**Note:** version records store an `etag`. Existing records were computed with
the broken function; nothing reads them for equality today, so no migration is
needed, but do not start relying on historical etags.

### 1.4 Keep the portrait when restoring a version

**Defect:** §2.14. Versions exclude `portrait`, and `restoreCurrentVersion()`
promotes the portrait-less object to `latestCharacter`.

**Change:** when restoring or displaying an old version, re-attach the current
character's `portrait` to the object handed to the renderer.

**Verify:** E2E — upload a portrait, create a version, navigate back, restore,
assert the portrait is still shown.

---

## Phase 2 — Correctness of core flows

### 2.1 Register the app event listeners once

**Defect:** §2.1. Listeners are created inside `setTimeout` per render and the
matching `removeEventListener` uses a fresh closure, so they accumulate. After N
edits a card operation fires N buffer writes and N save requests.

**Change**

- Hoist the four handlers to module scope in `src/main.ts` and register them once
  during `DOMContentLoaded`, after `#app` exists.
- Have them read `currentSheet` / `currentCharacter` from module state, which
  they already do, so no per-render closure is required.
- Delete the `setTimeout` wrappers and the misleading "Remove any existing
  listeners to avoid duplicates" comments.

**Verify:** unit test in jsdom — call `renderCharacterSheet` three times, dispatch
one `character-updated`, assert `bufferChange` was called exactly once. Fails
before the fix.

### 2.2 Fix the `getVersionHistory()` singleton race

**Defect:** §2.8 (verified — fails in CI). The instance is published before
`init()` resolves, so a concurrent caller gets `db === null`.

**Change:** cache the in-flight promise rather than the instance, mirroring what
`getStorage()` already does:

```ts
let versionHistoryPromise: Promise<VersionHistoryManager> | null = null;

export function getVersionHistory(): Promise<VersionHistoryManager> {
  versionHistoryPromise ??= (async () => {
    const m = new VersionHistoryManager();
    await m.init();
    return m;
  })();
  return versionHistoryPromise;
}
```

Reset the promise on failure so a transient error is retryable.

**Verify:** unit test — two concurrent `getVersionHistory()` calls both resolve
to an initialised manager. The scenario _Multiple changes show combined
description_ must then pass.

### 2.3 Keep `VersionState.latestCharacter` current

**Defect:** §2.5. `setLatestCharacter()` has no call sites, so "Return to latest"
and the post-squash navigation both restore the page-load character and discard
the session's edits.

**Change:** call `versionState.setLatestCharacter(character)` from
`renderCharacterSheet` whenever the sheet renders the live character (that is,
not while viewing a historical version). Audit `reload()` while here: it
unconditionally resets `currentVersionIndex` to the newest version, making the
`isViewingOldVersion()` check at `versionState.ts:160` dead.

**Verify:** E2E — edit the name, navigate back a version, click _Return to
latest_, assert the edited name is shown.

**Depends on:** 0.1.

### 2.4 Persist recovery rolls and the damage track

**Defect:** §2.6. Both controls are display-only; no `@change` handler exists.

**Change:** add change handlers that update `character.recoveryRolls` /
`character.damageTrack`, persist through the storage factory (per 1.1), and
dispatch `character-updated` so version history and auto-save observe it.

**Verify:** write the scenarios first — they do not exist today. Tick a recovery
box, reload, assert it is still ticked; select _Impaired_, reload, assert it
persists. Then implement.

**Note:** this is a genuine feature gap, not a regression. `docs/FEATURES.md`
claims it works and should be corrected either way.

### 2.5 Stop clobbering the stored layout on edit-mode exit

**Defect:** §2.9 (verified — fails in CI). `toggleLayoutEditMode()` always
re-saves the layout the instance read at construction.

**Change:** only save when the layout actually changed during the edit session —
track a dirty flag set by `reorderSections` / `mergeSections` / `splitGrid`.
Reload from storage on entering edit mode so a single instance cannot hold a
stale copy.

**Verify:** the existing scenario _Layout persists after page reload_
(`section-rearrangement.feature:35`) must go green.

### 2.6 Fix Ctrl+Shift+Z

**Defect:** §2.10. `e.key` is `"Z"` when Shift is held.

**Change:** compare case-insensitively (`e.key.toLowerCase() === "z"`).

**Verify:** add the missing step — only Ctrl+Y is covered today.

---

## Phase 3 — Unfinished features and honest documentation

### 3.1 Decide the fate of grid merge/split and the import-layout prompt

**Defect:** §2.7. `mergeSections`, `splitGrid`, `updateLayout` and `getLayout`
have no callers; the imported layout returned by `fileStorage` is discarded.

**This needs a product decision before any code.** Two options:

- **Finish it** — wire merge/split into `handleDrop` (drop onto a section centre
  merges, drag out splits) and add the import prompt in `main.ts`'s
  `handleLoadFromFile` using the `hasLayoutDifference` flag that already exists.
- **Remove it** — delete the dead methods and the unused `fileStorage` return
  fields, and delete the `@skip`ped scenarios that describe them.

Either way, correct `docs/TODO.md`: the entry attributes these skips to
Playwright's drag-and-drop limitations, when the features were never wired up.
That framing is what allowed the gap to persist.

### 3.2 Restore Tailwind colours on the add buttons

**Defect:** §2.12 (verified). Dynamic class names are never generated.

**Change:** map the theme to complete literal class strings —

```ts
const THEMES = {
  green: "bg-green-100 hover:bg-green-200 text-green-700",
  purple: "bg-purple-100 hover:bg-purple-200 text-purple-700",
  // ...
} as const;
```

**Verify:** a build assertion that `bg-green-100` and friends appear in the
emitted CSS. This is the kind of regression a unit test cannot catch.

### 3.3 Include textareas in the modal focus trap

**Defect:** §2.13. Textareas are unreachable by keyboard in card edit modals.

**Change:** extend the selector in `modalBehavior.ts:76` to
`input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])`, all
with `:not([disabled])`.

**Verify:** extend `card-modal-focus-trap.feature` to tab from the name field to
the description textarea.

### 3.4 Bring the documentation back in line

- Move Settings Gear, Card Reordering and Section Re-arrangement from
  `docs/CURRENT_FEATURE.md` into `docs/FEATURES.md`; delete
  `CURRENT_FEATURE.md` per the documented workflow.
- Correct the counts in `docs/TODO.md` (744 unit tests; 359 executed E2E
  scenarios plus 9 skipped; not 100% passing).
- Either write `docs/DEPLOYMENT.md` or remove the three links to it.
- Correct the recovery/damage entry in `docs/FEATURES.md` until 2.4 lands.

---

## Phase 4 — Cleanup

Low risk, no behaviour change. Suitable for filling gaps between larger items.

- **Deduplicate `src/main.ts`.** The "force re-render collection sections" block
  appears four times (~200 lines). Extract one function.
- **Fix the shallow copy** in `handleFieldUpdate` (`src/main.ts:341`) — clone
  `stats` before assigning into it.
- **Remove the `Header` window-listener leak** (`src/components/Header.ts:42`);
  the handler is a no-op, so deleting it is sufficient.
- **Clear the remembered export handle from IndexedDB** in
  `clearRememberedLocation`, not just localStorage.
- **Fix `downloadFile`** — append the link to the document and revoke the object
  URL asynchronously, so the Firefox fallback works.
- **Bounds-check `reorderArray`**; fix the length comparison in
  `previewOrderEquals`.
- **Make `ItemsBox.handleDrop` immutable**, matching the other collections.
- **Hoist `RecoveryDamageSection`** out of `getSectionTemplate` — it is
  constructed ten times per render.
- **Fix the `SettingsGear` listener leak** — track the pending `setTimeout` and
  cancel it in `close()`.
- **Wire up or delete `detectChanges`.** 184 lines of tested-but-unused code is
  why every card edit is described as `"Updated character"`. Wiring it in would
  give version history meaningful descriptions.
- **Keep test-only code out of the bundle** — `TestTimer` and
  `src/utils/testHelpers.ts` are reachable from `src/main.ts`.
- **Guard `performSquash` against re-entrancy**, so `flush()` racing the timer
  cannot write the buffer twice.
- **Reduce the 257 `no-explicit-any` warnings**, concentrated in the `(currentSheet
as any)` casts in `main.ts` and in test files. Giving `CharacterSheet` real
  accessors for its child components would remove most of them.

---

## Not addressed

- **`beforeunload` flushing** (§3). `beforeunload` cannot await a promise; the
  buffered change is best-effort by construction. A real fix means writing
  synchronously on unload or accepting the loss. Worth a deliberate decision
  rather than a patch.
- **The two remaining flaky E2E failures** (`character-display` finding 0
  artifacts; _Execution context was destroyed_ during Ctrl+Z). These are expected
  to be fixed by 0.1 and 0.2. Re-run the suite after Phase 0 and only investigate
  further if they survive.

---

## Sequencing

| Phase | Contents  | Rationale                                           |
| ----- | --------- | --------------------------------------------------- |
| 0     | 0.1 – 0.3 | Without isolation, no later fix can be trusted      |
| 1     | 1.1 – 1.4 | Active data loss; the user-visible cost is highest  |
| 2     | 2.1 – 2.6 | Core flows wrong; 2.2 and 2.5 already fail CI       |
| 3     | 3.1 – 3.4 | Unfinished features and documentation that misleads |
| 4     | cleanup   | No behaviour change; fill gaps between larger items |

Phases 1 and 2 can proceed in parallel by different people — they touch mostly
disjoint files — except that 1.1 and 2.4 both change persistence call sites, so
land 1.1 first.
