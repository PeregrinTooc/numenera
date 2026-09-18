# Test Suite DSL Analysis

Date: 2026-09-18

## 1. Summary

Both suspicions that prompted this analysis are confirmed:

- **There is no single, common DSL** across the test suite. The E2E suite alone
  has at least four competing ways of interacting with the page (raw Playwright
  locators, an unattached `DOMHelpers` class, a table-driven test-id lookup, and
  a fixture+helper pattern used by exactly one feature area). The unit suite has
  at least **seven** independent `createMockCharacter`/`createBaseCharacter`
  implementations instead of one shared factory, and unit tests, E2E tests, and
  production demo data each maintain their own, non-overlapping "default
  character" fixture.
- **Duplicate Cucumber step definitions exist**, at the "different Gherkin
  phrasing, same or near-same implementation" level (Cucumber's ambiguous-step
  detection rules out literal duplicates). One duplication has already caused a
  real, reproducible bug (§4a).

Headline numbers:

| Suite                | Files                                                       | Step/test definitions                   | Shared helper adoption                                                           |
| -------------------- | ----------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------- |
| E2E (`tests/e2e/`)   | 24 feature files, 25 step-definition files, 6 support files | 864 `Given`/`When`/`Then` registrations | 1 of 25 step files fully reuses the one existing fixture+helper module           |
| Unit (`tests/unit/`) | 56 test files, 4 helper files (634 lines)                   | —                                       | ~23% of test files (13/56) use a shared helper; 1 helper file has zero consumers |

---

## 2. Current State: E2E Suite

### 2.1 `world.ts` is a connection holder, not a DSL

`tests/e2e/support/world.ts` defines `CustomWorld` with exactly:

```ts
browser?: Browser
context?: BrowserContext
page: Page
storageHelper: TestStorageHelper
testContext?: Record<string, any>
getBaseUrl(): string
```

There are no page-object or DSL methods on it at all — no `clickButton()`,
`fillField()`, `openModal()`. Every step-definition file has to independently
decide how to find elements, wait for state, and carry data between steps,
because nothing on `this` steers it toward a shared approach.

### 2.2 Four competing interaction styles

1. **Raw inline Playwright locators** with hardcoded `data-testid` strings —
   the dominant style, used throughout `version-history.steps.ts`,
   `section-rearrangement.steps.ts`, and parts of `combat.steps.ts`.
2. **`DOMHelpers` class** (`tests/e2e/support/dom-helpers.ts`) — wraps
   `page.locator('[data-testid="..."]')` with semantic methods
   (`getByTestId`, `hasClass`, `isVisible`, `getText`, …). It is never attached
   to `CustomWorld`; every consuming step re-instantiates it locally with
   `new DOMHelpers(this.page)`. Used across ~9 files including
   `character-display.steps.ts`, `combat.steps.ts`, `settings-gear.steps.ts`.
3. **A table-driven test-id lookup** — `common-steps.ts`'s `FIELD_TEST_IDS`
   map plus `getTestId()`, backing generic parameterized steps like
   `"I click on the {string} value"`.
4. **A fixture + local-helper pattern** — `tests/e2e/support/cardTestFixtures.ts`
   exports `CARD_CONFIGS` (per-card-type test-ids and sample data) and
   `card-creation.steps.ts` builds small helpers on top of it
   (`setupCharacterWithCards`, `clickAddButton`, `clickEditButton`,
   `thenShouldSeeCards`). This is the most consistent, DRY pattern in the
   suite — but it is used by exactly one file. Its sibling,
   `card-deletion.steps.ts`, tests the same 7 card types and instead
   reimplements its **own** parallel selector map
   (`card-deletion.steps.ts:7` `getDeleteButtonSelector`,
   `card-deletion.steps.ts:21` `getCardCount`), with a naming mismatch to boot
   (`"special ability"` with a space vs. `CARD_CONFIGS`'s `"special-ability"`
   key).

Further inconsistencies on top of these four styles:

