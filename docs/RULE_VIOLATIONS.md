# Outstanding Rule Violations

Places where the codebase currently breaks a rule from `CLAUDE.md` /
`docs/rules/`. **The rules are correct; the code is wrong.** Fix the code.

Do not resolve an entry by relaxing the rule. If a rule looks genuinely
impossible or self-contradictory, raise it with the maintainer rather than
editing the rule to match the code.

> **Scope note.** This file is for rule violations only. Ordinary bugs belong in
> `docs/PROJECT_REVIEW.md` and `docs/IMPLEMENTATION_PLAN.md`. An earlier revision
> listed the oddity-import bug here on the grounds that `numenera.md` sketched a
> different data model; that was a stretch — the descriptive data-model section
> of a rules file is not a rule, and the bug stood on its own. It is fixed and
> tracked as review §2.3.

---

## Fixed

| Rule                                   | Violation                                                                                                                                                                                                           | Fixed in                                                                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #11 Storage through adapters only      | `CollectionBehavior.ts`, `BasicInfo.ts` and `RecoveryDamageSection.ts` imported `saveCharacterState` from `src/storage/localStorage.ts`, bypassing the factory and writing a second diverging copy of the character | routed through `persistCharacterState()` in `storageFactory.ts`                                                                                                             |
| #11 (consequence)                      | `migrateFromLocalStorage()` ran on every page load and overwrote newer IndexedDB data with the stale localStorage copy                                                                                              | now adopts localStorage only when IndexedDB is empty; test `should handle migration when IndexedDB already has data` had asserted the data-loss behaviour and was corrected |
| Architecture — responsive breakpoints  | `xs: 480px` was documented but did not exist: Tailwind v4 never read `tailwind.config.js`                                                                                                                           | declared as `--breakpoint-xs: 30rem` in the `@theme` block of `src/styles/main.css`                                                                                         |
| Architecture — theme fonts             | `edit-modal.css` consumed `var(--font-handwritten)`, which resolved to nothing                                                                                                                                      | `--font-sans`, `--font-serif`, `--font-handwritten` declared in `@theme`                                                                                                    |
| Code quality — one formatting standard | `code-quality.md` said "No semicolons (Prettier default)" while `.prettierrc` set `"semi": true` and the whole codebase used them — and the parenthetical was wrong, since Prettier's default _is_ semicolons       | the rule now restates `.prettierrc` in a table and names `.prettierrc` as authoritative, so the two cannot drift again                                                      |
| Dead code                              | `tailwind.config.js` was never read by Tailwind v4, and `src/storage/localStorage.ts` had no importers left in `src/` after the Rule #11 fix — while remaining an easy way to re-enter that violation               | both deleted, with `localStorage.test.ts`; `cyphersBox.test.ts` now asserts persistence goes through the factory instead of mocking the deleted module                      |
| Git checklist — no `console.log`       | 8 storage lifecycle `console.log` calls in `src/`; `no-console` was only a warning                                                                                                                                  | routed through `src/utils/logger.ts` (debug/info print in dev builds only); `no-console` is an error for `src/`, with the logger as the one exemption                       |
| Code organisation — one class per file | `modalBehavior.ts` held 3 classes, `timer.ts` 2                                                                                                                                                                     | `FocusTrappingBehavior` → `focusTrappingBehavior.ts`, `ModalContainer` → `modalContainer.ts`, `TestTimer` → `testTimer.ts`                                                  |
| Rule #5 — path aliases                 | 138 cross-directory `../` imports in `src/` and 140 relative imports into `src/` from `tests/` (including `vi.mock` specifiers) instead of `@/`                                                                     | every one rewritten to `@/<path>`; `no-restricted-imports` bans `../*` in `src/` and `**/src/**` in `tests/`                                                                |

---

## Open

Re-measured on `main` at `b9b81c1` (2026-10-30).

### 2. Rule #5 — 201 `any` usages, and the linter only warns

**Rule:** "NO `any` types allowed. Exception: **None.** Linter enforces this."

`eslint.config.js` sets `no-explicit-any` to `"warn"`, and 44 more usages hide
behind `eslint-disable-next-line` comments, so the lint count understates it:

|          | Reported by lint | Behind `eslint-disable`     | Total          |
| -------- | ---------------- | --------------------------- | -------------- |
| `src/`   | 30 in 11 files   | 4 (`CollectionBehavior.ts`) | 34 in 12 files |
| `tests/` | 127 in 17 files  | 40                          | 167            |

Concentrations in `src/`: the storage interfaces (`ICharacterStorage.save/load`
typed `any` although `Character` exists — `load()` should return `unknown`
narrowed by a type guard), the `unified-validation.ts` inputs (take `unknown`),
the File System Access APIs (declare them in a `.d.ts`), the auto-save event
payloads, and `(this.manager as any).db` in `versionHistoryService.ts`.

