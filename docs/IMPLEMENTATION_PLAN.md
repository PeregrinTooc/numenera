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

### 0.1 Fix the IndexedDB names used by test cleanup — DONE

**Defect:** §2.11. `tests/e2e/support/hooks.ts:110` and `src/main.ts:776,799`
targeted `NumeneraCharacterDB`. The real databases are `numenera-character-db`
and `numenera-version-history-db`, so cleanup deleted nothing and character
state and version history leaked between scenarios.

**Change**

- Database names centralized as `CHARACTER_DB_NAME`, `VERSION_HISTORY_DB_NAME`,
  `FILE_HANDLES_DB_NAME` in `src/storage/storageConstants.ts`, imported by
  `indexedDBStorageImpl.ts`, `storageFactory.ts`, `versionHistory.ts` and
  `exportManager.ts` in place of local literals.
- `window.__testStorage.clearCharacterState` now calls the real
  `clearCharacterState()` from `storageFactory` instead of deleting a database
  by the wrong name.
- `window.__testVersionHistory.clearVersions` now calls
  `VersionHistoryManager.clear()` instead of hand-rolling a transaction against
  a hardcoded name and a `"versions"` store that database never had.

**What actually shipped in the `Before` hook is not what was planned.** The
original plan called for the hook to `indexedDB.deleteDatabase()` the two real
names directly. That was implemented first and broke every scenario: the page
the hook just navigated to has already booted the app, which holds its own open
connections to exactly those databases, so `deleteDatabase()` against them
fires `blocked` instead of succeeding, and the retry loop exhausted its budget
at a 30s hook timeout — failing all 15 scenarios in the smoke-test run. Fixed
by clearing through the app's own already-open-connection APIs
(`window.__testStorage.clearCharacterState()` /
`window.__testVersionHistory.clearVersions()`) instead of deleting the
databases from outside the page. The original wrong-name code never hit this
because nothing had ever opened `NumeneraCharacterDB`.

**Verified:** `character-display.feature` + `section-rearrangement.feature` (15
scenarios) now pass in full, including the previously-failing "1 artifact
displayed" scenario.

### 0.2 Raise the Cucumber step timeout — RETRACTED, was never a real bug

**This item was wrong.** `cucumber.cjs`'s `timeout: 300` key is not a
recognized cucumber-js configuration option — see `IConfiguration` in
`@cucumber/cucumber`'s type definitions — so it was silently ignored the entire
time, not applied at 300ms or any other value. The real per-step/hook timeout
has always been `setDefaultTimeout(30000)` in `tests/e2e/support/world.ts`,
which is generous and was never the problem. The dead `timeout` key is removed
from `cucumber.cjs` with a comment explaining why, so it can't mislead again.
The `failFast: false` comment is corrected to match its actual meaning (run all
scenarios even after a failure — Cucumber's `failFast` stops the run on the
first failure when `true`).

The `waitForTimeout` calls added in `885cf75`, `b175258` and `e299f56` were
never about this dead config and are not touched here.

### 0.3 Make the E2E browser resolvable — DONE

**Defect:** the pre-push hook and `npm run test:e2e:*` fail outright in any
environment that cannot download Playwright's pinned browser build.