- **Non-null assertions on `this.page` are split ~50/50** even though
  `CustomWorld.page` is typed as required (not optional): roughly 9 files use
  `this.page!.`, 15 use `this.page.`.
- **Cross-step state is carried four incompatible ways**: the typed
  `testContext` (used by only 3 of 25 files); untyped ad hoc properties
  bolted onto `this` at runtime (e.g. `combat.steps.ts`'s
  `this.testAttackName`, `this.testArmorValue`, none declared on
  `CustomWorld` and — confirmed by search — never read back anywhere, i.e.
  write-only dead state); module-level `let` globals outside any class (e.g.
  `auto-save-indicator.steps.ts:6-7`, `character-file-export.steps.ts:5-6`,
  `data-validation.steps.ts:6`) that are never reset in `hooks.ts`'s
  `Before`/`After` despite the suite running 6 parallel workers; and direct
  storage access via `TestStorageHelper`/IndexedDB.
- **`hooks.ts` bypasses `TestStorageHelper`'s own clear methods.** It clears
  storage by calling `window.__testStorage?.clearCharacterState()` /
  `window.__testVersionHistory?.clearVersions()` directly inside
  `page.evaluate`, duplicating exactly what `TestStorageHelper.clearStorage()`
  and `clearVersions()` already wrap — in the hook that runs before every
  single scenario.
- **Cross-file helper functions live inside step-definition files, not
  `support/`.** `waitForSaveComplete()` is defined in
  `auto-save-indicator.steps.ts:17-20` (a feature-specific step file) and
  imported by three unrelated files (`common-steps.ts`,
  `additional-fields-editing.steps.ts`, `recovery-damage-track.steps.ts`)
  instead of living in `support/` alongside `dom-helpers.ts`/`app-ready.ts`.
- **`TestStorageHelper` is reused as designed in only 3 of the files that use
  it** (via `this.storageHelper`, 58 uses); 5 other files instead construct a
  fresh `new TestStorageHelper(this.page!)` locally 27 times.

### 2.3 Support files: role today vs. intended role

| File                   | What it actually is                                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `world.ts`             | Connection holder only (browser/page/context/storageHelper)                                                                                                |
| `hooks.ts`             | Scenario lifecycle; duplicates storage-clearing logic instead of delegating to `TestStorageHelper`                                                         |
| `testStorageHelper.ts` | The one properly-adopted shared abstraction — but bypassed by `hooks.ts` and re-instantiated ad hoc in 5 files instead of reused from `this.storageHelper` |
| `dom-helpers.ts`       | A real DSL-shaped class, but not reachable from `this` — every consumer must know to import and instantiate it manually                                    |
| `cardTestFixtures.ts`  | The suite's best DSL pattern, adopted by exactly 1 of 25 step files                                                                                        |
| `app-ready.ts`         | Single well-scoped helper (`waitForCharacterSheetReady`), used correctly, no issues found                                                                  |

---

## 3. Current State: Unit Suite

### 3.1 Shared helpers exist, adoption is low

`tests/unit/helpers/` holds 4 files, 634 lines, ~15 exported functions:

- `testSetup.ts` — `setupTestContainer()`, `createMockCharacter()`,
  `createEmptyCharacter()`, `createCharacterWithItems()`,
  `createMockUpdateFn()`.
- `containerTestSuite.ts` — its own, differently-shaped `createMockCharacter()`
  plus `testContainerAddButton()`.
- `itemTestSuite.ts` — `testItemEditAndDelete()`, used consistently by 7 item
  component tests (`abilityItem.test.ts`, `cypherItem.test.ts`,
  `equipmentItem.test.ts`, `artifactItem.test.ts`, `oddityItem.test.ts`,
  `attackItem.test.ts`, `specialAbilityItem.test.ts`) — this is the one place
  in the unit suite where a shared helper is the norm, not the exception.