In `tests/`: `window as any` (~35, needs a typed test-window interface),
`null as any` (17, mostly gone once validators take `unknown`), and
private-member access (~28).

**Fix:** remove the usages, then set the rule to `"error"` and forbid disabling
it. Order matters — flipping first turns the build red, and flipping without
banning the disable comments leaves the hidden 44.

### 3. Code quality — files over 300 lines

**Rule:** "Keep files small and focused (< 300 lines)." Tests count; pure data
does not (see `code-quality.md`).

**`src/` — 8 files**

| File                                           | Lines | Natural seam                                                                   |
| ---------------------------------------------- | ----- | ------------------------------------------------------------------------------ |
| `src/main.ts`                                  | 926   | test hooks, compare-view controller, version navigation, import/export, events |
| `src/utils/unified-validation.ts`              | 890   | field validation / character validation / sanitizer (already banner-separated) |
| `src/components/CharacterSheet.ts`             | 786   | drag/touch controller; reorder/merge/split as pure layout operations           |
| `src/components/helpers/CollectionBehavior.ts` | 418   | render helpers                                                                 |
| `src/components/ItemsBox.ts`                   | 388   | drag-reorder handlers into a reusable helper                                   |
| `src/services/versionHistoryService.ts`        | 381   | undo/redo stack                                                                |
| `src/components/DiffCharacterSheet.ts`         | 363   | 7 near-identical collection renderers → one generic                            |
| `src/services/conflictDetectionService.ts`     | 348   | BroadcastChannel transport vs dirty tracking                                   |

**`tests/` — 24 files**

| File                                                            | Lines |
| --------------------------------------------------------------- | ----- |
| `tests/e2e/step-definitions/version-history.steps.ts`           | 1221  |
| `tests/e2e/step-definitions/section-rearrangement.steps.ts`     | 737   |
| `tests/unit/characterValidation.test.ts`                        | 716   |
| `tests/unit/versionHistoryServiceRefactor.test.ts`              | 685   |
| `tests/e2e/step-definitions/card-creation.steps.ts`             | 645   |
| `tests/e2e/features/card-creation.feature`                      | 581   |
| `tests/unit/conflictWarningModal.test.ts`                       | 566   |
| `tests/unit/exportManager.test.ts`                              | 563   |
| `tests/unit/editFieldModal.test.ts`                             | 477   |
| `tests/e2e/features/version-history.feature`                    | 464   |
| `tests/unit/conflictDetectionService.test.ts`                   | 452   |
| `tests/unit/fieldValidation.test.ts`                            | 445   |
| `tests/e2e/step-definitions/version-comparison.steps.ts`        | 415   |
| `tests/unit/indexedDBStorageImpl.test.ts`                       | 412   |
| `tests/unit/changeDetection.test.ts`                            | 407   |
| `tests/unit/versionState.test.ts`                               | 401   |
| `tests/e2e/step-definitions/basic-info-editing.steps.ts`        | 395   |
| `tests/unit/basicInfo.test.ts`                                  | 386   |
| `tests/unit/stateManagement.test.ts`                            | 349   |
| `tests/e2e/step-definitions/additional-fields-editing.steps.ts` | 348   |
| `tests/e2e/step-definitions/card-reordering.steps.ts`           | 334   |
| `tests/unit/itemsBox.test.ts`                                   | 328   |
| `tests/unit/layoutTypes.test.ts`                                | 324   |
| `tests/unit/domStructure.test.ts`                               | 323   |

Feature files split along their `# ===` section banners into several
`.feature` files; step definitions follow the feature split.

### 4. Code quality — errors are swallowed

**Rule:** "Never swallow errors silently." Judged by severity — likelihood ×
impact on what the user believes — see `code-quality.md`.

| Path                                                          | Likelihood | Impact                                                                                        | Verdict                                                                                |
| ------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Auto-save: `save-error` is emitted, nothing in `src/` listens | low–medium | **critical** — every later edit is lost on reload while the indicator shows the old timestamp | **violation — must surface**                                                           |
| `persistCharacterState` (7 call sites incl. portrait upload)  | low–medium | **critical** — same cascade; a ~2.7 MB base64 portrait is the likeliest trigger               | **violation — must surface**                                                           |
| Version squash: logs, `squash-error` unheard, buffer cleared  | low        | moderate — one history entry lost, the character itself is safe                               | acceptable: reconcile-on-load rebuilds the entry on the next boot; the `catch` says so |
| `layoutStorage` save/reset                                    | low        | cosmetic — section order visibly reverts                                                      | acceptable; comment the `catch`                                                        |
| `comparisonViewPreference` save                               | low        | trivial — one toggle reverts                                                                  | acceptable; comment the `catch`                                                        |
| `exportManager` handle cache                                  | low        | trivial — Quick Export asks for the location again                                            | acceptable; comment the `catch`                                                        |
| `LocalStorageImpl.clear()`                                    | very low   | none — the next load falls back to the default character again                                | acceptable; comment the `catch`                                                        |

