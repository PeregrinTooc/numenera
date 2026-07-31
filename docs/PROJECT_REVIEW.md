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

**verified**

`Character.oddities` is `string[]` (`src/types/character.ts:79`), but
`sanitizeArrayField` in `src/utils/unified-validation.ts` discards any array item
that is not an object. Every import silently drops all oddities and emits one
warning per entry.

```
ODDITIES AFTER SANITIZE: []
WARNINGS: ["Invalid item at index 0 in oddities...", ...]
```

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

**verified — causes a real E2E failure**

`src/storage/storageFactory.ts:129`:

```ts
if (versionHistoryInstance) return versionHistoryInstance; // may be uninitialised
versionHistoryInstance = new VersionHistoryManager();
await versionHistoryInstance.init();
```

The module-level variable is assigned **before** `init()` is awaited, so a
concurrent second caller receives the instance with `db === null`:

```
✖ Given the character has a version with multiple basic info changes
    page.evaluate: Error: VersionHistoryManager not initialized
        at VersionHistoryManager.saveVersion (versionHistory.ts:61)
```

`getStorage()` immediately above does this correctly, assigning only after
`init()` resolves.

### 2.9 Exiting layout edit mode clobbers the stored layout

**verified — causes a real E2E failure**

`CharacterSheet.toggleLayoutEditMode()` (`src/components/CharacterSheet.ts:363`)
unconditionally calls `saveLayout(this.layout)` on exit, where `this.layout` was
read by `loadLayout()` in the constructor. Any newer layout written since is
overwritten.

This fails `section-rearrangement.feature:35` — _Layout persists after page
reload_, which is **not** `@skip`ped. It compounds with a new `CharacterSheet`
being constructed on every field edit (`src/main.ts:521`), each re-reading the
layout, so instances can diverge and the last one to exit edit mode wins.

### 2.10 Ctrl+Shift+Z redo never fires

**`src/main.ts:1067`**

`(e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z"` — with Shift held,
`KeyboardEvent.key` is `"Z"`. Only Ctrl+Y works, and only Ctrl+Y is covered by
the step definitions.

### 2.11 E2E scenarios do not isolate

`tests/e2e/support/hooks.ts:110` and `src/main.ts:776,799` delete and open a
database named `NumeneraCharacterDB`. The real names are
`numenera-character-db` (`src/storage/indexedDBStorageImpl.ts:5`) and
`numenera-version-history-db` (`src/storage/versionHistory.ts:6`). The cleanup
deletes a database that does not exist and _creates_ an empty one;
`clearVersions()` then opens a `"versions"` store on it that was never created.
Character state and version history leak between scenarios.

Related: `cucumber.cjs:10` sets `timeout: 300` — 300 **milliseconds** per step
(Cucumber's default is 5000). And `failFast: false` carries the comment
`// Stop on first failure`, which contradicts the value.

These two together are the most likely cause of the remaining flaky failures:
`character-display` seeding an artifact then finding 0, and a version-history
step dying with _Execution context was destroyed_.

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