- `cardEditHelpers.ts` — 141 lines, 8 exported functions
  (`findEditButton`, `expectModalOpen`/`Closed`, `clickConfirmButton`,
  `clickCancelButton`, `pressEscapeKey`, `getEditableField`,
  `changeFieldValue`, `testCardEditWorkflow`, `testCancelEditWorkflow`). **Dead
  code** — a repo-wide search for these exports found no importer anywhere
  outside the file itself.

Only 13 of 56 unit test files (~23%) import a shared helper at all.

### 3.2 Independent character-fixture proliferation

At least **seven** separate functions build a `Character` fixture from
scratch instead of sharing one:

- `tests/unit/helpers/testSetup.ts:52` — `createMockCharacter(overrides)`
- `tests/unit/helpers/containerTestSuite.ts:8` — a different-shaped
  `createMockCharacter(overrides)`
- `tests/unit/versionState.test.ts:12` — local
  `createMockCharacter(name)`
- `tests/unit/compareView.test.ts:13` — another local
  `createMockCharacter(name)`, different shape again
- `tests/unit/characterSheetLayout.test.ts:17` — local
  `function createMockCharacter(): Character`
- `tests/unit/versionHistory.test.ts:9` — local
  `function createMockCharacter(): Character`
- `tests/unit/versionDescriptionMigration.test.ts:10` — local
  `function createMockCharacter(): Character`

On top of these, `diffDescriptions.test.ts`, `changeDetection.test.ts`, and
`characterDiff.test.ts` each independently define a **byte-for-byte
identical** `createBaseCharacter()` (same fields and values, lines 6-41 in
each), and `characterFieldUpdate.test.ts` defines yet another variant,
`makeCharacter()`. None of these reference each other or a common source.

Separately, at least 16 unit test files hand-roll
`document.createElement("div")` container setup instead of calling
`setupTestContainer()` from `testSetup.ts`.

### 3.3 A documented convention that was never implemented

`docs/rules/testing.md` (around lines 599-622), under "Test Data Management →
Use Factories," prescribes:

```ts
// test/factories/character.ts
export function createTestCharacter(overrides = {}) { ... }
```

No `test/factories/` directory and no function named `createTestCharacter`
exist anywhere in the repository. The documented single-factory-with-overrides
convention is aspirational; actual practice is the seven-plus independent
factories in §3.2.

### 3.4 No fixture sharing across unit, E2E, and production data

- `tests/unit/helpers/*.ts` — unit-only `createMockCharacter` variants, generic
  values (`name: "Test Character"`, small stat pools).
- `tests/e2e/support/cardTestFixtures.ts:7-33` — its own `BASE_CHARACTER`, a
  hand-copied duplicate of the production demo character below rather than an
  import of it.
- `src/data/mockCharacters.ts` — production demo data, `FULL_CHARACTER`
  ("Kael the Wanderer", tier 3, richer stat pools), consumed only by
  `src/main.ts`.
- Several other E2E step files add further independent inline fixtures:
  `data-validation.steps.ts:9-47` (`VALID_CHARACTER`),
  `character-file-import.steps.ts:7` (`TEST_CHARACTERS`), and
  `resource-tracker-editing.steps.ts`, which duplicates its own character
  literal **twice within the same file** (lines ~30-69 and ~81+).

None of unit, E2E, or production reference each other's fixture — three
independent "default character" definitions, with diverging sample data,
exist in the repository.

---

## 4. Confirmed Duplicate / Near-Duplicate Step Definitions

No two step definitions share identical literal Gherkin text anywhere in the
suite (Cucumber would refuse to run with an "ambiguous step" error if they
did — verified by diffing all extracted step phrases). All duplication below
is at the near-duplicate level: different phrasing, copy-pasted or
re-derived implementation.

**a) Confirm/Cancel button clicking, implemented 3 ways in one file — with a
resulting bug.** `tests/e2e/step-definitions/common-steps.ts`:

- `:82-92` `"I click the Confirm button"`
- `:184-194` `"I click the modal confirm button"` — byte-for-byte the same
  body as the above
- `:228-252` `"I click the {string}"` with its own internal `testIdMap` that
  _also_ maps `"Confirm button"`/`"confirm button"` to the same test-id