**Change:** `tests/e2e/support/hooks.ts` now honours an optional `PW_EXEC_PATH`
environment variable when launching Chromium, defaulting to `undefined` (using
Playwright's own resolved browser) when unset.

**Verified:** `PW_EXEC_PATH=/opt/pw-browsers/.../headless_shell npm run
test:e2e -- <feature>` runs the suite in this container, where Playwright's
pinned browser download is unreachable.

---

## Phase 1 — Data loss and corruption

### 1.1 Route all persistence through the storage factory — DONE

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

### 1.2 Preserve oddities on import — DONE

**Defect:** §2.3 (verified). `sanitizeArrayField` drops non-object array items,
and `Character.oddities` is `string[]`, so every import wipes them.

**Change:** give `sanitizeArrayField` an expected item kind, or add a dedicated
`sanitizeStringArray` for oddities. Keep the warning behaviour for items that are
genuinely the wrong type.

**Verify:** unit test — sanitising a character with two string oddities returns
both and produces no warnings.

The planned E2E round-trip was **not** added: both import step definitions mock
past `sanitizeCharacter` entirely, so the scenario would pass with or without the
fix. See `docs/RULE_VIOLATIONS.md` §6 — fix the harness first, then add it.

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

### 2.2 Fix the `getVersionHistory()` singleton race — DONE

**Defect:** §2.8 (verified — fails in CI). The instance was published before
`init()` resolved, so a concurrent caller could get `db === null`.

**Change:** `getVersionHistory()` now caches the in-flight promise rather than
the instance, mirroring `getStorage()`, and clears the cached promise on
failure so a transient error is retryable.

**Verify:** `tests/unit/storageFactory.test.ts` stubs `VersionHistoryManager.init()`
behind a controlled gate and asserts neither of two concurrent callers settles
before it resolves — confirmed RED against the original code, GREEN after the
fix. A plain `Promise.all` on two immediate calls was tried first and passed
even against the buggy code, since fake-indexeddb's `init()` timing didn't
reliably reproduce the interleaving; the gated version does.

`version-history.feature`'s _Multiple changes show combined description_,
which failed on this in the original run, now passes.

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

### 2.5 Stop clobbering the stored layout on edit-mode exit — DONE

**Defect:** §2.9 (verified — fails in CI). `toggleLayoutEditMode()` always
re-saved the layout the instance read at construction.

**Change shipped, simpler than planned:** the plan called for a dirty flag set
by `reorderSections` / `mergeSections` / `splitGrid`, saving on exit only when
dirty. That machinery turned out to be unnecessary: all three of those methods
already call `saveLayout()` immediately when they mutate `this.layout`, so the
exit-time save was pure redundancy on every real path, and actively wrong
whenever storage had changed since the session started. The fix simply removes
the exit-time save. Entering edit mode now reloads from storage
(`this.layout = loadLayout()`), so a long-lived instance can't hold a stale
copy across a session either.

**Verify:** `tests/unit/characterSheetLayout.test.ts` enters edit mode, writes
a different layout to storage (as the "moved section to top" E2E step does,
since drag-and-drop can't be reliably automated), exits, and asserts storage
still holds the write rather than the stale in-memory snapshot — RED against
the original code, GREEN after the fix. `section-rearrangement.feature`'s
_Layout persists after page reload_ now passes.

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

## Resolved without a code fix

- **The two remaining flaky E2E failures.** Both are confirmed fixed/non-issues,
  not "expected to be fixed by 0.1/0.2" as originally guessed:
  - `character-display` finding 0 artifacts: fixed by 0.1 (the `Before` hook now
    actually isolates scenarios).
  - `version-history`'s _Execution context was destroyed_ during Ctrl+Z: **not
    an app bug**. See review §2.15 — it's Vite's dev-server client
    (`/@vite/client`, injected only outside `vite preview`/production builds)
    occasionally reloading the page independent of source edits. Verified by
    reproducing the identical scenario against a fresh production build
    (`test:e2e:prod`'s path), where it passed repeatedly. CI already runs
    `test:e2e:prod`, so this never reaches it. No code change applied; a
    `server.hmr: false` attempt was tried and confirmed ineffective (the
    client still opens its own WebSocket regardless) before concluding there
    is no clean fix short of not using the dev server for E2E HTML responses.

## Found and fixed during final verification

- **"Navigation preserves character integrity" race.** A confirmation run of
  the three previously-problematic feature files together surfaced a new,
  previously-unseen failure: version navigation showing version 1's data
  ("Kael the Wanderer") where version 2's ("Character V2") was expected. Root
  cause: the step `"the character has {int} versions with different data"`
  was missing the `waitForLoadState("networkidle")` + `waitForTimeout(500)`
  wait its two sibling steps already had, letting its first `createVersion()`
  call race the app's own initial-version save on `DOMContentLoaded`. See
  review §2.16. Fixed by adding the same wait; not an application defect.
  Two more version-history `Given` steps had the identical gap (`"...version
with multiple basic info changes"`, `"...version from {int} minutes ago"`)
  and got the same fix for consistency.
- **"Layout persists after page reload" flake.** Same root cause, different
  step: the shared `"I reload the page"` step only waited for
  `domcontentloaded`; its sibling reload flow already waited for
  `[data-testid="character-name"]`. Brought into line — see review §2.16.

## Found, not fixed — out of scope (see review §2.17)

Three more E2E flakes in `card-reordering.feature` and
`recovery-damage-track.feature` surfaced during the full-suite confirmation
run and reproduced again in isolation. None were part of this cycle's four
original failures, and neither step file was touched this cycle. They look
like the same missing-synchronization pattern just fixed in
`version-history.steps.ts` and `common-steps.ts` (a bare navigation or DOM
read with no wait for the app's async render), but confirming that and fixing
it is a separate piece of work. Left for a follow-up pass rather than
expanding this cycle's scope.

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
