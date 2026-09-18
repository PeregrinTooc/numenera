# Test Suite DSL — Implementation Plan

Date: 2026-09-18
Source: [`tests/analysis.md`](./analysis.md) (findings §2–§4, recommendations §6)

This plan turns the analysis into an ordered sequence of small, independently
reviewable changes. Every step leaves `npm run test:unit`, `npm run lint` and
`npm run test:e2e:prod` green (Rule 8), touches one concern (Rule 10), and is
sized to be a single conventional commit presented for review (Rule 1).

---

## 0. Baseline re-verified before planning

The analysis was re-checked against the current tree (`cd031a8`). Most of it
holds. Five findings differ in ways that **change the work**, so they are
recorded here first:

| #   | Analysis said                                                                                                  | Verified                                                                                                                                                                                                                                                                        | Consequence for the plan                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | §4d: the "unified" `Given "the character has {string} set to {int}"` should replace the 4 per-field leftovers. | The unified step is used by **zero** feature lines. All four "leftovers" are live: `{int} shins` ×7, `{int} armor` ×5, `max cyphers {int}` ×4, `effort {int}` ×4.                                                                                                               | Delete the unified step. Consolidate the 4 live ones at the **implementation** level, keeping their Gherkin.        |
| 2   | §4a: `I click the {string}` / `I tap the {string}` in `common-steps.ts` have a missing-key bug.                | Both steps are used by **zero** feature lines (feature files say `I click the "Load" button`, which is a different step). The bug is real but unreachable.                                                                                                                      | Fix is deletion, not repair. No regression scenario needed (Rule 2 applies to reachable behaviour).                 |
| 3   | §4c: the `background field` / `notes field` step blocks are near-duplicates that should be parameterised.      | Feature files use `background textarea` / `notes textarea`. The `... field` blocks (~40 steps, `additional-fields-editing.steps.ts:257-667`) are **dead**. The live `... textarea` blocks are duplicated too.                                                                   | Delete the dead `field` blocks; parameterise the live `textarea` blocks.                                            |
| 4   | Duplication is the main problem.                                                                               | **Dead step definitions are a bigger, cheaper lever.** A script matching every registered Cucumber expression against every feature line finds **~131 of 864 step definitions (15%) match nothing** (136 raw hits minus 5 false positives from literal `\\(`). Details in §2.1. | New Phase 1 (delete dead code) goes before any unification; a `check:steps` script becomes a permanent guardrail.   |
| 5   | §3.2: seven-plus unit character factories; three byte-identical `createBaseCharacter()`.                       | **Twelve** factories. `createBaseCharacter()` exists in **five** files (`diffDescriptions`, `changeDetection`, `characterDiff`, `versionDescriptions` byte-identical; `diffCharacterSheet` identical minus the `portrait` line).                                                | Phase 4 migration list is longer than the analysis implies; the byte-identical copies are the cheapest to collapse. |

Other verified facts the plan relies on:

- `tests/e2e/support/cardTestFixtures.ts` `BASE_CHARACTER` is a hand-copied
  duplicate of `FULL_CHARACTER` in `src/data/mockCharacters.ts`; three step
  files reference `FULL_CHARACTER` only in comments.
- `cucumber.js`: `parallel: 6` locally, `1` in CI. Workers are separate
  processes, so the module-level `let` globals in three step files
  (`auto-save-indicator`, `character-file-export`, `data-validation`) leak
  **between scenarios on the same worker**, not across workers. Still a bug,
  smaller blast radius than the analysis reads.
- `defineParameterType` is used nowhere in the E2E suite. It is the idiomatic
  Cucumber mechanism for exactly the vocabulary this suite keeps re-deriving
  (card type, badge, field, textarea, resource).
- `cardEditHelpers.ts` has no importer (confirmed; only `analysis.md` mentions it).
- Baseline metrics (§11) were collected with `grep`/`node` one-liners and are
  reproducible from the commands listed there.

---

## 1. Principles

1. **Feature files are the spec; consolidate implementations, not Gherkin.**
   Where two live phrasings exist (`I click the Confirm button` ×5 vs.
   `I click the modal confirm button` ×22), both are registered against the
   _same_ function; feature files do not churn for a refactor. Through Phase 6,
   feature files change only when (a) a step is a no-op that misleads (§4f) or
   (b) a scenario is being retired. **Phase 7 is the deliberate exception**: it
   consolidates Gherkin wording itself, once every synonym already maps to one
   implementation.
2. **Delete before unify.** Dead code costs nothing to remove and shrinks every
   later step. Phase 1 is deletion only.
3. **Introduce → migrate one consumer → delete old.** Every shared helper is
   added alongside the thing it replaces, consumers move one file per commit,
   and the old helper is deleted in the last commit of that series. There is
   never a half-migrated state that a reviewer must hold in their head.
4. **Vocabulary lives in parameter types, wiring lives on `CustomWorld`.**
   `{cardType}`, `{badge}`, `{field}`, `{textarea}`, `{resource}` map Gherkin
   words to test-ids in one place each. `this.dom`, `this.modal`,
   `this.cards`, `this.fields`, `this.setup` give every step a discoverable
   place to reuse (addresses the root cause in analysis §5).