Same triple pattern exists for Cancel (`:94-102`, `:196-204`, and again inside
the `:228-252` `testIdMap`). The tap equivalent at `:254-273` has a
`testIdMap` containing only the lowercase `"confirm button"` key
(`:255-259`), silently missing the capitalized `"Confirm button"` key that the
click version has (`:230-233`). **A feature step `I tap the "Confirm button"`
would throw `Unknown element: "Confirm button"` while the click equivalent
works fine** — a direct, verifiable defect caused by maintaining three
parallel implementations of the same action instead of one.

**b) Badge/field click steps duplicating an existing generic step.**
`common-steps.ts:64-71` already provides a fully generic
`"I click on the {string} value"` driven by `FIELD_TEST_IDS`, which already
covers XP/Shins/Armor/Max-Cyphers/Effort badges and name/tier/descriptor/focus
fields. Six near-identical hand-written badge steps exist anyway
(`:105-133`), and four near-identical hand-written field steps
(`:146-164`), each just a thin duplicate of the generic step's logic with a
hardcoded test-id. The duplication produces visible asymmetry: only 2 of the
6 badges have a `tap` equivalent (`:135-143`), and only 2 of the 4 fields have
`tap`/`hover` equivalents (`:166-182`) — gaps that only exist because each was
hand-copied rather than derived from one parameterized implementation.

**c) Whole background-field step block copy-pasted as a notes-field block.**
`tests/e2e/step-definitions/additional-fields-editing.steps.ts` has a ~140-line
block of steps for the `character-background` textarea (`:259-394`) and an
almost line-for-line copy for `character-notes` (`:433-536`), including
duplicate pairs for click, clear, blur/click-outside, readonly/edit-mode
assertions, and empty-state checks — all differing only in the target
test-id, with no shared parameterized helper despite `common-steps.ts` in the
same codebase already demonstrating the `FIELD_TEST_IDS`-table pattern that
would collapse this.

**d) Incomplete "unify then replace" refactor.**
`resource-tracker-editing.steps.ts:10-13` introduces a documented "Unified
Given step ... Replaces 5 duplicate Given steps (XP, Shins, Armor, Max
Cyphers, Effort)" at line 14. The file still contains 4 of the 5 steps it
claims to replace, each re-implementing an identical
`setCharacter → wait → reload → waitForFunction` sequence with only the
field/test-id swapped: `:205-231` (shins), `:233-259` (armor), `:261-290`
(max cyphers), `:292-321` (effort). Direct evidence a prior consolidation was
started but never finished.

**e) `card-deletion.steps.ts` re-derives selectors instead of reusing shared
fixtures.** `card-creation.steps.ts` fully reuses `CARD_CONFIGS` from
`cardTestFixtures.ts` for all 7 card types. `card-deletion.steps.ts` instead
defines its own `getDeleteButtonSelector()` (`:7`) and `getCardCount()`
(`:21`) for the same 7 card types, with a naming mismatch
(`"special ability"` vs. `CARD_CONFIGS`'s `"special-ability"`) that makes it
easy to fix one file while silently breaking the other. Within the same file,
the delete-click action is itself triplicated: `:164-169`, `:171-176`,
`:178-182` all do the same `getDeleteButtonSelector("cypher", 0)` →
`.click()` → `waitForTimeout(100)`, with no shared helper (contrast with the
`clickAddButton`/`clickEditButton` helpers `card-creation.steps.ts` uses for
the equivalent action).

**f) No-op duplicate assertions.** `card-deletion.steps.ts:221-248` defines 7
nearly identical `Then` steps ("the cypher/equipment/artifact/oddity/attack/
ability/special-ability should be removed from the DOM"), and every one is
just `await this.page.waitForTimeout(100)` — a comment admits the real check
happens in a separate count-verification step. Seven duplicated step
definitions that individually assert nothing.

**g) Other identified near-duplicates:**

