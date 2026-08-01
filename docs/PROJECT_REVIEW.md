# Project Review — 31 July 2026

A review of the implementation and status of the Numenera Character Sheet, plus
the defects it turned up. Findings marked **verified** were reproduced with a
probe test or an actual failing run; the rest are read from the code with the
file and line recorded so they can be checked quickly.

Reviewed at commit `885cf75`.

Everything this review flagged as data-losing, already-failing-CI, or
compounding (§2.1–§2.6, §2.8–§2.11, §2.14–§2.17, all of Phase 0/1/2 in
`docs/IMPLEMENTATION_PLAN.md`) has since landed on `main` and is confirmed
green in CI — `npm run test:unit` (754 tests) and the full `npm run
test:e2e:prod` suite (365/365 scenarios). Those entries are removed below;
what remains is the unfinished-feature/documentation work (§2.7, §2.12,
§2.13) and the low-risk cleanup items in section 3, both tracked in
`docs/IMPLEMENTATION_PLAN.md` Phase 3/4.

---

## 2. Defects

### 2.7 Grid merge/split and the import-layout prompt are unreachable

**decided: build it — tracked in `docs/TODO.md`**

`CharacterSheet.mergeSections()`, `splitGrid()`, `updateLayout()` and
`getLayout()` have zero call sites; `handleDrop` only ever calls
`reorderSections`. Separately, `src/storage/fileStorage.ts` computes `layout` and
`hasLayoutDifference` on import but `src/main.ts:435-471` reads only `character`
and `warnings`, so the imported layout is dropped and no prompt exists.

The matching scenarios are `@skip`ped; `docs/TODO.md` previously attributed
this to Playwright's drag-and-drop limitations, which obscured that the
features were never wired up. Corrected — see `docs/TODO.md`'s "Grid
Merge/Split & Import-Layout Conflict Prompt" for the implementation plan.

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

See `docs/IMPLEMENTATION_PLAN.md` Phase 3 (§2.7, §2.12, §2.13 above) and Phase
4 (section 3 above).
