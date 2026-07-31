# Outstanding Rule Violations

Places where the codebase currently breaks a rule from `CLAUDE.md` /
`docs/rules/`. **The rules are correct; the code is wrong.** Fix the code.

Do not resolve an entry by relaxing the rule. If a rule looks genuinely
impossible or self-contradictory, raise it with the maintainer — two such cases
are listed at the bottom under _Needs a decision_.

---

## Fixed

| Rule                                  | Violation                                                                                                                                                                                                           | Fixed in                                                                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #11 Storage through adapters only     | `CollectionBehavior.ts`, `BasicInfo.ts` and `RecoveryDamageSection.ts` imported `saveCharacterState` from `src/storage/localStorage.ts`, bypassing the factory and writing a second diverging copy of the character | routed through `persistCharacterState()` in `storageFactory.ts`                                                                                                             |
| #11 (consequence)                     | `migrateFromLocalStorage()` ran on every page load and overwrote newer IndexedDB data with the stale localStorage copy                                                                                              | now adopts localStorage only when IndexedDB is empty; test `should handle migration when IndexedDB already has data` had asserted the data-loss behaviour and was corrected |
| Architecture — responsive breakpoints | `xs: 480px` was documented but did not exist: Tailwind v4 never read `tailwind.config.js`                                                                                                                           | declared as `--breakpoint-xs: 30rem` in the `@theme` block of `src/styles/main.css`                                                                                         |
| Architecture — theme fonts            | `edit-modal.css` consumed `var(--font-handwritten)`, which resolved to nothing                                                                                                                                      | `--font-sans`, `--font-serif`, `--font-handwritten` declared in `@theme`                                                                                                    |

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

`src/storage/localStorage.ts` and `src/storage/layoutStorage.ts` catch write
failures and only `console.error`, so a `QuotaExceededError` (very reachable —
portraits are stored as base64 in the character) leaves the save indicator
showing success while nothing was written.

### 5. Git checklist — `console.log` in production code

**Rule:** "No console.log statements (use proper logging)."

8 occurrences under `src/`, mostly storage lifecycle messages in
`storageFactory.ts` and `indexedDBStorageImpl.ts`.

---

## Needs a decision

These two cannot be resolved without knowing the intent, and guessing would
either churn the whole codebase or change stored data.

### A. Prettier: semicolons

`docs/rules/code-quality.md` says **"No semicolons (Prettier default)"**, but
`.prettierrc` sets `"semi": true` and the entire codebase is written with
semicolons.

The parenthetical is factually wrong either way — Prettier's default _is_
semicolons — so it is unclear which half was intended:

- **The rule is right** → set `"semi": false` and reformat every file. Large but
  purely mechanical diff.
- **The config is right** → correct the rule text to "Semicolons required".

The doc currently still reads "Semicolons required", which is my edit. If the
rule was meant literally, revert that line and reformat instead.

### B. Oddities: `string[]` vs `OddityItem`

`docs/rules/numenera.md` originally modelled oddities as
`OddityItem { name: string; description: string }`. The code has
`oddities: string[]` (`src/types/character.ts:79`).

This is not cosmetic. `sanitizeArrayField` in `unified-validation.ts` drops every
non-object array item, so **importing a character file currently deletes all
oddities** (see `docs/PROJECT_REVIEW.md` §2.3). If the rule's object model is the
intent, that bug disappears as a side effect of conforming to it.

- **Conform to the rule** → change the type to `OddityItem`, update
  `OddityItem.ts`, `ItemsBox.ts`, the mock characters, and add a stored-data
  migration for existing `string[]` values.
- **Keep `string[]`** → correct `numenera.md`, and fix `sanitizeArrayField`
  separately to preserve strings.

I have documented the current `string[]` shape in `numenera.md` rather than
assume; say which way you want it and I will make the code and the rule agree.

---

## Also worth deciding

- **`tailwind.config.js` is now inert.** Theme values live in the `@theme` block
  of `src/styles/main.css`, which is the only thing Tailwind v4 reads. The config
  file is never loaded, and leaving it in place is what made the `xs` breakpoint
  appear configured while doing nothing. Either delete it or add a comment
  saying it is unused.
- **`src/storage/localStorage.ts` has no importers in `src/` any more** — only
  its own unit test. Deleting it would remove the trap that caused violation #11
  in the first place.