Likelihood drivers: WebKit drops IndexedDB connections after iOS backgrounds a
tab, quota on the localStorage fallback, and a full disk. Once one write fails
on size, every later save of the same character fails too.

**Fix:** no notification mechanism exists today. Proposed: storage writers
throw; one `storage-write-failed` event (quota vs other) fed by both save paths
and documented in `EVENT_CATALOG.md`; `SaveIndicator` gains an error state with
`role="alert"` and new `autoSave.*` keys in both locales, cleared by the next
successful save. Behaviour change, so Rule 2 applies: scenario first,
simulating `QuotaExceededError` via `addInitScript`, on all four profiles.

### 6. Rule #4 — hardcoded user-facing text

**Rule:** "i18n everything — no hardcoded user-facing text."

7 `alert()` calls in English (`BasicInfo.ts:27,33`, `main.ts` ~362–425), the
import-warning "Note: …" strings in `main.ts`, and English `Error` messages
that reach users through those alerts (3 in `exportManager.ts`, 3 in
`fileStorage.ts`). `check:i18n` only verifies that `t()` keys exist, so it
cannot catch these. Fix together with #4's notification mechanism.

### 7. Rule #5 — tests are never type-checked

`tsconfig.json` excludes `tests/`, and `build` checks only `src/`. A probe with
`tests/` included found 96 real type errors in 13 files (largest:
`fileStorage.test` 20, `basicInfo.test` 19, `conflictWarningModal.test` 16),
plus 74 that are only missing Vitest globals. Replacing test `any`s means
little until something checks them.

**Fix:** `tsconfig.test.json` (`types: ["vitest/globals"]`) and a
`typecheck:tests` step in the pre-commit hook and CI.

### 9. Test-environment sniffing in production code

`src/storage/indexedDBStorageImpl.ts:185` checks `(globalThis as any).vi` to
detect Vitest. Inject the timeout instead.

---

## 10. Test architecture — the E2E import path cannot cover validation

Not a rule violation, but it hid one of the bugs above and is worth fixing.

`TestStorageHelper.setMockFileImporter` replaces `IFileImporter.importCharacter()`
wholesale, so **no E2E scenario ever executes the sanitizer**. The other import
step (`character-file-import.steps.ts`) writes straight to storage and reloads,
so the real import flow's versioning is untested too.

**Fix:** drive the real importer with no app hook. Delete
`window.showOpenFilePicker` in the step to force the `<input type=file>` path
(WebKit has no picker anyway), click Import, and feed the raw file through
Playwright's `filechooser` event. Then remove the `__testFileImporter` seam and
add the oddity-import regression scenario (review §2.3).

---

## Plan — a sequence of commits on `main`

Each step is one green commit, reviewed before committing (Rule 1). Refactors
need no feature file; steps 8 and 9 change behaviour and start with a scenario.

| #   | Commit                                                                                                  | Kind     |
| --- | ------------------------------------------------------------------------------------------------------- | -------- |
| 1   | ~~Logger and `no-console` as error for `src/` (#5); split `modalBehavior.ts` and `timer.ts` (#8)~~ done | refactor |
| 2   | ~~`@/` codemod across `src/` and `tests/`, plus the `no-restricted-imports` guard (#1)~~ done           | refactor |
| 3   | ~~Delete the dead `fileStorage` export code; move the `exportManager` handle store out (#3)~~ done      | refactor |
| 4   | Remove `any` from `src/`, including the `vi` sniff (#2, #9)                                             | refactor |
| 5   | `tsconfig.test.json` and `typecheck:tests` in hook and CI; fix the test type errors (#7)                | tooling  |
| 6   | Remove `any` from `tests/`; `no-explicit-any` as error, disabling it banned (#2)                        | refactor |
| 7   | Real-path E2E import, drop the importer seam, oddity scenario (#10)                                     | test     |
| 8   | Surface storage write failures (#4)                                                                     | feature  |
| 9   | Replace the `alert()`s and English errors with step 8's mechanism (#6)                                  | feature  |
| 10  | Split `unified-validation.ts` and its oversized test files (#3)                                         | refactor |
| 11  | Split `CollectionBehavior`, `ItemsBox`, `DiffCharacterSheet` and their tests (#3)                       | refactor |
| 12  | Split `versionHistoryService`, `conflictDetectionService`, `CharacterSheet` and their tests (#3)        | refactor |
| 13  | Split `main.ts`; split the remaining oversized step definitions and feature files (#3)                  | refactor |

Dependencies: aliases (2) before any split, so new files are born with `@/`;
`src/` types (4) before the test typecheck (5) before the test `any`s (6); the
notification mechanism (8) before the alert cleanup (9).
