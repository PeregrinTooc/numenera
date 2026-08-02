# Implementation Plan — Addressing the July 2026 Review

Companion to `docs/PROJECT_REVIEW.md`. Each item states the defect, the change,
how to prove it, and what it depends on.

Phases 0, 1 and 2 (test-suite isolation, data loss/corruption, and core-flow
correctness) are complete — all items landed on `main`, verified by CI. Of
Phase 3, 3.2, 3.3 and 3.4 are also done; 3.1 is decided but not yet built —
see below. What remains is finishing 3.1 and Phase 4 (low-risk cleanup with
no behaviour change).

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
- ~~**Reduce the `no-explicit-any` warnings**, concentrated in the `(currentSheet
as any)` casts in `main.ts` and in test files.~~ `main.ts`'s casts are gone
  (see above); remaining warnings are in test files (255 → 200).

---

## Not addressed

- **`beforeunload` flushing** (§3). `beforeunload` cannot await a promise; the
  buffered change is best-effort by construction. A real fix means writing
  synchronously on unload or accepting the loss. Worth a deliberate decision
  rather than a patch.