- Two steps for typing into the same input, differing only by preposition:
  `common-steps.ts:280-283` `"I type {string} into the input field"` vs.
  `:298-301` `"I type {string} in the input field"` — identical bodies.
- An identical `defaultValues` map of the 9 stat-pool defaults hardcoded
  twice, 60 lines apart, in two different `Then` steps
  (`common-steps.ts:430-440` and `:496-506`).
- "Confirm button disabled" implemented two different ways in two files:
  `resource-tracker-editing.steps.ts:445-448` uses Playwright's
  auto-retrying `expect(...).toBeDisabled()`; `basic-info-editing.steps.ts:147-151`
  uses a manual, non-retrying `isDisabled()` check of the same element —
  more flake-prone than its twin.
- "Open the settings panel" implemented twice for two feature areas:
  `settings-gear.steps.ts:59-65` (via `DOMHelpers`, with a documented wait
  for listener attachment) vs. `section-rearrangement.steps.ts:187-191`
  (raw locators, no wait) — same setup, two implementations of differing
  robustness.

---

## 5. Root Cause

**E2E side:** `world.ts` is a thin connection holder, not a DSL surface.
Nothing on `this` steers a new step definition toward an existing
abstraction — a step author has to already know that `DOMHelpers`,
`CARD_CONFIGS`, or `FIELD_TEST_IDS` exist and import them manually. Absent
that friction-free discovery path, each file (and often each step within a
file) re-derives its own way of finding elements, waiting for state, and
carrying data between steps. The one exception, `TestStorageHelper` exposed as
`this.storageHelper`, shows what happens when a helper _is_ wired onto
World: it gets reused correctly in the majority of cases (58 of 85 total
uses).

**Unit side:** the same root cause in different form — `docs/rules/testing.md`
documents a single-factory convention, but no tooling or review process
enforced it, so every new test file's author wrote their own fixture instead
of finding and importing the one that (partially) already exists in
`tests/unit/helpers/`.

---

## 6. Recommendations

These are recommendations only — no code was changed as part of this
analysis.

### Target shape

- **E2E:** attach the existing DSL-shaped pieces to `CustomWorld` instead of
  requiring per-file imports — e.g. `this.dom` (a `DOMHelpers` instance
  constructed once in `hooks.ts`'s `Before`), `this.cards` (wrapping
  `CARD_CONFIGS` and the add/edit/delete helpers currently local to
  `card-creation.steps.ts`), and `this.fields` (wrapping `FIELD_TEST_IDS`/
  `getTestId`). This gives every future step definition an obvious, discoverable
  place to reuse rather than reinvent.
- **Unit:** collapse the seven-plus `createMockCharacter`/`createBaseCharacter`
  variants into the one factory `docs/rules/testing.md` already specifies
  (`createTestCharacter(overrides)`), ideally shaped so its default output can
  reasonably track `src/data/mockCharacters.ts`'s `FULL_CHARACTER` where the
  two aren't required to diverge. Either delete `cardEditHelpers.ts` or wire it
  into the (apparently intended) card-edit-modal tests it was written for.

### Prioritized, incremental path

1. Finish the resource-tracker consolidation already started in
   `resource-tracker-editing.steps.ts` — delete the 4 leftover duplicate
   `Given` steps now that the unified one covers them.
2. Fix the confirm/cancel tap-step bug (§4a) as a quick, low-risk correctness
   fix, and collapse the 3 parallel confirm/cancel implementations into one.
3. Unify `card-creation.steps.ts` and `card-deletion.steps.ts` on the same
   `CARD_CONFIGS` source of truth, removing `card-deletion.steps.ts`'s private
   selector map and the `"special ability"`/`"special-ability"` mismatch.
4. Introduce the single shared character factory for unit tests and migrate
   test files off the ad hoc variants; delete the now-redundant ones.
5. Wire `DOMHelpers` and the card/field fixtures onto `CustomWorld` so new
   step definitions have a default path to reuse instead of reimplementing.

Each step is independently valuable and can be done as its own small,
reviewable change, consistent with the project's "make the change easy, then
make the easy change" rule.
