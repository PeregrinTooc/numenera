# Implementation Plan — Addressing the July 2026 Review

Companion to `docs/PROJECT_REVIEW.md`. Each item states the defect, the change,
how to prove it, and what it depends on.

Phases 0, 1, 2 and 4 are complete — all items landed on `main`, verified by
CI. Of Phase 3, 3.2, 3.3 and 3.4 are also done; 3.1 is decided but not yet
built — see below. What remains is 3.1, tracked as a proper feature in
`docs/TODO.md`.

Every item follows the project's own rules: a Gherkin scenario or unit test comes
first (Rules #2, #3), one test at a time (Rule #10), and the work is presented
before commit (Rule #1).

---

## Phase 3 — Unfinished features and honest documentation

### 3.1 Grid merge/split and the import-layout prompt — decided: build it

**Defect:** §2.7. `mergeSections`, `splitGrid`, `updateLayout` and `getLayout`
have no callers; the imported layout returned by `fileStorage` is discarded.

**Decision:** finish wiring it up rather than delete the dead code. Not yet
built — tracked as a proper feature in `docs/TODO.md` under "Grid Merge/Split
& Import-Layout Conflict Prompt", with the implementation sketch and known
risk (this project's Playwright drag/drop automation limitation will likely
apply to the merge/split scenarios too).

---

## Phase 4 — Cleanup

Low risk, no behaviour change. Suitable for filling gaps between larger items.

- ~~**Deduplicate `src/main.ts`.** The "force re-render collection sections" block
  appears four times (~200 lines). Extract one function.~~ Done: added
  `CharacterSheet.rerenderSection(sectionId)`, which owns the targeted-render
  workaround; `main.ts` now calls it from a shared `rerenderCollectionSections()`
  helper (backward/forward nav, undo, redo) and from the `cyphers-updated` /
  `collection-updated` event handlers instead of duplicating the DOM lookup.
  Also removed the remaining `(currentSheet as any)` casts in `main.ts` by
  adding `CharacterSheet.isForCharacter()` and
  `CharacterSheet.setHeaderHasRememberedLocation()` accessors — this also
  covers the `no-explicit-any` bullet below for `main.ts`.
- ~~**Fix the shallow copy** in `handleFieldUpdate` (`src/main.ts:341`) — clone
  `stats` before assigning into it.~~ Done: extracted the field-update switch
  into a pure `applyFieldUpdate()` (`src/utils/characterFieldUpdate.ts`) that
  clones `stats` and each stat group unconditionally, so the result never
  shares a reference with the input — which matters because the input can be
  `VersionState.getDisplayedCharacter()`, itself only shallow-copied from a
  cached version snapshot. Covered by a unit test asserting no shared
  reference, and an E2E scenario ("Editing a stat while viewing an old
  version does not corrupt other versions' cached stats") confirmed to fail
  against the old code and pass against the fix.
- ~~**Remove the `Header` window-listener leak** (`src/components/Header.ts:42`);
  the handler is a no-op, so deleting it is sufficient.~~ Done: deleted the
  `export-handle-updated` listener and the dead `updateButtonState()` method
  it called. Button state is already kept in sync by
  `main.ts`'s `updateHeaderButtonState()`, which re-renders directly after
  export operations — the event was redundant. Covered by a unit test
  asserting `Header` never registers that listener.
- ~~**Clear the remembered export handle from IndexedDB** in
  `clearRememberedLocation`, not just localStorage.~~ Done: added
  `deleteHandle()`, mirroring `persistHandle()`, and call it (best-effort,
  matching the existing fire-and-forget persistence pattern) from
  `clearRememberedLocation()`. Covered by a unit test that clears the
  location and then constructs a fresh `ExportManager` to confirm it no
  longer reloads the handle from IndexedDB.
- ~~**Fix `downloadFile`** — append the link to the document and revoke the
  object URL asynchronously, so the Firefox fallback works.~~ Done: the link
  is now appended to `document.body` before `click()` and removed after; the
  object URL is revoked via `setTimeout(..., 0)` instead of synchronously.
  Covered by unit tests asserting append/click/remove ordering and that
  revocation happens on a later tick.
- ~~**Bounds-check `reorderArray`**; fix the length comparison in
  `previewOrderEquals`.~~ Done: `reorderArray` now returns an unchanged copy
  for an out-of-range `fromIndex`/`toIndex`. `previewOrderEquals` was
  copy-pasted, with the same length bug, into `Abilities`, `Attacks`,
  `CyphersBox`, `SpecialAbilities` and `ItemsBox` — extracted one exported,
  length-checked implementation into `DragDropBehavior.ts` and pointed all
  five at it. Covered by unit tests for both functions, verified to fail
  against the old behaviour.
- ~~**Make `ItemsBox.handleDrop` immutable**, matching the other
  collections.~~ Done: replaced `collection.length = 0; collection.push(...)`
  with a `setCollection()` reassignment, matching Cyphers/Abilities/Attacks/
  SpecialAbilities. Covered by a unit test asserting the array reference
  changes and the original array is untouched.
- ~~**Hoist `RecoveryDamageSection`** out of `getSectionTemplate` — it is
  constructed ten times per render.~~ Done: constructed once in
  `CharacterSheet`'s constructor, matching every other section component.
  Covered by a unit test spying on the constructor.
- ~~**Fix the `SettingsGear` listener leak** — track the pending `setTimeout`
  and cancel it in `close()`.~~ Done: `addDocumentListeners` now stores the
  `setTimeout` handle, and `removeDocumentListeners` cancels it if the panel
  closes before it fires. Covered by a unit test with fake timers proving no
  document listener survives an open→close within one tick.
- ~~**Wire up or delete `detectChanges`.** 184 lines of tested-but-unused code
  is why every card edit is described as `"Updated character"`. Wiring it in
  would give version history meaningful descriptions.~~ Decided: neither, for
  now — wiring it up requires ~20 new i18n keys and is feature work, not
  cleanup. Deferred as "Wire Up `detectChanges` for Meaningful Version
  Descriptions" in `docs/TODO.md`; the code and its tests are left as-is.
- ~~**Keep test-only code out of the bundle** — `TestTimer` and
  `src/utils/testHelpers.ts` are reachable from `src/main.ts`.~~ Verified
  against the actual built bundle (`npm run build`, then grepped
  `dist/assets/*.js` for `TestTimer`-specific strings like
  `test-timer-scheduled`): `TestTimer` was already absent — Rollup's
  tree-shaking eliminates it since `main.ts` only ever referenced it in a
  type position. Tightened the import to `import type` anyway, so this stays
  true regardless of future changes to how it's referenced.
  `src/utils/testHelpers.ts`'s only export, `sanitizeForTestId`, turned out
  to be a false positive — it's used by `AbilityItem.ts` to generate real
  `data-testid` attributes in production, not test-only code.
- ~~**Guard `performSquash` against re-entrancy**, so `flush()` racing the
  timer cannot write the buffer twice.~~ Done: added an `isSquashInProgress`
  flag, checked first and cleared in a `finally`, so a second call while one
  is already awaiting `saveVersion` returns immediately instead of saving
  the same buffer again. Also wired the existing (previously dead, always
  returned `false`) public `isSquashing()` stub to this real state. Covered
  by a unit test reproducing the exact race — `flush()` called while a
  timer-triggered squash is still awaiting its save — confirmed to fail
  (double save) against the old code and pass against the fix.
- ~~**Reduce the `no-explicit-any` warnings**, concentrated in the `(currentSheet
as any)` casts in `main.ts` and in test files.~~ `main.ts`'s casts are gone
  (see above); remaining warnings are in test files (255 → 200).

---

## Not addressed

- **`beforeunload` flushing** (§3). `beforeunload` cannot await a promise; the
  buffered change is best-effort by construction. A real fix means writing
  synchronously on unload or accepting the loss. Worth a deliberate decision
  rather than a patch.