5. **The existing suites are the safety net.** This is a refactor of test
   infrastructure, so no new `.feature` files are needed (Rule 2 is about
   feature code). The scenario count (365 passing / 16 `@skip`) and unit count
   (869) must be identical before and after every phase — that is the acceptance
   criterion, not "tests pass".
6. **Guardrails ship with the fix.** Each root cause gets a mechanical check so
   it cannot silently recur (the analysis's own diagnosis: nothing enforced the
   documented convention).

---

## 2. Phase 1 — Delete dead code

Goal: remove everything that no feature file or test can reach. Zero
behavioural change. Estimated size: ~131 step definitions, ~1 500 lines.

### 2.1 `scripts/step-catalog.js` — `npm run docs:steps` / `npm run check:steps`

**Already in this branch.** One parser (Cucumber expression → regex, matched
against every `Given/When/Then/And/But` line under `tests/e2e/features/`) with
two outputs:

- `npm run docs:steps` writes [`tests/e2e/STEP_CATALOG.md`](./e2e/STEP_CATALOG.md)
  — the reference for feature-file authors (every phrase, its usage count,
  where it is defined; see Phase 7).
- `npm run check:steps` exits 1 if any step definition matches no feature line
  **or** the committed catalog is stale. Today it reports the 131 dead steps.

It handles `{string}`, `{int}`, `{float}`, `{word}`, `{}`, custom `{types}`,
optional `(text)`, alternation `a/b`, escaped literal parens `\\(` and
Scenario Outline `<placeholders>`. Pure text, no browser, <1 s.

Add `check:steps` to `.husky/pre-commit` next to `check:i18n` only **after**
2.2–2.4 complete (it fails until then).

Verification: `npm run check:steps` lists exactly the steps deleted in
2.2–2.4; after 2.4 it exits 0.

### 2.2 Delete dead steps, one file per commit

Per file, delete every step the script reports, then delete any local helper,
import or constant that becomes unused (ESLint `no-unused-vars` catches these).
Order by payoff:

