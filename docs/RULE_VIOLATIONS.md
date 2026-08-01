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

---

## Open

### 1. Rule #5 — path aliases are not used anywhere

**Rule:** "Use path aliases: `@/` prefix for src imports."

Every file under `src/` uses relative imports with an explicit `.js` extension
(`import { t } from "../i18n/index.js"`). Zero files use `@/`.

Aliases are already configured in all three places that need them —
`tsconfig.json` (`compilerOptions.paths`), `vite.config.ts` and
`vitest.config.ts` (`resolve.alias`) — so the rule is implementable today.

**Fix:** mechanical sweep of ~40 files, replacing cross-directory relative
imports with `@/…` and dropping the `.js` extension. Verify with `tsc --noEmit`,
`npm run build` and the unit suite. Do it as one commit; a half-migrated tree is
worse than either end state.

**Caveat to check first:** Cucumber loads step definitions through `ts-node/esm`.
If any step definition imports from `src/`, confirm alias resolution works there
before converting those imports.

### 2. Rule #5 — 257 `any` usages, and the linter only warns

**Rule:** "NO `any` types allowed. Exception: **None.** Linter enforces this."

The linter does **not** enforce it: `eslint.config.js:79` sets
`"@typescript-eslint/no-explicit-any": "warn"`. There are 257 warnings — 12 files
under `src/`, 21 under `tests/`.

**Fix:** eliminate the usages, then set the rule to `"error"` so it is enforced
as written. Order matters — flipping to `error` first turns the build red.

Concentrations in `src/`: the `(currentSheet as any)` casts in `main.ts` (giving
`CharacterSheet` real accessors for its child components removes most of them),
and the storage layer, where `ICharacterStorage.save/load` are typed `any`
despite `Character` existing.

### 3. Code quality — files over 300 lines

**Rule:** "Keep files small and focused (< 300 lines)."

| File                                           | Lines |
| ---------------------------------------------- | ----- |
| `src/main.ts`                                  | 1158  |
| `src/utils/unified-validation.ts`              | 847   |
| `src/components/CharacterSheet.ts`             | 544   |
| `src/components/helpers/CollectionBehavior.ts` | 398   |
| `src/components/ItemsBox.ts`                   | 397   |
| `src/services/versionHistoryService.ts`        | 371   |
| `src/services/conflictDetectionService.ts`     | 348   |
| `src/storage/fileStorage.ts`                   | 309   |

`main.ts` is the worst offender and the easiest win: ~200 of its lines are the
"force re-render collection sections" block copy-pasted four times.

### 4. Code quality — errors are swallowed

**Rule:** "Never swallow errors silently."

`src/storage/layoutStorage.ts` catches write failures and only `console.error`,
so the caller believes the layout was saved. `LocalStorageImpl.clear()` does the
same.

A `QuotaExceededError` is very reachable here — portraits are stored as base64
inside the character — and when it happens the save indicator still reports
success while nothing was written.

### 5. Git checklist — `console.log` in production code

**Rule:** "No console.log statements (use proper logging)."

8 occurrences under `src/`, mostly storage lifecycle messages in
`storageFactory.ts` and `indexedDBStorageImpl.ts`.

---

## 6. Test architecture — the E2E import path cannot cover validation

Not a rule violation, but it hid one of the bugs above and is worth fixing.

`TestStorageHelper.setMockFileImporter` replaces `IFileImporter.importCharacter()`
wholesale and returns `{ character, warnings }` verbatim. The real implementation
routes through `fileStorage.parseAndSanitizeCharacter` → `sanitizeCharacter`, so
**no E2E scenario ever executes the sanitizer**. The other import step
(`character-file-import.steps.ts`) is worse: it writes straight to storage and
reloads.

That is why the oddity-deleting bug survived a suite with 359 scenarios. A
Gherkin scenario for it today would pass whether or not the bug exists, which is
worse than no scenario — so the regression coverage is unit-level for now.

**Fix:** have the mock importer accept raw file _content_ and run it through the
real parse/sanitize path, so import scenarios exercise validation as production
does.
