# Project Review — 31 July 2026

A review of the implementation and status of the Numenera Character Sheet, plus
the defects it turned up. Findings marked **verified** were reproduced with a
probe test or an actual failing run; the rest are read from the code with the
file and line recorded so they can be checked quickly.

Reviewed at commit `885cf75`.

---

## 1. Status

| Check                  | Result                                         |
| ---------------------- | ---------------------------------------------- |
| `tsc --noEmit`         | clean                                          |
| `npm run test:unit`    | **744 passed**, 42 files                       |
| `npm run lint`         | 0 errors, 257 warnings (all `no-explicit-any`) |
| `npm run check:i18n`   | passes — 118 keys present in both locales      |
| `npm run build`        | succeeds                                       |
| `npm run test:e2e:all` | **355 of 359 scenarios pass; 4 fail**          |

The E2E suite was run against a locally supplied Chromium (the container cannot
download Playwright's pinned browser). Full result:

```
359 scenarios (4 failed, 355 passed)
2452 steps   (4 failed, 14 skipped, 2434 passed)
34m48s
```

A further 9 scenarios never execute — they are tagged `@skip` and excluded by the
`not @skip` tag filter in `cucumber.cjs`.

> `docs/TODO.md` claims "658 unit tests + 330 E2E scenarios (2326 steps) — 100%
> passing". All four numbers are stale and the pass rate is not 100%.

### Documentation drift

- `docs/CURRENT_FEATURE.md` still presents Settings Gear, Card Reordering and
  Section Re-arrangement as in-flight with unchecked success criteria. All three
  are implemented and committed.
- None of those three features appear in `docs/FEATURES.md`, which the project's
  own workflow requires once work completes.
- `README.md`, `docs/FEATURES.md` and `docs/TODO.md` all link to
  `docs/DEPLOYMENT.md`, which does not exist.

---

## 2. Defects

Ordered by severity.

### 2.1 Event listeners accumulate on every render

**`src/main.ts:651-765`**

Four listeners — `cyphers-updated`, `collection-updated`, `recovery-updated`,
`character-updated` — are registered inside `setTimeout(..., 0)` at the end of
`renderCharacterSheet`. Each registration builds a **new closure** and then calls
`app.removeEventListener(...)` with that new reference, which removes nothing.
`renderCharacterSheet` runs on every field edit, so the listener count grows
without bound.

After N edits a single card operation invokes the `character-updated` handler N
times, producing N `bufferChange()` calls and N `requestSave()` calls. Visible
symptoms: Ctrl+Z needs N presses to undo one card edit, and the `squashedCount`
metadata on squashed versions is inflated.

### 2.2 Direct localStorage writes are migrated back over newer IndexedDB data

**verified**

`src/components/helpers/CollectionBehavior.ts:6`, `src/components/BasicInfo.ts:7`
and `src/components/RecoveryDamageSection.ts:8` import `saveCharacterState` from
`src/storage/localStorage.js`, bypassing `storageFactory`.
`IndexedDBStorageImpl.migrateFromLocalStorage()` runs on **every** page load
(`src/storage/storageFactory.ts:76`) and unconditionally overwrites the IndexedDB
record from localStorage.

Reproduction: add a cypher (localStorage snapshot written) → edit XP through the
modal (IndexedDB only) → reload. Migration replays the older snapshot and the XP
edit is gone.

```
expected 5 to be 50   // xp after migrateFromLocalStorage()
```

This also violates the project's own Rule #11.

### 2.3 Importing a character file deletes every oddity

**verified — FIXED**

`Character.oddities` is `string[]` (`src/types/character.ts:79`), but
`sanitizeArrayField` in `src/utils/unified-validation.ts` discards any array item
that is not an object. Every import silently drops all oddities and emits one
warning per entry.

```
ODDITIES AFTER SANITIZE: []
WARNINGS: ["Invalid item at index 0 in oddities...", ...]
```

Fixed: `sanitizeArrayField` now takes an expected item kind, and `oddities` asks
for `"string"`. Object collections keep their previous behaviour. Covered by
three unit tests in `characterValidation.test.ts`.

### 2.4 ETag ignores all nested data

**verified**

`src/utils/etag.ts:12` passes an array as the second argument to
`JSON.stringify`. That is a **recursive key filter**, not a key sort: any nested
key absent from the top-level key list is stripped. `stats` serialises as `{}`;
cypher `level` and `effect` disappear.

Two characters differing in `stats.might.pool` _and_ `cyphers[0].effect` hash
identically (`e9eb38ca…`). Multi-tab conflict detection cannot see any change
below the top level.

### 2.5 `VersionState.setLatestCharacter()` is never called

**`src/services/versionState.ts:59`**

The method has no call sites anywhere in the tree, so `latestCharacter` stays
frozen at the character loaded on page load. "Return to latest" in the warning
banner (`src/main.ts:598`) and the auto-navigate on `version-squashed`
(`src/main.ts:139`) therefore render the page-load state and discard the
session's edits.

`ConflictDetectionService.checkBeforeSave()` is likewise never called.

### 2.6 Recovery checkboxes and damage-track radios persist nothing

**`src/components/RecoveryRolls.ts:70-131`, `src/components/DamageTrack.ts:28-88`**

Both render `?checked=${...}` with **no `@change` handler**. Ticking a recovery
roll or selecting "Impaired" updates neither the model nor storage.

`docs/FEATURES.md` lists both as fully tested, but
`tests/e2e/features/recovery-damage-track.feature` only asserts display — no
scenario clicks a control.

### 2.7 Grid merge/split and the import-layout prompt are unreachable

`CharacterSheet.mergeSections()`, `splitGrid()`, `updateLayout()` and
`getLayout()` have zero call sites; `handleDrop` only ever calls
`reorderSections`. Separately, `src/storage/fileStorage.ts` computes `layout` and
`hasLayoutDifference` on import but `src/main.ts:435-471` reads only `character`
and `warnings`, so the imported layout is dropped and no prompt exists.

The matching scenarios are `@skip`ped and `docs/TODO.md` attributes this to
Playwright's drag-and-drop limitations, which obscures that the features were
never wired up.

### 2.8 `getVersionHistory()` singleton race

**verified — FIXED, caused a real E2E failure**

`src/storage/storageFactory.ts:129` (as originally reviewed):

```ts
if (versionHistoryInstance) return versionHistoryInstance; // may be uninitialised
versionHistoryInstance = new VersionHistoryManager();
await versionHistoryInstance.init();
```

The module-level variable was assigned **before** `init()` was awaited, so a
concurrent second caller could receive the instance with `db === null`:

```
✖ Given the character has a version with multiple basic info changes
    page.evaluate: Error: VersionHistoryManager not initialized
        at VersionHistoryManager.saveVersion (versionHistory.ts:61)
```

`getStorage()` immediately above did this correctly, assigning only after
`init()` resolved.

Fixed: `getVersionHistory()` now caches the in-flight promise instead of the
instance, mirroring `getStorage()`, and clears the cached promise on failure so
a transient error is retryable. Covered by a unit test
(`tests/unit/storageFactory.test.ts`) that deterministically forces the
interleaving via a controlled `init()` gate — a `Promise.all` on two immediate
calls doesn't reliably reproduce the race under fake-indexeddb's timing, so the
test stubs `init()` to prove neither caller resolves before it does.
`version-history.feature`'s "Multiple changes show combined description"
scenario, which failed on this, now passes.

### 2.9 Exiting layout edit mode clobbers the stored layout

**verified — FIXED, caused a real E2E failure**

`CharacterSheet.toggleLayoutEditMode()` (`src/components/CharacterSheet.ts:363`)
unconditionally called `saveLayout(this.layout)` on exit, where `this.layout`
was read by `loadLayout()` in the constructor. Any newer layout written since
was overwritten.

This failed `section-rearrangement.feature:35` — _Layout persists after page
reload_, which is **not** `@skip`ped.

Fixed: the exit branch no longer re-saves. `reorderSections`, `mergeSections`
and `splitGrid` already persist immediately when they mutate `this.layout`, so
the exit-time save was redundant on every real path and actively wrong on any
path where storage changed since the session started (exactly what the failing
scenario's "moved section to top" step does — it writes `numenera-layout`
directly, since drag-and-drop can't be reliably automated in Playwright).
Entering edit mode now also reloads from storage
(`this.layout = loadLayout()`), so a long-lived instance can't hold a stale
snapshot across a session. Covered by
`tests/unit/characterSheetLayout.test.ts`, which reproduces the exact
clobber and confirms the fix. The E2E scenario now passes.

### 2.10 Ctrl+Shift+Z redo never fires

**`src/main.ts:1067`**

`(e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z"` — with Shift held,
`KeyboardEvent.key` is `"Z"`. Only Ctrl+Y works, and only Ctrl+Y is covered by
the step definitions.

### 2.11 E2E scenarios do not isolate

**verified — FIXED**

`tests/e2e/support/hooks.ts:110` and `src/main.ts:776,799` deleted and opened a
database named `NumeneraCharacterDB`. The real names are
`numenera-character-db` (`src/storage/indexedDBStorageImpl.ts:5`) and
`numenera-version-history-db` (`src/storage/versionHistory.ts:6`). The cleanup
deleted a database that did not exist and _created_ an empty one;
`clearVersions()` then opened a `"versions"` store on it that was never
created. Character state and version history leaked between scenarios.

**Correction to the original review:** it also named `cucumber.cjs`'s
`timeout: 300` as a 300ms-per-step bug. That was wrong — `timeout` is not a
recognized cucumber-js configuration key at all (see `IConfiguration` in
`@cucumber/cucumber`), so it was silently ignored the entire time. The real
per-step/hook timeout has always been `setDefaultTimeout(30000)` in
`tests/e2e/support/world.ts`. The dead key is removed from `cucumber.cjs`.

Fixed: database names are centralized as `CHARACTER_DB_NAME`,
`VERSION_HISTORY_DB_NAME` and `FILE_HANDLES_DB_NAME` in
`src/storage/storageConstants.ts`, imported everywhere a name was previously a
local literal (`indexedDBStorageImpl.ts`, `storageFactory.ts`,
`versionHistory.ts`, `exportManager.ts`). `main.ts`'s test helpers
(`window.__testStorage.clearCharacterState`, `window.__testVersionHistory.clearVersions`)
now call the real adapter/manager `clear()` methods instead of hand-rolling a
transaction against the wrong name.

**A regression surfaced and was fixed during this work.** The first version of
the `hooks.ts` fix made the `Before` hook call `indexedDB.deleteDatabase()`
directly against the (now-correct) real names — but the page has already
booted the app by that point, and the app holds its own open connections to
exactly those databases. `deleteDatabase()` against a database with a live
connection fires `blocked` rather than succeeding; the retry loop exhausted
its budget and the hook timed out at 30s, failing every scenario. The original
(wrong-name) code never hit this because nothing had ever opened
`NumeneraCharacterDB`. Fixed by clearing through the app's own
already-open-connection APIs (`window.__testStorage.clearCharacterState()` /
`window.__testVersionHistory.clearVersions()`) instead of deleting the
databases from outside the page.

With both fixes, `character-display.feature` and `section-rearrangement.feature`
(15 scenarios) pass in full, including the "1 artifact displayed" scenario that
previously found 0 and "Layout persists after page reload".

### 2.12 Add-button colours are purged from the production CSS

**verified**

`renderAddButton` (`src/components/helpers/CollectionBehavior.ts:330`) builds
class names as `` `bg-${colorTheme}-100 hover:bg-${colorTheme}-200` ``. Tailwind
scans for literal strings, so these are never generated. Against a real build:

```
bg-green-100    0
bg-purple-100   0
bg-indigo-100   0
```

Every "+" button renders unstyled in `dist/`.

### 2.13 Modal focus trap skips textareas

`FocusTrappingBehavior.handleTabKey` (`src/services/modalBehavior.ts:76`) queries
only `input` and `button`. Nine card components use `<textarea>`, and
`CardEditModal` calls `e.preventDefault()` on Tab unconditionally — so the
textarea is unreachable by keyboard inside a card edit modal. This contradicts
the documented "Tab key cycles through modal inputs / accessibility compliance".

### 2.14 Restoring an old version destroys the portrait

`versionHistory.saveVersion` strips `portrait` (`src/storage/versionHistory.ts:83`).
`VersionState.navigateToVersion` assigns that portrait-less object to
`displayedCharacter`, and `restoreCurrentVersion()` promotes it to
`latestCharacter`. Restoring permanently drops the image.

### 2.15 The fourth original E2E failure was never an app bug — verified

**"Mixed undo/redo with buffer and versions"** (`version-history.feature:184`)
failed identically on every dev-server run with `page.evaluate: Execution
context was destroyed, most likely because of a navigation` at the "I press
Control+Z to undo buffered changes" step, whether run standalone or as part of
the full suite. The original review attributed this (along with the artifact-
count flake) to the E2E database-name/isolation bug in §2.11. That attribution
was wrong.

**Investigation.** Diagnostic logging added temporarily to the keydown handler
and `VersionHistoryService` showed the buffer-undo path executing completely
correctly every time: `canUndo()` true, `undo()` invoked, the timer
bookkeeping consistent throughout. The app logic was never at fault. A stack
trace inside the mystery early `performSquash()` call pointed at a source line
that, on inspection, was a doc-comment in the current file — proof the dev
server was serving the browser a **stale cached bundle** relative to the
on-disk source, making that specific trace worthless. Rebuilding fresh and
running the identical scenario against a **static production build**
(`npm run test:e2e:prod`'s path) passed **12/12 steps, repeatedly**. The same
scenario, same code, same test — passes under `vite preview`, fails
intermittently under `vite`'s dev server.

**Root cause.** Vite's dev server injects a live client
(`<script src="/@vite/client">`) into every HTML response; `vite preview`
(serving the static `dist/` build) injects nothing. That client unconditionally
opens its own WebSocket back to the dev server — confirmed by fetching
`/@vite/client` directly and finding `new WebSocket(...)` calls with no feature
flag gating them, including a `"vite-ping"` reconnect socket separate from
HMR itself. Setting `server.hmr: false` in `vite.config.ts` was tried and does
**not** stop this: the client still fetches and still opens a socket,
confirmed by fetching the client script with the flag set and finding the same
unconditional `createWebSocketModuleRunnerTransport` call. This mechanism can
trigger a full page reload independent of any source edit (e.g. on its own
connection/ping handshake). If that reload lands while a step is mid-`await`
inside `page.evaluate()`, Playwright reports exactly "Execution context was
destroyed, most likely because of a navigation" — indistinguishable from a
real app bug from the failure message alone.

**Disposition: not a code defect, no fix applied.** There is no supported way
to strip Vite's injected client from dev-server responses short of not using
the dev server for HTML at all — which is precisely what `vite preview`
already is. The project's own CI (`.github/workflows/deploy.yml`) runs
`npm run test:e2e:prod`, never the dev-server path, so this flake **does not
occur in CI**. `docs/rules/testing.md` should note that a scenario failing only
under `npm run test:e2e`/`test:e2e:all` (dev server) with this exact error
should be re-verified against `npm run test:e2e:prod` before being treated as
a regression.

### 2.16 "Navigation preserves character integrity" — missing step synchronization, verified fixed

A confirmation run of the three previously-problematic feature files together
(47 scenarios, production build) surfaced a **new** failure not among the
original four: "Navigation preserves character integrity"
(`version-history.feature:129`) expected `"Character V2"` after navigating to
version 2, but got `"Kael the Wanderer"` — the default mock character's name,
i.e. version 1's data.

**Root cause.** The step `"the character has {int} versions with different
data"` (`version-history.steps.ts:139`) started creating versions immediately,
with no wait for the page to settle first. Its two sibling steps —
`"...versions in history"` and `"...versions with different names"` — both
call `page.waitForLoadState("networkidle")` plus a `waitForTimeout(500)`
before their loops; this one didn't. On `DOMContentLoaded`, `main.ts` exposes
`window.__testVersionHistory` synchronously, but doesn't save the "Initial
state" version until later in the same async bootstrap (after
`renderCharacterSheet()` and a `getVersionHistory()`/`getAllVersions()` round
trip). Without the wait, the test's first `createVersion()` call can race the
app's own initial-version save — both write to the same IndexedDB `versions`
store, and whichever timestamp lands where determines the resulting order.
Under the light load of an isolated single-feature run this window rarely
lost the race; under the heavier concurrent load of a 47-scenario/6-worker
run it did.

**Fix.** Added the same `waitForLoadState("networkidle")` +
`waitForTimeout(500)` pair to this step, matching its two siblings.

**Disposition: fixed, verified.** Not a defect in application code — a test
step missing synchronization that its own siblings already had.

A second, same-shaped gap surfaced in the same verification pass: the shared
`"I reload the page"` step (`common-steps.ts:372`) only waited for
`domcontentloaded`, which fires before the app's own async render pipeline
produces DOM content — too weak for anything asserting on rendered state right
after. Its sibling reload flow in `section-rearrangement.steps.ts` already
waits for `[data-testid="character-name"]` after reload; this step now does
too. This surfaced as "Layout persists after page reload" intermittently
showing the pre-reload DOM. Fixed the same way, verified with a repeat run.

### 2.17 Three more pre-existing E2E flakes found, not fixed — out of scope

Running the **entire** suite (all 359 scenarios, `test:e2e:prod`) to confirm
the §2.16 fixes didn't regress anything else surfaced three additional
failures, none of which are among the original four this review cycle was
scoped to, and none touching any file changed this cycle:

- `card-reordering.feature`: "Dragging card shows transparent ghost effect"
  and "Ability order persists after page reload" / "Reorder abilities by
  dragging on desktop" — `locator.dragTo()` timing out at 30s waiting for the
  dragged element's ancestor locator.
- `recovery-damage-track.feature`: "Display recovery rolls section", "Display
  damage track section" and "Show debilitated status" — `page.textContent
("body")` immediately after `"I am on the character sheet page"` (a bare
  `page.goto()` with no post-load wait) sometimes catches a loading
  placeholder (`"·····················"`) instead of rendered text; one
  scenario also hit a 2000ms `waitForFunction` timeout.

All three reproduced again in an isolated two-feature-file run, so this isn't
purely a full-suite resource-contention artifact — `card-reordering.steps.ts`
and `recovery-damage-track.steps.ts` look like they have the same class of
missing-synchronization bug fixed in §2.16 (bare navigation/DOM reads with no
wait for the app's async render to finish), but neither was part of this
review's original scope and neither was touched by any change in this cycle.
Logged here rather than fixed so scope stays bounded to what was asked;
tracked in `docs/IMPLEMENTATION_PLAN.md` for a follow-up pass.

---

## 3. Lower severity

- **Shallow copy in `handleFieldUpdate`** (`src/main.ts:341`) — `{...character}`
  followed by `updatedCharacter.stats.might.pool = …` writes through to the
  shared `stats` object, mutating cached version snapshots in
  `VersionState.allVersions` when editing while viewing an old version.
- **`Header` leaks a window listener per instance** (`src/components/Header.ts:42`)
  — a new `Header` is built on every field edit; the `export-handle-updated`
  listener is never removed and its handler is a no-op.
- **`beforeunload` awaits `flush()`** (`src/main.ts:901`) — `beforeunload` does
  not await promises, so buffered changes can be lost on close.
- **`performSquash` has no re-entrancy guard** — `flush()` racing an in-flight
  timer squash can write the same buffer twice.
- **`clearRememberedLocation`** (`src/storage/exportManager.ts:145`) removes a
  localStorage key, but the handle lives in the `FileHandles` IndexedDB store and
  returns on reload.
- **`downloadFile`** (`src/storage/exportManager.ts:191-197`) revokes the object
  URL synchronously after `click()` and never appends the link to the document.
  This is the non-Chromium fallback and can fail in Firefox.
- **`reorderArray`** (`src/components/helpers/DragDropBehavior.ts:16`) does not
  bounds-check; an out-of-range `fromIndex` splices `undefined` into the array.
- **`previewOrderEquals`** (`src/components/ItemsBox.ts:224`) returns `true` when
  the two arrays have different lengths.
- **`ItemsBox.handleDrop`** mutates in place (`collection.length = 0; push(...)`)
  while Cyphers, Abilities, Attacks and SpecialAbilities reassign immutably.
- **`getSectionTemplate`** (`src/components/CharacterSheet.ts:81`) constructs a
  new `RecoveryDamageSection` on every call — ten per render.
- **`SettingsGear.addDocumentListeners`** registers via `setTimeout(…, 0)`; an
  open→close within one tick leaves a document listener that cannot be removed
  and re-renders the sheet on every subsequent click.
- **`detectChanges`** (`src/utils/changeDetection.ts`, 184 lines) is dead
  production code — only unit tests call it. This is why every card operation is
  recorded as the generic `"Updated character"`.
- **`TestTimer` and `src/utils/testHelpers.ts` ship in the production bundle**,
  imported from `src/main.ts`.
- **`src/main.ts` duplicates ~200 lines** of "force re-render collection
  sections" four times (backward nav, forward nav, undo, redo).
- **`EditFieldModal` Enter handling** — Enter on the focused Cancel button fires
  both the native click and the keydown-Enter confirm.

---

## 4. Fixed in this review cycle

- **CI deployed from pull requests.** `.github/workflows/deploy.yml` ran a single
  `build-test-deploy` job on `pull_request` with no guard on the
  `actions/deploy-pages` step, so any PR against `main` could publish to
  production Pages. Split into `build-test` and `deploy`, with the deploy job
  guarded on event and ref and holding the only `pages: write` /
  `id-token: write` grants. Fixed in `c3cca7f`.

---

## 5. Suggested order of work

See `docs/IMPLEMENTATION_PLAN.md`. In short: §2.1, §2.2, §2.8, §2.3/§2.4 and
§2.11 first — they are respectively compounding, data-losing, already failing
CI, silently corrupting, and the reason the suite cannot be trusted.