| File                                                          | Dead / total | Notes                                                                                                                                                                                |
| ------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `additional-fields-editing.steps.ts`                          | 40 / 94      | Whole `background field` + `notes field` blocks (analysis §4c) plus dead dropdown/event steps. Live `textarea` blocks stay for Phase 3.8.                                            |
| `version-history.steps.ts`                                    | 39 / 122     | Includes an entire unreachable multi-context conflict block (`:1452-1718`). Check for `@skip`/`@wip` features first — if a feature is tagged out rather than absent, keep its steps. |
| `card-creation.steps.ts`                                      | 14 / 104     | Singular `{int} cypher card` variants; features use plural.                                                                                                                          |
| `basic-info-editing.steps.ts`                                 | 6 / 44       | After excluding the 5 literal-paren false positives.                                                                                                                                 |
| `data-validation.steps.ts`                                    | 8 / 13       | Only 2 scenarios exist; 8 of 13 steps unreachable.                                                                                                                                   |
| `i18n.steps.ts`                                               | 8 / 37       |                                                                                                                                                                                      |
| `card-deletion.steps.ts`                                      | 7 / 55       |                                                                                                                                                                                      |
| `common-steps.ts`                                             | 5 / 50       | `I click the {string}`, `I tap the {string}` (§4a bug goes with them), `I click the modal backdrop`, `I press Enter`, `I press Escape`.                                              |
| `resource-tracker-editing.steps.ts`                           | 1 / 21       | The unused "unified" `Given` (§0 #1).                                                                                                                                                |
| `card-reordering`, `export-enhancement`, `version-comparison` | 1 each       |                                                                                                                                                                                      |

Verification per commit: `npm run check:steps` shrinks by exactly the deleted
count; `npm run lint`; `npm run test:e2e:prod` — same 365/16.

### 2.3 Delete `tests/unit/helpers/cardEditHelpers.ts`

141 lines, no importer. If card-edit-modal unit tests are wanted later, that is
a feature with its own `.feature` file; the helpers can be rewritten against
the factory from Phase 4 at that point.

Verification: `npm run test:unit` — 869.

### 2.4 Remove write-only state

`combat.steps.ts` `this.testAttackName`, `this.testArmorValue` (never read —
confirmed by search). Delete the assignments and the `(this as any)` cast that
enables them.

---

## 3. Phase 2 — Quick correctness fixes

Small, isolated, each its own commit. All are live-behaviour fixes, so each
gets or keeps an E2E scenario that would fail without it.

| #   | Fix                                                                                                                                                                                                                                                                      | File(s)                                                                                                                   | Why now                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 2.1 | Turn the 7 no-op `the X should be removed from the DOM` steps (`card-deletion.steps.ts:221-248`, live ×7) into one real assertion: `expect(locator).toHaveCount(previousCount - 1)`. Requires capturing the count before deletion — store it on `CustomWorld` (see 4.9). | `card-deletion.steps.ts`, `world.ts`                                                                                      | Scenarios currently pass while asserting nothing. Fixing it first means Phase 3.6 refactors real assertions, not placeholders. |
| 2.2 | `basic-info-editing.steps.ts:147-151` non-retrying `isDisabled()` → `await expect(locator).toBeDisabled()` (same as `resource-tracker-editing.steps.ts:445`).                                                                                                            | `basic-info-editing.steps.ts`                                                                                             | Flake-prone twin of a correct implementation.                                                                                  |
| 2.3 | `hooks.ts` `Before`: construct `this.storageHelper` **before** navigation/clearing, then call `this.storageHelper.clearStorage()` + `clearVersions()` instead of the inline `page.evaluate`. Keep the explanatory comment about blocked deletes.                         | `hooks.ts`                                                                                                                | Removes the duplicated clearing logic that runs before every scenario.                                                         |
| 2.4 | Move `waitForSaveComplete()` from `auto-save-indicator.steps.ts:17-20` to `tests/e2e/support/save.ts`; update the 3 importers.                                                                                                                                           | `auto-save-indicator.steps.ts`, `common-steps.ts`, `additional-fields-editing.steps.ts`, `recovery-damage-track.steps.ts` | Cross-file helper in a feature file; blocks the "step files import only from support" lint rule in Phase 6.                    |
| 2.5 | Single `openSettingsPanel(world)` in `support/settings.ts` (the robust `settings-gear.steps.ts:59-65` version, with the listener-attachment wait); `section-rearrangement.steps.ts:187-191` calls it.                                                                    | `settings-gear.steps.ts`, `section-rearrangement.steps.ts`                                                                | Two implementations of differing robustness for the same setup.                                                                |
| 2.6 | Hoist the duplicated `defaultValues` map (`common-steps.ts:430-440`, `:496-506`) into one module constant — and derive it from `FULL_CHARACTER` (Phase 5 makes this an import; for now a single literal).                                                                | `common-steps.ts`                                                                                                         | Two copies 60 lines apart.                                                                                                     |

Verification: `npm run test:e2e:prod` after each; for 2.1 temporarily break
deletion (e.g. comment out the delete handler) to see the scenario go red, then
restore.

---

## 4. Phase 3 — E2E DSL on `CustomWorld`

Goal: a new step definition's path of least resistance is reuse. Each
sub-step: add the surface, migrate consumers one file per commit, delete the
old path. Sizes are S (<1 h), M (half day), L (day).

### 3.1 Parameter types — `tests/e2e/support/parameterTypes.ts` (S)

```ts
import { defineParameterType } from "@cucumber/cucumber";
import { CARD_CONFIGS } from "./cardTestFixtures.js";

defineParameterType({
  name: "cardType",
  regexp: /cypher|equipment|artifact|oddity|attack|ability|special ability/,
  transformer: (s) => s.replace(" ", "-") as keyof typeof CARD_CONFIGS,
});
defineParameterType({
  name: "badge",
  regexp: /Current XP|Total XP|Shins|Armor|Max Cyphers|Effort/,
  transformer: (s) => FIELD_TEST_IDS[s], // moved here from common-steps.ts
});
defineParameterType({ name: "textarea", regexp: /background|notes/, transformer: (s) => s });
defineParameterType({
  name: "resource",
  regexp: /shins|armor|effort|max cyphers/,
  transformer: (s) => RESOURCE_FIELDS[s], // "max cyphers" → "maxCyphers"
});
```

Why parameter types rather than `{string}` + lookup map inside each step: the
regexp makes an unknown word a **compile-time undefined step** (Cucumber reports
it before running) instead of a runtime `throw new Error("Unknown …")` inside
the step body — which is exactly what hid the §4a bug. It also ends the
`"special ability"` vs `"special-ability"` mismatch (§4e) at the one place the
word is translated.

Caveat to verify first: `cucumber.js` loads `support/**/*.ts` before
`step-definitions/**/*.ts`, so parameter types are registered before use. Run
one feature to confirm the tsx loader handles the file.

### 3.2 `this.dom` (M)

- `world.ts`: add `dom!: DOMHelpers`; `hooks.ts` `Before`: `this.dom = new DOMHelpers(this.page)` right after page creation.
- Migrate the 8 files with 101 `new DOMHelpers(this.page)` instantiations, one file per commit; delete the local `const dom = …` lines.
- Done when `grep -r "new DOMHelpers" tests/e2e/step-definitions` is empty.

### 3.3 `this.storageHelper` everywhere (S)

- Replace the 27 `new TestStorageHelper(this.page!)` in 5 files with `this.storageHelper` (already constructed in `Before`; after 2.3 it is constructed earlier, so it is safe in every step).
- Done when `grep -r "new TestStorageHelper" tests/e2e/step-definitions` is empty.

### 3.4 `this.modal` (M) — `tests/e2e/support/modal.ts`

```ts
export class ModalDsl {
  constructor(private page: Page) {}
  confirm(): Promise<void>; // click modal-confirm-button, wait for edit-modal hidden
  cancel(): Promise<void>;
  tapConfirm(): Promise<void>; // hasTouch is on in Before; tap variants stay
  type(text: string): Promise<void>;
  clearInput(): Promise<void>;
  expectOpen(): Promise<void>;
  expectClosed(): Promise<void>;
}
```

Then in `common-steps.ts`:

- `I click the Confirm button` ×5 and `I click the modal confirm button` ×22 →
  both registered as `When("…", confirmStep)` with one shared function (Cucumber
  permits the same function under two expressions). Same for Cancel (×1 / ×2).
  Optional follow-up: migrate the 6 minority feature lines to the dominant
  phrasing and drop the second registration — a feature-file-only commit.
- `I type {string} into the input field` ×8 and `… in the input field` ×15 →
  one function.
- Delete the now-duplicated bodies.

### 3.5 `this.fields` (M)

- Move `FIELD_TEST_IDS` / `getTestId()` from `common-steps.ts` to
  `support/fields.ts`; expose `click(field)`, `tap(field)`, `hover(field)`.
- The six hand-written badge steps (`common-steps.ts:105-133`) and four field
  steps (`:146-164`) become **one registration each** using `{badge}`:
  `When("I click the {badge} badge", …)`, `When("I tap the {badge} badge", …)`,
  `When("I hover over the {badge} badge", …)`. The tap/hover gaps the analysis
  notes (§4b) close for free — every badge gets all three verbs.
- Existing Gherkin (`I click the Current XP badge`) matches unchanged.

### 3.6 `this.cards` (L) — the card DSL

- Lift `setupCharacterWithCards`, `givenCharacterHasCards`, `clickAddButton`,
  `clickEditButton`, `thenShouldSeeCards` from `card-creation.steps.ts` into
  `support/cards.ts` as a `CardsDsl` class over `CARD_CONFIGS`; add
  `clickDeleteButton(type, index)`, `count(type)`.
- `card-creation.steps.ts` migrates first (it already uses the fixtures; this is
  a move, not a rewrite).
- `card-deletion.steps.ts`: delete `getDeleteButtonSelector()` (`:7`) and
  `getCardCount()` (`:21`); the triplicated delete-click (`:164-182`) becomes
  one call; the 7 remaining per-type `Then … remaining` steps collapse to
  `Then("I should have {int} {cardType}(s) remaining", …)` — check each live
  phrasing against the feature file before collapsing; where singular/plural
  wording differs, use Cucumber optional text `(s)` / alternation rather than
  editing the feature.
- The `{cardType}` parameter type replaces every `Record<string, string>`
  lookup keyed by card name in both files.

### 3.7 `this.setup.character(overrides)` (M) — `tests/e2e/support/setup.ts`

The `storageHelper.setCharacter → page.reload → waitForCharacterSheetReady`
sequence appears 24 times. One method:

```ts
async character(overrides: Partial<Character> = {}): Promise<void> {
  await this.storage.setCharacter({ ...FULL_CHARACTER, ...overrides }); // FULL_CHARACTER import lands in Phase 5; until then BASE_CHARACTER
  await this.page.reload();
  await waitForCharacterSheetReady(this.page);
}
```

`resource-tracker-editing.steps.ts`: the 4 live per-field `Given`s become two
registrations of one function — `Given("the character has {int} {resource}", …)`
for `shins`/`armor` and `Given("the character has {resource} {int}", …)` for
`max cyphers`/`effort` (the feature files use both word orders) — both calling
`this.setup.character({ [field]: value })`. Then migrate the other
files' inline sequences one file per commit.

### 3.8 `{textarea}` in `additional-fields-editing.steps.ts` (M)

After Phase 1 removed the dead `field` blocks, the live `background textarea` /
`notes textarea` blocks are parameterised: `When("I click the {textarea} textarea", …)`
etc. Expect the file to roughly halve again.

### 3.9 Typed cross-step state (S)

- Declare on `CustomWorld` only what is actually read back: e.g.
  `previousCardCount?: number` (from 2.1), `exportedFile?: …`,
  `lastError?: string`. Delete `testContext?: Record<string, any>` once its 3
  users are migrated (it is `any`, which Rule 5 forbids).
- Move the module-level `let` globals in `auto-save-indicator`,
  `character-file-export`, `data-validation` onto the World. World is
  constructed per scenario, so the reset-between-scenarios problem disappears
  without touching `hooks.ts`.

### 3.10 `this.page!` → `this.page` sweep (S)

`page` is typed as required. Mechanical replace across 10 files, one commit.
Then enable `@typescript-eslint/no-non-null-assertion` for
`tests/e2e/**` so it stays gone.

---

## 5. Phase 4 — One unit-test character factory

Goal: the factory `docs/rules/testing.md` already prescribes, actually used.

### 4.1 Create `tests/factories/character.ts` (S)

- `createTestCharacter(overrides: Partial<Character> = {}): Character`.
- Default shape = the `createBaseCharacter()` body (it is the most-copied one,
  5 files, and its values are asserted on by the diff/description tests, so
  they migrate with zero edits).
- Also export `createEmptyCharacter` and `createCharacterWithItems` (moved from
  `testSetup.ts`) as named presets built on `createTestCharacter`.
- Import `Character` relatively (`../../src/types/character.js`), as the
  existing helpers do — `RULE_VIOLATIONS.md` #1 notes the `@/` alias is
  unverified under the E2E tsx loader, and this file will be shared with E2E in
  Phase 5. Switch to `@/` when that sweep happens.
- Fix the path in `docs/rules/testing.md:308` from `test/factories/` to
  `tests/factories/` (the repo has no `test/` directory).

### 4.2 Migrate, one file per commit, cheapest first

| Step | Files                                                                                                                                                                   | Change                                                                                                                    |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| a    | `diffDescriptions`, `changeDetection`, `characterDiff`, `versionDescriptions` (byte-identical)                                                                          | Delete local `createBaseCharacter`; `import { createTestCharacter as createBaseCharacter }` — or rename call sites.       |
| b    | `diffCharacterSheet` (identical minus `portrait`)                                                                                                                       | `createTestCharacter({ portrait: undefined })` — check whether the missing portrait is load-bearing for that suite first. |
| c    | `helpers/testSetup.ts` `createMockCharacter` (2 consumers)                                                                                                              | Re-export `createTestCharacter` as `createMockCharacter`, migrate the 2 consumers, delete the alias.                      |
| d    | `helpers/containerTestSuite.ts` `createMockCharacter` (4 consumers)                                                                                                     | Its shape differs — diff it against the factory default; pass the differences as overrides at call sites.                 |
| e    | `characterFieldUpdate` (`makeCharacter`), `characterSheetLayout`, `versionHistory`, `versionDescriptionMigration`, `versionState`, `compareView` (`(name) =>` variants) | One file each: `createTestCharacter({ name })`.                                                                           |

Done when `grep -rE "function (createMockCharacter|createBaseCharacter|makeCharacter)" tests/unit` is empty and `npm run test:unit` is still 869.

### 4.3 `setupTestContainer()` adoption (M)

16 files hand-roll `document.createElement("div")` + append + remove. Migrate
one file per commit onto `setupTestContainer()` from `testSetup.ts`. Done when
the grep count is 0 outside `helpers/`.

---

## 6. Phase 5 — One default character across unit, E2E and demo data

Goal: three "Kael the Wanderer" literals become one import.

1. **Prove they are equal first.** One-off script: deep-compare
   `cardTestFixtures.ts` `BASE_CHARACTER` (+ empty card arrays) with
   `src/data/mockCharacters.ts` `FULL_CHARACTER`. If they differ, the E2E suite
   has been testing a stale copy — record the diff in the commit message and
   decide field by field which is right _before_ switching.
2. `cardTestFixtures.ts`: replace `BASE_CHARACTER` with
   `import { FULL_CHARACTER } from "../../../src/data/mockCharacters.js"`.
   `common-steps.ts` `defaultValues` (from 2.6) is derived from the same import.
3. Replace the remaining inline E2E fixtures with overrides on that base:
   `data-validation.steps.ts:9-47` `VALID_CHARACTER`,
   `character-file-import.steps.ts:7` `TEST_CHARACTERS`, and the **two**
   character literals in `resource-tracker-editing.steps.ts` (`~30-69`, `~81+`).
4. Unit default stays small and neutral (the diff tests need known, minimal
   values). Add `fullCharacter(overrides)` to `tests/factories/character.ts`
   for tests that need the demo shape, so both suites import the same file.

Decision recorded: **unit default ≠ demo character, deliberately.** The
analysis suggests tracking `FULL_CHARACTER` "where the two aren't required to
diverge"; the diff/description tests are required to diverge, and a single
factory file with two named presets is simpler than a merged default.

---

## 7. Phase 6 — Guardrails and docs

| Guardrail                                  | Mechanism                                                                                                                                                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No dead step definitions                   | `npm run check:steps` (2.1) added to `.husky/pre-commit` after `check:i18n`, and to the CI workflow.                                                                                                            |
| Step catalog never stale                   | Same `check:steps` call fails when `tests/e2e/STEP_CATALOG.md` differs from a fresh `docs:steps` run; optionally have pre-commit run `docs:steps` and `git add` the result, as lint-staged does for formatting. |
| New feature files reuse existing phrases   | `docs/rules/workflow.md` Guidelines and `docs/rules/testing.md` BDD section point at the catalog (done in this branch); Phase 7's phrasing conventions are added there once decided.                            |
| Step files reuse World, not re-instantiate | ESLint `no-restricted-syntax` for `NewExpression[callee.name=/DOMHelpers\|TestStorageHelper/]` scoped to `tests/e2e/step-definitions/**`.                                                                       |
| Step files don't import from each other    | ESLint `no-restricted-imports` pattern `../step-definitions/*` / `./*.steps` scoped to step-definitions.                                                                                                        |
| No ad hoc character literals in unit tests | ESLint `no-restricted-syntax` for `FunctionDeclaration[id.name=/create(Mock\|Base)Character\|makeCharacter/]` in `tests/unit/**`.                                                                               |
| No `this.page!`                            | `@typescript-eslint/no-non-null-assertion: error` for `tests/e2e/**` (3.10).                                                                                                                                    |
| Docs match reality                         | `docs/rules/testing.md`: fix factory path; add a short "E2E World DSL" section listing `this.dom / modal / cards / fields / setup` and the parameter types, with the rule "look here before writing a locator". |

---

## 8. Phase 7 — Consolidate wording in the feature files

Phases 1–6 deliberately leave `.feature` files alone (Principle 1). Phase 7 is
the one place where the Gherkin itself changes: the suite says the same thing
in several ways, and every synonym family is one more definition to maintain
and one more way for a new author to guess wrong. After Phase 3, most
families are already registered against a single function, so this phase is
almost entirely feature-file edits plus deleting the secondary registrations.

### 7.1 Inputs

- [`tests/e2e/STEP_CATALOG.md`](./e2e/STEP_CATALOG.md) — the full phrase list
  with usage counts (regenerate with `npm run docs:steps`).
- A near-duplicate scan over the **live** catalog rows (normalised tokens,
  Jaccard ≥ 0.75, same keyword) yields 122 candidate pairs; the ones that are
  genuine synonyms are in 7.3. The scan is a one-off analysis aid, not a
  guardrail — keep it out of the repo.

### 7.2 Phrasing conventions to adopt

Decide these first (one short section added to `docs/rules/testing.md` under
"BDD Feature Files"), then migrate to them. Proposed:

| Pattern                         | Canonical form                                                                                                           | Not                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Click a labelled button         | `I click the "Confirm" button` (quoted, visible label)                                                                   | `I click the Confirm button`, `I click the modal confirm button`, `I click the new button` |
| Type into the open modal        | `I type "x" in the modal input`                                                                                          | `… in the input field`, `… into the input field`                                           |
| Assert modal input              | `the modal input should contain "x"`                                                                                     | `the input field should contain "x"`                                                       |
| Modal button state              | `the modal confirm button should be disabled`                                                                            | `the confirm button should be disabled`                                                    |
| Counts of cards                 | `I should see 3 cypher cards` — `card(s)` optional in the definition                                                     | `I should see 1 cypher card` as a **separate** definition                                  |
| Set a resource on the character | `the character has 47 shins` / `the character has armor 2` (one word order per resource, as the parameter type dictates) | `the character has armor value 2`                                                          |
| Badge assertions                | `the Armor badge should show "2"`                                                                                        | `the armor badge should show value "2"`                                                    |
| Basic-info fields               | `the descriptor should display "x"`                                                                                      | `the descriptor field should display "x"`                                                  |
| Given-state, no article noise   | `the character has a version with a name change`                                                                         | `… with name change`                                                                       |
| Capitalisation                  | Match the UI label inside quotes; lowercase elsewhere                                                                    | `I click the Export button` vs `I click the export button`                                 |

Rule of thumb for anything not in the table: **the phrasing with the most uses
wins**, unless a generic parameterised pattern already exists — then the
generic one wins.

### 7.3 Synonym families to collapse (live steps only, counts = feature lines)

| Family                       | Phrasings today                                                                                                                                                                                            | Lines to edit | Definitions removed |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------: | ------------------: |
| Modal confirm / cancel       | `I click the Confirm button` 5 · `I click the modal confirm button` 22 · `I click the Cancel button` 1 · `I click the modal cancel button` 2                                                               |            30 |                   3 |
| Type in modal                | `I type {string} in the modal input` 17 · `… in the input field` 15 · `… into the input field` 8                                                                                                           |            23 |                   2 |
| Assert modal input           | `the modal input should contain` 6 · `the input field should contain` 4                                                                                                                                    |             4 |                   1 |
| Confirm disabled             | `the modal confirm button should be disabled` 1 (resource-tracker) · `the confirm button should be disabled` 1 (basic-info)                                                                                |             1 |                   1 |
| New / Export buttons         | `I click the "New" button` 2 · `I click the New button` 4 · `I click the new button` 1 · `I click the Export button` 7 · `I click the export button` 5                                                     |            12 |                   3 |
| Card counts singular/plural  | `I should see {int} cypher card` 2 vs `… cards` 13; `I should have {int} cypher remaining` 3 vs `… cyphers remaining` 1; `the character has {int} <type> card(s)` (7 types)                                |            ~6 |                 ~10 |
| Delete-button target         | `I click the delete button on the first cypher` 4 · `… on the first cypher card` 2                                                                                                                         |             2 |                   1 |
| Armor                        | `the character has armor value {int}` 1 (combat) · `the character has {int} armor` 5; `the armor badge should show value` 1 · `the Armor badge should show` 4                                              |             2 |                   2 |
| Basic-info display           | `the descriptor should display` 2 · `the descriptor field should display` 2 (same for focus); `I click on the descriptor {string}` 2 · `I click on the descriptor field` 2                                 |             6 |                   4 |
| Version wording              | `… a version with a name change` 2 · `… with name change` 1; `should match version {int}` 4 · `… version {int} data` 1                                                                                     |             2 |                   2 |
| Ability vs special ability   | `the character has no abilities` / `no special abilities`, `I should see an empty abilities section` / `… special abilities section`, add/edit/fill steps ×2 — all become one `{cardType}` step each (3.1) |             0 |                  ~8 |
| Ordered lists (2 vs 3 names) | `the character has {int} cyphers named {string}, {string}` and the 3-name twin (also abilities, "should be in order") — one definition taking a comma-separated `{string}` list                            |             9 |                   4 |

Roughly **100 feature lines** and **~40 definitions**. Every edit is a
mechanical find-and-replace within one file; do one family per commit so the
diff reads as "renamed a phrase", and run only the affected feature files.

### 7.4 Fix the rules-doc example

The worked example in `docs/rules/testing.md` (§"BDD Feature Files") uses
`I have a character with:` (data table), `I spend 3 points from Might`,
`Might current should be 9` — **none of which exist as step definitions.** A
template that models invented phrasing is a root cause of the drift this
phase cleans up. Replace the example with a real scenario copied from the
suite (e.g. from `resource-tracker-editing.feature`) and add the catalog
pointer (already done in this branch) so the example and the vocabulary agree.

### 7.5 Triage the seven `@skip` scenarios with undefined steps

The catalog's "Feature lines with no matching step definition" section lists
24 lines, all in `character-display.feature:99-149` — seven `@skip` scenarios
(responsive layouts, cypher limit, special characters, long text, section
order) that were **never implemented**, which is a different reason from the
drag/drop skips `docs/TODO.md` documents. For each: either write the steps
(that is feature work with its own TODO entry) or delete the scenario. Leaving
them means the catalog carries a permanent warning block.

### 7.6 Ordering and verification

- Runs **after Phase 3** (which registers each synonym family against one
  function, so dropping a phrasing is a one-line deletion) and can run in
  parallel with Phases 4–5.
- 7.2 (conventions) is decided and committed to the docs before 7.3 starts.
- Per commit: edit the feature lines → delete the now-unused registration →
  `npm run docs:steps` (catalog shrinks by the removed definitions) →
  `npm run check:steps` (no dead steps, catalog current) →
  `npm run test:e2e -- tests/e2e/features/<affected>.feature` → full
  `npm run test:e2e:prod` before review. Scenario count stays 365 / 16
  (7.5 may change the skipped count — record the new baseline in `TODO.md`).

---

## 9. Ordering and dependencies

```
Phase 1 (delete)  ──►  Phase 2 (fixes)  ──►  Phase 3 (E2E DSL)  ──►  Phase 5 (shared fixture)  ──►  Phase 6 (guardrails)
                                        │                       └──►  Phase 7 (feature wording) ─┘
                                        └──►  Phase 4 (unit factory) ─┘
```

- Phase 1 first: everything after it is smaller because of it. 2.1 (the
  script) is the very first commit.
- Phases 3 and 4 are independent and can run in parallel branches; both must
  land before Phase 5 (which imports the factory into E2E fixtures).
- Phase 7 needs Phase 3 (single implementation per synonym family) and is
  independent of Phases 4–5. Phase 6's final pre-commit wiring waits for 7 so
  the catalog it locks in is the consolidated one.
- Inside Phase 3: 3.1 (parameter types) before 3.5–3.8; 2.3 before 3.3; 2.1
  before 3.6; 3.9 can go any time after 2.1.
- Phase 6 guardrails are added **as each one becomes satisfiable** (e.g. the
  `new DOMHelpers` lint rule lands in the last 3.2 commit), not as a final
  batch — otherwise a rule that fails on the current tree blocks the branch.

---

## 10. Risks and mitigations

| Risk                                                                                                                                            | Mitigation                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A "dead" step is actually reached by a `@skip`/`@wip`/`@deprecated` scenario that is filtered by `cucumber.js` `tags`.                          | 2.1's script matches against **all** feature lines regardless of tags, so tagged-out scenarios keep their steps. Re-verify against the tagged scenarios in `character-display.feature` (7 tags) and `section-rearrangement.feature` (9 tags) before deleting. |
| Parameter types not registered before step files under the tsx loader.                                                                          | `cucumber.js` `import` order already puts `support/**` first; confirm with a single feature run in 3.1 before building on it.                                                                                                                                 |
| `FULL_CHARACTER` and E2E `BASE_CHARACTER` have silently diverged.                                                                               | Phase 5 step 1 compares before switching; the diff, if any, is a finding in its own right.                                                                                                                                                                    |
| Collapsing per-type steps to `{cardType}` changes matching for singular/plural wording.                                                         | Run `npm run check:steps` after each collapse — any feature line that stops matching shows up as an _undefined step_ in the E2E run and as a dead definition in the script.                                                                                   |
| E2E suite is slow (`test:e2e:prod` builds first) and has 182 `waitForTimeout` calls, so a refactor commit can look flaky for unrelated reasons. | Run the affected feature file with `npm run test:e2e -- tests/e2e/features/<x>.feature` during work; run the full prod suite once per commit before review. Reducing `waitForTimeout` is out of scope here but is the obvious next analysis.                  |
| `parallel: 6` locally vs `1` in CI hides scenario-order coupling until the World-state move (3.9).                                              | 3.9 removes the module globals, which is the only source of cross-scenario state found.                                                                                                                                                                       |
| Reviewer fatigue: ~55 small commits.                                                                                                            | Group into one PR per phase (seven PRs); each PR's commits are individually revertable.                                                                                                                                                                       |
| Phase 7 rewrites ~100 Gherkin lines — a reviewer cannot tell a renamed phrase from a changed expectation.                                       | One synonym family per commit, feature-file edits and the definition deletion in the same commit, nothing else; `check:steps` proves no line became undefined and no definition became dead.                                                                  |

---

## 11. Definition of done and metrics

All measured from the repo root; "before" values are today's.

Note: `docs/TODO.md`'s "Current Status" claimed 754 unit tests; `npm run test:unit`
reports **869** today, so that line was stale and has been corrected. The E2E
figure (365 / 16) is taken from the same status block and has not been
re-measured here — run `npm run test:e2e:prod` once at the start of Phase 1
and record the real baseline before deleting anything.

| Metric                                    | Before        | Target after                     | Command                                                                                    |
| ----------------------------------------- | ------------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| Step definitions registered               | 864           | ≈ 650                            | `npm run docs:steps` (prints total)                                                        |
| Step definitions matching no feature line | 131           | 0 (enforced)                     | `npm run check:steps`                                                                      |
| Feature lines matching no definition      | 24            | 0                                | `npm run docs:steps` (catalog summary)                                                     |
| Live synonym families (7.3)               | 12            | 0                                | Re-run the 7.1 near-duplicate scan; catalog "Uses" column                                  |
| Catalog current                           | yes           | yes (enforced)                   | `npm run check:steps`                                                                      |
| `new DOMHelpers(` in step files           | 101 (8 files) | 0 (enforced)                     | `grep -rc "new DOMHelpers(" tests/e2e/step-definitions`                                    |
| `new TestStorageHelper(` in step files    | 27 (5 files)  | 0 (enforced)                     | `grep -rc "new TestStorageHelper(" tests/e2e/step-definitions`                             |
| Files using `this.page!`                  | 10            | 0 (enforced)                     | `grep -rl 'this\.page!' tests/e2e/step-definitions`                                        |
| Module-level `let` in step files          | 3 files       | 0                                | `grep -rlE '^let ' tests/e2e/step-definitions`                                             |
| Inline `setCharacter → reload` sequences  | 24            | 1 (in `support/setup.ts`)        | `grep -rc "reload()" tests/e2e/step-definitions`                                           |
| Character factory functions in unit tests | 12            | 1 file (enforced)                | `grep -rE "function (createMockCharacter\|createBaseCharacter\|makeCharacter)" tests/unit` |
| Unit files hand-rolling a container `div` | 16            | 0                                | `grep -rl 'document.createElement("div")' tests/unit --include=*.test.ts`                  |
| Independent "Kael the Wanderer" literals  | 3+            | 1 (`src/data/mockCharacters.ts`) | `grep -rl "Kael the Wanderer" src tests`                                                   |
| Unit tests passing                        | 869           | 869                              | `npm run test:unit`                                                                        |
| E2E scenarios passing / skipped           | 365 / 16      | 365 / 16                         | `npm run test:e2e:prod`                                                                    |

The two "passing" rows are the acceptance criterion for **every** commit, not
just the end state.

---

## 12. Suggested commit slicing (conventional commits)

```
chore(tests): add step catalog generator and check:steps          (2.1 — this branch)
test(e2e): remove 40 unreachable steps from additional-fields-editing
test(e2e): remove 39 unreachable steps from version-history
…                                                        (one per file, Phase 1)
test(unit): delete unused cardEditHelpers
test(e2e): assert real DOM removal in card-deletion steps          (2.1)
test(e2e): use auto-retrying toBeDisabled in basic-info-editing    (2.2)
test(e2e): clear storage through TestStorageHelper in Before hook  (2.3)
test(e2e): move waitForSaveComplete to support                     (2.4)
test(e2e): add cardType/badge/textarea/resource parameter types    (3.1)
test(e2e): expose DOMHelpers as this.dom on CustomWorld            (3.2, first)
test(e2e): use this.dom in combat steps                            (3.2, per file)
…
refactor(tests): add createTestCharacter factory                   (4.1)
test(unit): use shared factory in diffDescriptions                 (4.2a, per file)
…
test(e2e): import FULL_CHARACTER instead of duplicating it         (5.2)
docs(rules): adopt Gherkin phrasing conventions                    (7.2)
test(e2e): unify modal confirm/cancel phrasing in feature files    (7.3, per family)
test(e2e): unify modal input phrasing in feature files             (7.3, per family)
…
docs(rules): replace invented example scenario with a real one     (7.4)
chore(lint): forbid re-instantiating World helpers in step files   (6)
docs(rules): document the E2E World DSL and factory path           (6)
```

Each commit is presented for review before it is made (Rule 1). Messages do not
mention test state (Rule 7).
