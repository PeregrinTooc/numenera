# Implementation Plan — Addressing the July 2026 Review

Companion to `docs/PROJECT_REVIEW.md`. Each item states the defect, the change,
how to prove it, and what it depends on.

Phases 0, 1 and 2 (test-suite isolation, data loss/corruption, and core-flow
correctness) are complete — all items landed on `main`, verified by CI. What
remains is Phase 3 (unfinished features and documentation that misleads) and
Phase 4 (low-risk cleanup with no behaviour change).

Every item follows the project's own rules: a Gherkin scenario or unit test comes
first (Rules #2, #3), one test at a time (Rule #10), and the work is presented
before commit (Rule #1).

---

## Phase 3 — Unfinished features and honest documentation

### 3.1 Grid merge/split and the import-layout prompt — decided: build it

**Defect:** §2.7. `mergeSections`, `splitGrid`, `updateLayout` and `getLayout`
have no callers; the imported layout returned by `fileStorage` is discarded.

**Decision:** finish wiring it up rather than delete the dead code. Tracked as
a proper feature in `docs/TODO.md` under "Grid Merge/Split & Import-Layout
Conflict Prompt", with the implementation sketch and known risk (this
project's Playwright drag/drop automation limitation will likely apply to the
merge/split scenarios too). `docs/TODO.md`'s "Automated Drag/Drop E2E Tests"
entry has been corrected — it previously misattributed these 7 `@skip`ped
scenarios to that limitation, when the real reason was that the feature was
never wired up.

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
- Correct the counts in `docs/TODO.md` to the current numbers (`npm run
test:unit` / `npm run test:e2e:prod` totals).
- Either write `docs/DEPLOYMENT.md` or remove the three links to it.
- Correct the recovery/damage entry in `docs/FEATURES.md` — 2.4 has landed.

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
- **Reduce the `no-explicit-any` warnings**, concentrated in the `(currentSheet
as any)` casts in `main.ts` and in test files. Giving `CharacterSheet` real
  accessors for its child components would remove most of them.

---

## Not addressed

- **`beforeunload` flushing** (§3). `beforeunload` cannot await a promise; the
  buffered change is best-effort by construction. A real fix means writing
  synchronously on unload or accepting the loss. Worth a deliberate decision
  rather than a patch.
