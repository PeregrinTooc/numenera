# Remaining Test Tech-Debt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task (the maintainer chose it). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear the remaining test-suite debt listed in `docs/TODO.md` after PR #9:

- both "🚨 Must-Have" entries
- all four "🧹 Should-Have" entries
- the wider debt found while planning (22 step definitions with empty bodies, a markup check that can never fail, and an `iPad Pro` device descriptor that doesn't exist)

When it's done, every step does what it says, and Rule 9 is enforced by the suite CI runs.

**Architecture:** Mostly test-only. The changes go into the Cucumber/Playwright layer: the World DSL (`this.setup`), `tests/e2e/support/`, and step definitions. Rule 9 enforcement is new infrastructure:

- `tests/e2e/support/device.ts` resolves a `DEVICE` env var to a Playwright device descriptor and browser engine.
- `hooks.ts` uses it.
- CI runs the suite once per device in a job matrix.

The plan touches production code in two places: the attack-card CSS (Task 6), and any real responsive bugs the device triage finds (Task 8). Each of those bugs gets its own scenario-first fix.

**Tech Stack:** Cucumber-js (Gherkin) + Playwright (`chromium`, `webkit`, `devices`), Vitest for the one pure helper, TypeScript strict, GitHub Actions matrix, `scripts/step-catalog.js` (`npm run docs:steps` / `npm run check:steps`).

**Spec:** No separate spec. The requirements come from:

- maintainer decisions (2026-10-03): Rule 9 is enforced by running the whole Cucumber suite once per device profile, skipping only `@desktop-only` scenarios (Task 8). Execution is subagent-driven.
- `docs/TODO.md` as merged with PR #9 (`821bc78`): the two "🚨 Must-Have (Technical Debt)" entries and the four "🧹 Should-Have (Minor Debt)" entries
- findings made on 2026-10-03 while planning, listed below. Each one is verified against the code.

1. **22 step definitions have empty bodies.** They are listed in Task 4's table. The "ignored table" in the TODO is one of 8 setup Givens that seed nothing. 7 `… should use translation keys` Thens assert nothing.
2. **`devices["iPad Pro"]` is `undefined`.** `playwright.config.ts`'s "Tablet" project spreads `undefined`, so it's a plain desktop context. The real descriptor is `"iPad Pro 11"` (834×1194, WebKit). Verified with `node -e 'require("@playwright/test").devices["iPad Pro"]'`.
3. **There are five viewport steps, not four.** `I am viewing on a mobile device with width {string}` (6 uses) also overlaps. `I am using a mobile device` sets **768 px**, which `isPhoneViewport()` (`src/utils/viewport.ts`, `min-width: 768px`) treats as _not_ a phone. Its user-agent spoof is dead: nothing in `src/` reads `navigator.userAgent`.
4. **`no markup from the text should be rendered as HTML` can never fail** (reported by the PR #9 review session). It looks for an `<unknown>` element, but `<Unknown Location>` only appears in the Background textarea, which can never parse markup. The Name, `Kael <The Swift> …`, would become a `<the>` element.

**Out of scope:** the "Tracked elsewhere" bullets.

- The `docs/RULE_VIOLATIONS.md` "Open" items are production-code refactors of about 40 files: `@/` aliases, 193 `any`s, 8 files over 300 lines, swallowed storage errors and `console.log`.
- The `beforeunload` decision in `docs/IMPLEMENTATION_PLAN.md`.

Each of these is its own subsystem and gets its own plan. The `@skip`ped Grid Merge/Split scenarios in `section-rearrangement.feature` are a backlog feature. **Don't touch them**, including the no-op `the sections should remain in single-column layout` that only they use.

## Global Constraints

- CLAUDE.md's 11 rules apply. The ones that bite here:
  - **Rule 1:** present each task's diff and test results for review before committing, unless the maintainer has said to commit without review.
  - **Rule 2:** a behaviour change starts in a `.feature` file. Production fixes in Tasks 6 and 8 start with a scenario that fails.
  - **Rule 7:** conventional commits (`test(e2e): …`, `fix(attacks): …`, `ci(e2e): …`), one `-m` per paragraph, chain with `&&`, don't mention test state.
  - **Rule 8:** before each commit, `npm run test:unit`, `npm run lint` and the touched feature files (`npm run test:e2e -- <file>`) pass.
  - **Rule 10:** one failing test at a time.
- **Rule 5:** no new `any`. Where a touched line already uses `any`, give it the real type, or `unknown` plus a narrowing step.
- Never call `cucumber-js` directly. Use `npm run test:e2e -- <feature file> [--name "…"]` or `npm run test:e2e:prod`.
- Every task that adds, removes or renames a step definition ends with `npm run docs:steps`. The regenerated `tests/e2e/STEP_CATALOG.md` goes in the same commit, and `npm run check:steps` must pass.
- **Seeding a step proves nothing while the seeded value equals the default.** Whenever a no-op Given gets wired up, first change its Gherkin values so they differ from `FULL_CHARACTER` (`src/data/mockCharacters.ts`). Watch the scenario fail, then wire the step. This is the Red step for Tasks 2 and 4.
- Imports from `src/` into `tests/e2e/` use the existing relative style (`../../../src/…js`). Don't introduce `@/` there (see `docs/RULE_VIOLATIONS.md` §1).
- Baseline (PR #9 head `e6732b3`): **901** unit tests. **412** E2E scenarios passing and **7** `@skip`ped. **681** step definitions.

## Review Focus

1. **A seeded value that equals the default.** For example, `Kael the Wanderer` in a Background that `FULL_CHARACTER` already holds. The wired step then passes whether it works or not. Task 2, Step 1 and Task 4, Step 2 change the Gherkin values first, so each wiring is seen failing.
2. **A missing translation key, not just a hard-coded string.** i18next returns the raw key (`character.doesNotExist`) when a key is missing. A check that only looks for _known_ keys would miss exactly that case. Task 4's `no untranslated text keys should be visible` matches by namespace, and Task 4, Step 6 sabotages it with a missing key.
3. **Export on WebKit.** The iPhone 12 and iPad Pro 11 profiles run WebKit, which has no `showSaveFilePicker`, so export goes through the async blob path. That path never ran before Task 7. Task 5 makes a failed blob fetch surface as an error rather than a timeout. Task 8's WebKit runs exercise it.
4. **A comparison-view scenario that sets the viewport _after_ load.** `isPhoneViewport()` runs at bootstrap (`src/main.ts:224`). A step that resizes without reloading leaves the app in its previous mode. Task 1, Step 5 checks the version-comparison scenarios still pass after the step collapse. Each of them navigates after resizing.
5. **The desktop profile staying byte-identical.** `DEVICE` unset must produce today's context: `Desktop Chrome`, `hasTouch: true` and `en-US`. A drifting default would break every scenario at once. Task 7, Step 1 pins it in a unit test.

---

## File Structure

| File                                                                                                    | Responsibility                                                                | Tasks         |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------- |
| `tests/e2e/step-definitions/viewport.steps.ts` (new)                                                    | the single viewport step, `the viewport is {int} pixels wide`                 | 1             |
| `tests/e2e/step-definitions/{additional-fields-editing,basic-info-editing,version-comparison}.steps.ts` | lose their viewport duplicates                                                | 1             |
| `tests/e2e/step-definitions/character-display.steps.ts`                                                 | table Givens seed real data. The verbatim check can fail. Loses vacuous Thens | 1, 2, 3, 4    |
| `tests/e2e/support/tableRows.ts` (new)                                                                  | turns Gherkin tables into typed character fragments                           | 2, 4          |
| `tests/e2e/support/i18nKeys.ts` (new)                                                                   | builds the "raw i18n key" regex from `en.json`'s namespaces                   | 4             |
| `tests/e2e/step-definitions/{combat,basic-info-editing,section-rearrangement,version-history}.steps.ts` | no-op steps wired or deleted                                                  | 4             |
| `tests/e2e/support/exportCapture.ts`                                                                    | its own timeout, and blob errors surface                                      | 5             |
| `src/components/AttackItem.ts`, `src/styles/components/attack-item.css`                                 | long attack names wrap, and badges stay right-aligned                         | 6             |
| `tests/e2e/support/device.ts` (new) + `tests/unit/e2eDevice.test.ts` (new)                              | `DEVICE` → descriptor + engine                                                | 7             |
| `tests/e2e/support/hooks.ts`, `playwright.config.ts`                                                    | use the device profile, and fix `iPad Pro` → `iPad Pro 11`                    | 7             |
| `tests/e2e/features/*.feature`                                                                          | vocabulary swaps, real values, `@desktop-only` tags                           | 1, 2, 4, 6, 8 |
| `.github/workflows/deploy.yml`                                                                          | E2E job matrix over the four devices                                          | 9             |
| `docs/rules/testing.md`, `docs/TODO.md`, `CLAUDE.md`                                                    | how Rule 9 is enforced; new baseline                                          | 9, 10         |

Task order follows Rule 6. Tasks 1–5 make the suite honest at the desktop profile. Tasks 7–9 then multiply it across devices, so device triage isn't confused by steps that never ran.

---

### Task 1: One viewport step

**Files:**

- Create: `tests/e2e/step-definitions/viewport.steps.ts`
- Modify: `tests/e2e/step-definitions/character-display.steps.ts` (remove `the viewport is {int} pixels wide` and `the character has a {int}-character background without spaces`)
- Modify: `tests/e2e/step-definitions/additional-fields-editing.steps.ts:309-324` (remove `I am using a mobile device`)
- Modify: `tests/e2e/step-definitions/basic-info-editing.steps.ts:298-304` (remove `I am viewing on a mobile device with width {string}`)
- Modify: `tests/e2e/step-definitions/version-comparison.steps.ts:417-423` (remove the phone/tablet-width steps)
- Modify features: `additional-fields-editing`, `resource-tracker-editing`, `section-rearrangement`, `basic-info-editing`, `version-comparison`, `character-display`

**Interfaces:**

- Produces: the Gherkin step `the viewport is {int} pixels wide`, the only viewport step. Tasks 6 and 8 use it.

- [ ] **Step 1: Move the canonical step to its own file**

```ts
// tests/e2e/step-definitions/viewport.steps.ts
import { Given } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

// The only viewport step. Scenarios that need a particular width say so in
// pixels; device-wide coverage comes from the DEVICE profile (hooks.ts).
// Resizing does not reload: if the app must boot at this width (anything
// that reads isPhoneViewport() at startup), navigate after this step.
Given("the viewport is {int} pixels wide", async function (this: CustomWorld, width: number) {
  await this.page.setViewportSize({ width, height: 800 });
});
```

Delete the old definition from `character-display.steps.ts`.

- [ ] **Step 2: Rewrite the Gherkin lines**

| Old line                                             | New line                           | Uses                                                                                                        |
| ---------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `I am using a mobile device`                         | `the viewport is 768 pixels wide`  | 9 (keeps today's real width; the scenarios' touch gestures rely on the context's `hasTouch`, not the width) |
| `I am viewing on a mobile device with width "375px"` | `the viewport is 375 pixels wide`  | 6                                                                                                           |
| `I am using a phone-width viewport`                  | `the viewport is 390 pixels wide`  | 1                                                                                                           |
| `I am using a tablet-width viewport`                 | `the viewport is 1024 pixels wide` | 1                                                                                                           |

The scenario titles that say "on mobile devices" stay as they are. They describe intent, and Task 8 runs them on real phone profiles.

- [ ] **Step 3: Delete the dead 600-character background**

In `character-display.feature`'s overflow outline, remove `And the character has a 600-character background without spaces`. Delete its definition too: a textarea wraps internally, so the step pins nothing. Also reword the comment above the outline:

```gherkin
    # Widths below every device profile's (320) and at each profile's own width,
    # so the check holds even when the suite runs only the desktop profile.
```

- [ ] **Step 4: Remove the old definitions, then regenerate the catalog**

Delete the four old step functions listed under **Files**. The user-agent `addInitScript` and the reload in `I am using a mobile device` go with them, since nothing in `src/` reads the UA. Run `npm run docs:steps && npm run check:steps`.
Expected: `✅ All 676 step definitions are used …` (681 − 5).

- [ ] **Step 5: Run every affected feature**

```bash
npm run test:e2e -- tests/e2e/features/additional-fields-editing.feature tests/e2e/features/resource-tracker-editing.feature tests/e2e/features/section-rearrangement.feature tests/e2e/features/basic-info-editing.feature tests/e2e/features/version-comparison.feature tests/e2e/features/character-display.feature
```

Expected: all pass. If a section-rearrangement touch scenario fails, it relied on the old reload. Add `And I am on the character sheet page` after the viewport line in that scenario only, and note it in the commit body.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e && git commit -m "test(e2e): collapse five viewport steps onto the viewport is N pixels wide" -m "I am using a mobile device set 768px (not a phone width to the app) and spoofed a user agent nothing reads. Drop the 600-character background from the overflow outline; a textarea wraps internally." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Table Givens in `character-display.feature` seed what they say

Must-Have #2, widened to the five sibling table Givens in the same file. Today all six discard their table.

**Files:**

- Create: `tests/e2e/support/tableRows.ts`
- Modify: `tests/e2e/step-definitions/character-display.steps.ts` (lines 8–12, 47–49, 68–70, 90–96, 125–158)
- Modify: `tests/e2e/features/character-display.feature`
- Check: `tests/e2e/features/basic-info-editing.feature:7-14` (same Background; values stay as they are because its scenarios click "Kael the Wanderer")

**Interfaces:**

- Produces (`tests/e2e/support/tableRows.ts`), used again in Task 4:

```ts
import type { DataTable } from "@cucumber/cucumber";

/** A vertical `| Property | Value |` table → { property: value } with lower-cased keys. Header row is skipped. */
export function propertyTable(table: DataTable): Record<string, string>;

/** A horizontal table with a header row → rows keyed by lower-cased header. */
export function lowerCaseHashes(table: DataTable): Record<string, string>[];

/** Parses an integer cell, throwing (not NaN-ing) on garbage so a typo fails loudly. */
export function intCell(value: string, label: string): number;
```

- [ ] **Step 1 (Red): Make the Background differ from the default**

In `character-display.feature` only:

```gherkin
    Background:
        Given a character exists with the following data:
            | Property   | Value                  |
            | Name       | Ilsa of the Ninth Gate |
            | Tier       | 2                      |
            | Type       | Nano                   |
            | Descriptor | Clever                 |
            | Focus      | Talks to Machines      |
```

Then make the first scenario's assertions match: `"Ilsa of the Ninth Gate"`, tier `"2"`, `"Nano"`, `"Clever"`, `"Talks to Machines"`.

Before wiring, check that `Nano` is an option of `character-type-select`, since a type that isn't an option would make `toHaveValue` fail for the wrong reason:

```bash
grep -n "Nano" src/components/*.ts src/i18n/locales/en.json
```

Run: `npm run test:e2e -- tests/e2e/features/character-display.feature --name "View character basic information"`
Expected: FAIL on `I should see the character name "Ilsa of the Ninth Gate"` (it still shows "Kael the Wanderer").

- [ ] **Step 2 (Green): Write `tableRows.ts` and wire the Background**

```ts
// tests/e2e/support/tableRows.ts
import type { DataTable } from "@cucumber/cucumber";

export function propertyTable(table: DataTable): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [property, value] of table.raw().slice(1)) {
    result[property.toLowerCase()] = value;
  }
  return result;
}

export function lowerCaseHashes(table: DataTable): Record<string, string>[] {
  return table
    .hashes()
    .map((row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]))
    );
}

export function intCell(value: string, label: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) throw new Error(`${label}: expected an integer, got "${value}"`);
  return parsed;
}
```

```ts
// character-display.steps.ts — replaces the empty Background step
Given(
  "a character exists with the following data:",
  async function (this: CustomWorld, table: DataTable) {
    const data = propertyTable(table);
    const overrides: Partial<Character> = {};
    if (data.name !== undefined) overrides.name = data.name;
    if (data.tier !== undefined) overrides.tier = intCell(data.tier, "Tier");
    if (data.type !== undefined) overrides.type = data.type;
    if (data.descriptor !== undefined) overrides.descriptor = data.descriptor;
    if (data.focus !== undefined) overrides.focus = data.focus;
    await this.setup.character(overrides);
  }
);
```

`this.setup.character` works here even though the Background runs before `I am on the character sheet page`, because the `Before` hook has already navigated. Check that `SetupDsl.character`'s parameter type accepts `Partial<Character>`, since it takes `Record<string, unknown>`.

Run the same command. Expected: PASS. Then run `npm run test:e2e -- tests/e2e/features/basic-info-editing.feature`. Expected: PASS (its Background now really seeds Kael).

- [ ] **Step 3 (Red → Green): Stats**

Change the stats table to values that differ from the default: Might `18 | 3 | 14`, Speed `9 | 0 | 7`, Intellect `11 | 1 | 11`, with the matching `Then` lines. Run `--name "View character stat pools"`. Expected: FAIL on Might pool. Then wire it:

```ts
Given(
  "the character has the following stats:",
  async function (this: CustomWorld, table: DataTable) {
    const rows = lowerCaseHashes(table);
    await this.setup.updateCharacter((character) => {
      for (const row of rows) {
        const key = row.stat.toLowerCase() as keyof Character["stats"];
        if (!(key in character.stats)) throw new Error(`Unknown stat: ${row.stat}`);
        character.stats[key] = {
          pool: intCell(row.pool, `${row.stat} pool`),
          edge: intCell(row.edge, `${row.stat} edge`),
          current: intCell(row.current, `${row.stat} current`),
        };
      }
    });
  }
);
```

Expected: PASS.

- [ ] **Step 4 (Red → Green): Cyphers, artifacts and oddities**

Change the tables to non-default content, and change the `Then` lines to match:

- Cyphers: `Rejuvenator (Pill) | 1d6+1 | Restores 2 points to one Pool`, and one row `Phase Changer (Belt) | 1d6+3 | Become out of phase for one round`. The count stays at 2.
- Artifact: `Storm Lens | 5 | Calls a localized squall`.
- Oddities: `A feather that falls upward` and `A coin that is always warm`.

Run both scenarios and see them fail. Then wire them (each step replaces the list wholesale, which is what the table states):

```ts
Given(
  "the character has the following cyphers:",
  async function (this: CustomWorld, table: DataTable) {
    const cyphers = lowerCaseHashes(table).map(({ name, level, effect }) => ({
      name,
      level,
      effect,
    }));
    await this.setup.updateCharacter((character) => {
      character.cyphers = cyphers;
    });
  }
);

Given(
  "the character has the following artifacts:",
  async function (this: CustomWorld, table: DataTable) {
    const artifacts = lowerCaseHashes(table).map(({ name, level, effect }) => ({
      name,
      level,
      effect,
    }));
    await this.setup.updateCharacter((character) => {
      character.artifacts = artifacts;
    });
  }
);

Given(
  "the character has the following oddities:",
  async function (this: CustomWorld, table: DataTable) {
    const oddities = lowerCaseHashes(table).map(({ description }) => description);
    await this.setup.updateCharacter((character) => {
      character.oddities = oddities;
    });
  }
);
```

The default `maxCyphers` is 4, so 2 cyphers never trigger the over-limit state.

- [ ] **Step 5: Text fields reuse the verbatim vocabulary**

`the character has the following text fields:` lists Equipment and Abilities, which are no longer text fields. Its `Then`s only check `length > 0`. Rewrite the scenario onto the existing verbatim steps, and extend `TEXT_FIELD_SETTERS` and the `read exactly` step with `Notes`:

```gherkin
    Scenario: View character text fields
        Given I am on the character sheet page
        And the character has the following text:
            | Field      | Content                                         |
            | Background | Raised by a seskii pack beyond the Black Riage  |
            | Notes      | Owes the Aeon Priests of Qi a favour            |
        Then the character text should read exactly:
            | Field      | Content                                         |
            | Background | Raised by a seskii pack beyond the Black Riage  |
            | Notes      | Owes the Aeon Priests of Qi a favour            |
```

```ts
// in TEXT_FIELD_SETTERS
  Notes: (character, value) => {
    character.textFields.notes = value;
  },
// in "the character text should read exactly:", next to Background
      } else if (Field === "Notes") {
        await expect(this.dom.getByTestId("character-notes")).toHaveValue(Content);
```

Delete the definitions: `the character has the following text fields:`, `I should see the background text`, `I should see the notes text`, `I should see the equipment text` and `I should see the abilities text`. Equipment and ability cards are covered by their own features (`equipment*.feature`, `ability-enhancements.feature`). Confirm this with `grep -l "equipment-item\|ability-item" tests/e2e/step-definitions/*.ts` before deleting.

Red: before adding the `Notes` branches, run the scenario. Expected: FAIL with `Unknown text field: Notes`. Green: add them.

- [ ] **Step 6: Catalog, the whole feature, and commit**

```bash
npm run docs:steps && npm run check:steps
npm run test:e2e -- tests/e2e/features/character-display.feature tests/e2e/features/basic-info-editing.feature
git add tests/e2e && git commit -m "test(e2e): make character-display table Givens seed their tables" -m "Six Givens discarded their data table and passed only because FULL_CHARACTER happened to match. Tables now carry non-default values so a regression in the wiring fails." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: The markup check can fail

**Files:**

- Modify: `tests/e2e/step-definitions/character-display.steps.ts` (the `no markup from the text should be rendered as HTML` step)
- Temporary sabotage (reverted): `src/components/BasicInfo.ts` (the character-name binding, around line 158)

- [ ] **Step 1: Prove the current step can't fail**

Temporarily render the name through `unsafeHTML` in `BasicInfo.ts`:

```ts
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
// …
${unsafeHTML(this.character.name)}
```

Comment out `Then the character text should read exactly:` in the verbatim scenario, and run:

```bash
npm run test:e2e -- tests/e2e/features/character-display.feature --name "shown verbatim"
```

Expected: **PASS**, which demonstrates the bug: the step looks for `<unknown>`, but the name produces `<the>`.

- [ ] **Step 2: Make the check element-agnostic**

```ts
Then("no markup from the text should be rendered as HTML", async function (this: CustomWorld) {
  // The name binding is a text node; any child element means user text was parsed as HTML.
  await expect(this.dom.getByTestId("character-name").locator("*")).toHaveCount(0);
});
```

If `character-name` legitimately has child elements (check with `grep -n -A6 'data-testid="character-name"' src/components/BasicInfo.ts`), scope the check to the element holding the text instead. Don't fall back to a tag-name list.

Re-run with the sabotage still in place. Expected: **FAIL** (`toHaveCount(0)`, received 1).

- [ ] **Step 3: Revert the sabotage, restore the scenario line, re-run**

`git checkout src/components/BasicInfo.ts`, then put the `read exactly` line back.
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e && git commit -m "test(e2e): check the name for any parsed element, not an <unknown> one" -m "<Unknown Location> only appears in the textarea-backed Background, so the old locator could never match." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Every remaining no-op step is wired or deleted

**Files:**

- Create: `tests/e2e/support/i18nKeys.ts`
- Modify: `tests/e2e/step-definitions/{character-display,combat,basic-info-editing,section-rearrangement,version-history}.steps.ts`
- Modify: `tests/e2e/features/{character-display,combat,basic-info-editing,section-rearrangement,version-history,version-comparison}.feature`

**Interfaces:**

- Consumes: `propertyTable`, `intCell` (Task 2)
- Produces: the Gherkin step `no untranslated text keys should be visible`

Disposition of every empty-bodied step (found by scanning `tests/e2e/step-definitions/*.ts` for step functions whose body is only comments):

| Step                                                                                                                                    | File:line                            | Disposition                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 6 × `… should use translation keys` (labels, stat labels, cyphers section label, items section labels, text field labels, empty states) | `character-display.steps.ts`         | **Replace** with one real step, `no untranslated text keys should be visible` (Step 5)                                 |
| `the character has an attack {string} with:`                                                                                            | `combat.steps.ts:6`                  | **Wire** (upsert), with non-default values (Step 2)                                                                    |
| `the character has an attack {string}`                                                                                                  | `combat.steps.ts:11`                 | **Wire**: ensure an attack of that name exists (Step 3)                                                                |
| `the character has a special ability {string} with:` / `… {string}`                                                                     | `combat.steps.ts:108,122`            | Not empty, but only writes `this.testSpecialAbility*` fields that no step reads. **Wire** like the attacks (Steps 2–3) |
| `the character has special abilities and attacks`                                                                                       | `combat.steps.ts:187`                | **Wire** to `this.setup.character()` (FULL_CHARACTER has both)                                                         |
| `the tier should be constrained to {string}`                                                                                            | `basic-info-editing.steps.ts:122`    | **Delete**. The next-but-one line, `the tier should display "6"`, asserts the same thing                               |
| `an error or validation message may appear`                                                                                             | `basic-info-editing.steps.ts:135`    | **Delete**. An optional assertion asserts nothing                                                                      |
| `I confirm the reset`                                                                                                                   | `section-rearrangement.steps.ts:192` | **Delete**. No confirmation exists; if one is added, a scenario will need a real step                                  |
| `the sections should remain in single-column layout`                                                                                    | `section-rearrangement.steps.ts:428` | **Leave**. Only the `@skip` Grid Merge scenario uses it (out of scope)                                                 |
| `the character has no version history yet`                                                                                              | `version-history.steps.ts:9`         | **Make it assert**: `getAllVersions()` is empty                                                                        |
| `I am viewing the latest version`                                                                                                       | `version-history.steps.ts:51`        | **Make it assert**: the forward arrow is disabled                                                                      |
| `I view the character sheet`                                                                                                            | `version-history.steps.ts:348`       | **Make it act**: reload and wait for the sheet                                                                         |

- [ ] **Step 1: Delete the three pure no-ops**

Remove `the tier should be constrained to {string}` (2 feature lines), `an error or validation message may appear` (1) and `I confirm the reset` (1). Then remove their definitions.
Run: `npm run test:e2e -- tests/e2e/features/basic-info-editing.feature tests/e2e/features/section-rearrangement.feature`
Expected: PASS.

- [ ] **Step 2 (Red → Green): Attack and special-ability tables**

In `combat.feature`, change the values so they differ from `FULL_CHARACTER`:

- Broadsword: Damage `6`, Modifier `2`, Range `Short`, Notes `Notched blade, two-handed`.
- Lightning Bolt: Description `Arcs between up to three targets in short range`, Source `Storm Lens artifact`.

Update the matching `Then` lines (modifier `"+2"`). Run both scenarios. Expected: FAIL on damage `"6"` and on the description. Then wire them:

```ts
Given(
  "the character has an attack {string} with:",
  async function (this: CustomWorld, name: string, table: DataTable) {
    const data = propertyTable(table);
    const attack: Attack = {
      name,
      damage: intCell(data.damage, "Damage"),
      modifier: intCell(data.modifier, "Modifier"),
      range: data.range,
      ...(data.notes ? { notes: data.notes } : {}),
    };
    await this.setup.updateCharacter((character) => {
      character.attacks = [...character.attacks.filter((a) => a.name !== name), attack];
    });
  }
);

Given(
  "the character has a special ability {string} with:",
  async function (this: CustomWorld, name: string, table: DataTable) {
    const data = propertyTable(table);
    const ability: SpecialAbility = { name, description: data.description, source: data.source };
    await this.setup.updateCharacter((character) => {
      character.specialAbilities = [
        ...character.specialAbilities.filter((a) => a.name !== name),
        ability,
      ];
    });
  }
);
```

Remove `testSpecialAbilityName` and `testSpecialAbilityProperties` from wherever they're declared. Search for them with `grep -rn testSpecialAbility tests/e2e`.

- [ ] **Step 3: Name-only Givens ensure existence**

```ts
Given("the character has an attack {string}", async function (this: CustomWorld, name: string) {
  await this.setup.updateCharacter((character) => {
    if (!character.attacks.some((a) => a.name === name)) {
      character.attacks.push({ name, damage: 4, modifier: 0, range: "Immediate" });
    }
  });
});

Given(
  "the character has a special ability {string}",
  async function (this: CustomWorld, name: string) {
    await this.setup.updateCharacter((character) => {
      if (!character.specialAbilities.some((a) => a.name === name)) {
        character.specialAbilities.push({ name, description: name, source: name });
      }
    });
  }
);

Given("the character has special abilities and attacks", async function (this: CustomWorld) {
  await this.setup.character({
    attacks: FULL_CHARACTER.attacks,
    specialAbilities: FULL_CHARACTER.specialAbilities,
  });
});
```

Red check for the name-only form: temporarily change `combat.feature:54` to `the character has an attack "Halberd"` and the `Then` on the next line to match. It must pass _only_ with the step wired; with the old empty body it fails. Revert the name afterwards.

- [ ] **Step 4: Version-history Givens assert their precondition**

```ts
Given("the character has no version history yet", async function (this: CustomWorld) {
  expect(await this.storageHelper.getAllVersions()).toHaveLength(0);
});

Given("I am viewing the latest version", async function (this: CustomWorld) {
  await expect(this.page.getByTestId("version-nav-forward")).toBeDisabled();
});

When("I view the character sheet", async function (this: CustomWorld) {
  await this.page.reload();
  await waitForCharacterSheetReady(this.page);
});
```

`I am viewing the latest version` only appears after `the character has 3 versions in history`, so the navigator is present. Check this with `grep -n -B2 "I am viewing the latest version" tests/e2e/features/*.feature`.

Run: `npm run test:e2e -- tests/e2e/features/version-history.feature tests/e2e/features/version-comparison.feature`
Expected: PASS.

- [ ] **Step 5 (Red): One real translation-key check**

Replace the six `… should use translation keys` lines in `character-display.feature` with `And no untranslated text keys should be visible`. A scenario only needs it once, after its other `Then`s. Then write the step with an empty body that throws `new Error("pending")`, and run the feature.
Expected: FAIL with "pending" on the six scenarios.

- [ ] **Step 6 (Green): Implement it, then prove it catches a missing key**

```ts
// tests/e2e/support/i18nKeys.ts
import { readFileSync } from "node:fs";

const en = JSON.parse(
  readFileSync(new URL("../../../src/i18n/locales/en.json", import.meta.url), "utf8")
) as Record<string, unknown>;

/**
 * Matches text shaped like an i18n key under one of en.json's top-level
 * namespaces ("character.name", "attacks.doesNotExist"). Matching by namespace
 * rather than by known key is the point: i18next renders a *missing* key as
 * the key itself, and a missing key is by definition not in en.json.
 */
export const RAW_I18N_KEY = new RegExp(`\\b(?:${Object.keys(en).join("|")})\\.[A-Za-z0-9_.]+\\b`);
```

```ts
// character-display.steps.ts
Then("no untranslated text keys should be visible", async function (this: CustomWorld) {
  const text = await this.page.locator("body").innerText();
  expect(text).not.toMatch(RAW_I18N_KEY);
});
```

Run the feature. Expected: PASS. Then sabotage it: in `src/components/BasicInfo.ts`, change one label's `t("…")` to `t("character.doesNotExist")` and run `--name "View character basic information"`.
Expected: FAIL, with the received text containing `character.doesNotExist`. Revert.

If the default character's own text matches the regex (a false positive), the PASS run shows it. Narrow the regex to require a lower-case letter right after the dot. Don't weaken it to known keys.

- [ ] **Step 7: Catalog, affected features, commit**

```bash
npm run docs:steps && npm run check:steps
npm run test:e2e -- tests/e2e/features/character-display.feature tests/e2e/features/combat.feature tests/e2e/features/basic-info-editing.feature tests/e2e/features/section-rearrangement.feature tests/e2e/features/version-history.feature tests/e2e/features/version-comparison.feature
git add tests/e2e && git commit -m "test(e2e): wire or delete every remaining no-op step" -m "Setup Givens that seeded nothing now seed non-default data; precondition Givens assert; optional and duplicate Thens are gone; six empty translation-key checks become one that catches a missing key." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Export capture fails loudly

**Files:**

- Modify: `tests/e2e/support/exportCapture.ts`

**Interfaces:**

- Produces: `waitForExportCapture(page: Page, timeoutMs = 5000): Promise<CapturedExport>`, which rejects with `Export capture: …` on a blob error or a timeout. Its only caller is `I export the character` in `character-file-export.steps.ts`, and that caller doesn't change.

- [ ] **Step 1: Record blob errors in the page**

Add `__exportError?: string` to the `declare global` `Window` block, `delete window.__exportError;` at the top of the install function, and a `.catch` on the blob fetch:

```ts
void window
  .fetch(anchor.href)
  .then((res) => res.text())
  .then((data) => {
    window.__exportedData = data;
  })
  .catch((error: unknown) => {
    window.__exportError = String(error);
  });
```

- [ ] **Step 2: Wait for data _or_ an error, with a bounded timeout**

```ts
export async function waitForExportCapture(page: Page, timeoutMs = 5000): Promise<CapturedExport> {
  try {
    await page.waitForFunction(
      () =>
        window.__exportError !== undefined ||
        (window.__exportedFilename !== undefined && window.__exportedData !== undefined),
      undefined,
      { timeout: timeoutMs }
    );
  } catch {
    const seen = await page.evaluate(() => ({
      filename: window.__exportedFilename ?? null,
      hasData: window.__exportedData !== undefined,
    }));
    throw new Error(
      `Export capture: nothing captured within ${timeoutMs}ms (filename=${seen.filename}, data=${seen.hasData})`
    );
  }
  const error = await page.evaluate(() => window.__exportError);
  if (error !== undefined) throw new Error(`Export capture: blob fetch failed: ${error}`);
  return page.evaluate(() => ({
    filename: window.__exportedFilename as string,
    data: window.__exportedData as string,
  }));
}
```

- [ ] **Step 3: Sabotage both paths**

1. In the stub, replace `window.__exportedData = data;` (the picker path) with nothing, then run `npm run test:e2e -- tests/e2e/features/character-file-export.feature`.
   Expected: FAIL in about 5 s with `Export capture: nothing captured within 5000ms (filename=…, data=false)`, not after 30 s with a bare step timeout.
2. Revert. Then delete `showSaveFilePicker` in the stub (`delete (window as unknown as Record<string, unknown>).showSaveFilePicker;`) so the app takes the blob path in Chromium, and run again.
   Expected: PASS, which proves the async blob branch works. That matters before Task 7 runs WebKit.
3. Revert.

- [ ] **Step 4: Run the export features and commit**

```bash
npm run test:e2e -- tests/e2e/features/character-file-export.feature tests/e2e/features/export-enhancement.feature
git add tests/e2e/support/exportCapture.ts && git commit -m "test(e2e): bound export capture wait and surface blob fetch errors" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Long attack names don't overflow at 320 px, and badges stay right

**Files:**

- Modify: `tests/e2e/features/combat.feature` (new outline)
- Modify: `tests/e2e/step-definitions/combat.steps.ts` (two new steps)
- Modify: `src/components/AttackItem.ts:~143-151`, `src/styles/components/attack-item.css`

- [ ] **Step 1 (Red): Scenario first (Rule 2)**

```gherkin
    @validation
    Scenario Outline: A long unbroken attack name stays inside its card at <width>px
        Given the viewport is <width> pixels wide
        And I am on the character sheet page
        And the character has an attack with a 40-character name without spaces
        Then the page should not scroll horizontally
        And the attack badges should sit at the right edge of their card

        Examples:
            | width |
            | 320   |
            | 390   |
            | 1280  |
```

```ts
Given(
  "the character has an attack with a {int}-character name without spaces",
  async function (this: CustomWorld, length: number) {
    await this.setup.updateCharacter((character) => {
      character.attacks = [{ name: "W".repeat(length), damage: 4, modifier: 1, range: "Short" }];
    });
  }
);

Then(
  "the attack badges should sit at the right edge of their card",
  async function (this: CustomWorld) {
    const card = this.page.getByTestId("attack-item").first();
    const badges = card.locator(".attack-badges");
    const cardBox = await card.boundingBox();
    const badgeBox = await badges.boundingBox();
    if (!cardBox || !badgeBox) throw new Error("attack card or badges not rendered");
    // pr-8 (2rem) leaves room for the edit/delete buttons; allow that plus border/padding.
    expect(cardBox.x + cardBox.width - (badgeBox.x + badgeBox.width)).toBeLessThanOrEqual(56);
  }
);
```

Run: `npm run test:e2e -- tests/e2e/features/combat.feature --name "long unbroken attack name"`
Expected: FAIL at 320 px on horizontal scroll. Fix that first (Rule 10), then expect the badge check to fail once the name wraps.

- [ ] **Step 2 (Green): CSS fix**

```html
<h4
  data-testid="attack-name-${this.attack.name}"
  class="attack-name min-w-0 font-bold text-lg text-red-900"
>
  …
  <div class="attack-badges ml-auto flex gap-2"></div>
</h4>
```

```css
/* Attack name - user data; an unbroken name must wrap rather than widen the card */
.attack-item-card .attack-name {
  font-family: "Caveat", "Patrick Hand", cursive;
  font-size: 1.375rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
```

`ml-auto` keeps wrapped badges right-aligned, and `min-w-0` lets the flex child shrink below its content width. Both are literal class names, so Tailwind generates them.

Run the outline, then `npm run test:e2e -- tests/e2e/features/combat.feature`. Expected: PASS.

- [ ] **Step 3: Unit tests, lint, format, commit**

```bash
npm run test:unit && npm run lint && npm run format
npm run docs:steps && npm run check:steps
git add src tests/e2e && git commit -m "fix(attacks): wrap long attack names and keep badges right-aligned" -m "A 40-character unbroken name overflowed the card at 320px, and wrapped badges fell to the left edge." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: `DEVICE` selects the Playwright device profile

Must-Have #1, part 1: the plumbing. With `DEVICE` unset, behaviour is identical to today.

**Files:**

- Create: `tests/e2e/support/device.ts`, `tests/unit/e2eDevice.test.ts`
- Modify: `tests/e2e/support/hooks.ts` (BeforeAll and Before)
- Modify: `playwright.config.ts:31` (`"iPad Pro"` → `"iPad Pro 11"`)

**Interfaces:**

- Produces (`tests/e2e/support/device.ts`). It is pure, with no Playwright import, so Vitest can load it under jsdom:

```ts
export type DeviceKey = "desktop" | "pixel5" | "iphone12" | "ipadpro";
export type Engine = "chromium" | "webkit";

export interface DeviceProfile {
  key: DeviceKey;
  /** Key into Playwright's `devices` registry. */
  descriptor: string;
  engine: Engine;
}

export const DEVICE_PROFILES: Readonly<Record<DeviceKey, DeviceProfile>>;

/** Resolves the DEVICE env value; unset/empty → desktop; unknown → throws listing valid keys. */
export function resolveDevice(value: string | undefined): DeviceProfile;
```

- [ ] **Step 1 (Red): Unit tests**

```ts
// tests/unit/e2eDevice.test.ts
import { describe, it, expect } from "vitest";
import { resolveDevice } from "../e2e/support/device";

describe("resolveDevice", () => {
  it("defaults to the desktop Chrome profile when DEVICE is unset", () => {
    expect(resolveDevice(undefined)).toEqual({
      key: "desktop",
      descriptor: "Desktop Chrome",
      engine: "chromium",
    });
  });

  it("treats an empty DEVICE as unset", () => {
    expect(resolveDevice("").key).toBe("desktop");
  });

  it("runs iPhone 12 and iPad Pro on WebKit, as their real browsers do", () => {
    expect(resolveDevice("iphone12")).toEqual({
      key: "iphone12",
      descriptor: "iPhone 12",
      engine: "webkit",
    });
    expect(resolveDevice("ipadpro")).toEqual({
      key: "ipadpro",
      descriptor: "iPad Pro 11",
      engine: "webkit",
    });
  });

  it("runs Pixel 5 on Chromium", () => {
    expect(resolveDevice("pixel5").engine).toBe("chromium");
  });

  it("rejects an unknown device, naming the valid ones", () => {
    expect(() => resolveDevice("ipad")).toThrow(/desktop, pixel5, iphone12, ipadpro/);
  });
});
```

Run: `npm run test:unit -- tests/unit/e2eDevice.test.ts`. Expected: FAIL, because the module isn't found.

- [ ] **Step 2 (Green): `device.ts`**

```ts
// tests/e2e/support/device.ts
// Rule 9 device profiles for the Cucumber suite. Kept free of Playwright
// imports so the resolution logic is unit-testable under Vitest.
export type DeviceKey = "desktop" | "pixel5" | "iphone12" | "ipadpro";
export type Engine = "chromium" | "webkit";

export interface DeviceProfile {
  key: DeviceKey;
  descriptor: string;
  engine: Engine;
}

export const DEVICE_PROFILES: Readonly<Record<DeviceKey, DeviceProfile>> = {
  desktop: { key: "desktop", descriptor: "Desktop Chrome", engine: "chromium" },
  pixel5: { key: "pixel5", descriptor: "Pixel 5", engine: "chromium" },
  iphone12: { key: "iphone12", descriptor: "iPhone 12", engine: "webkit" },
  ipadpro: { key: "ipadpro", descriptor: "iPad Pro 11", engine: "webkit" },
};

function isDeviceKey(value: string): value is DeviceKey {
  return Object.prototype.hasOwnProperty.call(DEVICE_PROFILES, value);
}

export function resolveDevice(value: string | undefined): DeviceProfile {
  if (!value) return DEVICE_PROFILES.desktop;
  if (!isDeviceKey(value)) {
    throw new Error(
      `Unknown DEVICE "${value}". Use one of: ${Object.keys(DEVICE_PROFILES).join(", ")}`
    );
  }
  return DEVICE_PROFILES[value];
}
```

Run the unit test. Expected: PASS.

- [ ] **Step 3: `hooks.ts` uses the profile**

```ts
import { chromium, webkit, devices, type Browser } from "@playwright/test";
import { resolveDevice } from "./device.js";

const DEVICE = resolveDevice(process.env.DEVICE);
const ENGINES = { chromium, webkit } as const;

BeforeAll({ timeout: 60000 }, async function () {
  browser = await ENGINES[DEVICE.engine].launch({
    headless: !process.env.HEADED,
    // PW_EXEC_PATH points at a Chromium binary; never hand it to WebKit.
    executablePath:
      DEVICE.engine === "chromium" ? process.env.PW_EXEC_PATH || undefined : undefined,
  });
});

// in Before:
const descriptor = devices[DEVICE.descriptor];
if (!descriptor) throw new Error(`Playwright has no device "${DEVICE.descriptor}"`);
this.context = await browser.newContext({
  ...descriptor,
  // Kept from before device profiles: touch-gesture scenarios run on every
  // profile, including desktop.
  hasTouch: true,
  locale: "en-US",
});
```

Leave the existing comments about locale pinning in place, above the `newContext` call.

- [ ] **Step 4: Fix the Playwright config's tablet project**

In `playwright.config.ts`, change `devices["iPad Pro"]` to `devices["iPad Pro 11"]` and add the comment `// "iPad Pro" is not a Playwright descriptor; spreading undefined gave a desktop context.`

- [ ] **Step 5: Desktop unchanged, and each device boots**

```bash
npm run test:e2e:prod
```

Expected: 412+ passing, the same count as after Task 6 (unchanged desktop baseline).

Then run one smoke feature per device. In PowerShell, set the env var first. In bash, use `DEVICE=pixel5 npm run …`.

```powershell
$env:DEVICE='pixel5';   npm run test:e2e -- tests/e2e/features/character-display.feature
$env:DEVICE='iphone12'; npm run test:e2e -- tests/e2e/features/character-display.feature
$env:DEVICE='ipadpro';  npm run test:e2e -- tests/e2e/features/character-display.feature
Remove-Item Env:DEVICE
```

Expected: each one launches the right engine. If `npx playwright install webkit` hasn't been run locally, the WebKit launch error says so. Failures in individual scenarios are _expected_ here and are Task 8's input. Note the counts, but don't fix anything in this task.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/support/device.ts tests/e2e/support/hooks.ts tests/unit/e2eDevice.test.ts playwright.config.ts
git commit -m "test(e2e): select the Playwright device profile from DEVICE" -m "Unset keeps today's desktop Chromium context. iPhone 12 and iPad Pro 11 run on WebKit. playwright.config.ts asked for devices[\"iPad Pro\"], which does not exist." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Triage each device profile to green

Must-Have #1, part 2. This task is **discovery**: its failures can't be listed in advance. Its deliverable is the full suite passing on all four profiles, with every exclusion justified.

**Decided (maintainer, 2026-10-03):** run the **whole** suite on every profile, minus scenarios tagged `@desktop-only`. Don't run only a hand-picked `@responsive` subset. Don't reopen this during execution. Reasons:

- A subset needs someone to remember to tag each new scenario, and today's gap came from exactly that kind of omission.
- In CI the matrix jobs run in parallel, so wall-clock time stays close to one run.

- [ ] **Step 1: Collect failures per profile**

```bash
DEVICE=pixel5   npm run test:e2e:prod 2>&1 | tee "$CLAUDE_JOB_DIR/tmp/pixel5.log"
DEVICE=iphone12 npm run test:e2e:prod 2>&1 | tee "$CLAUDE_JOB_DIR/tmp/iphone12.log"
DEVICE=ipadpro  npm run test:e2e:prod 2>&1 | tee "$CLAUDE_JOB_DIR/tmp/ipadpro.log"
```

Don't use `$CLAUDE_JOB_DIR` outside a Claude job; any scratch directory works. List the failing scenario names per profile in a table, in the PR description or a scratch note, not in the repo.

- [ ] **Step 2: Classify each failing scenario into exactly one bucket**

| Bucket                      | Test                                                                                                                                                                                                                                           | Action                                                                                                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Inherently desktop**   | The behaviour doesn't exist on that device. For example, mouse hover states (`I hover over …`), the comparison view at phone widths (by design, `isPhoneViewport`), or mouse `dragSectionTo` when a touch variant of the same scenario exists. | Tag `@desktop-only`, with a one-line `#` comment above the tag saying why.                                                                                                                                     |
| **B. Test assumes desktop** | The behaviour exists, but the step assumes 1280 px or a mouse. For example, it clicks something off-screen, or asserts a two-column layout.                                                                                                    | Fix the step: scroll into view, use `tap` when `hasTouch` and `isMobile`, or assert per breakpoint. Don't tag.                                                                                                 |
| **C. Real product bug**     | A person on that device would hit it.                                                                                                                                                                                                          | Rule 2: write or extend a scenario that fails on that profile (a `the viewport is N pixels wide` outline row is enough, so it also fails on desktop runs). Fix it, and commit it as its own `fix(<scope>): …`. |
| **D. Engine difference**    | WebKit-only. For example, the export blob path, or `inputValue` timing.                                                                                                                                                                        | Treat like C if a Safari user would hit it, otherwise like B.                                                                                                                                                  |

Work through one failing scenario at a time (Rule 10). After each fix, re-run only that scenario with `--name`.

- [ ] **Step 3: Make `@desktop-only` work on the non-desktop runs**

In `cucumber.cjs`, the tag filter becomes device-aware:

```js
const onDesktop = !process.env.DEVICE || process.env.DEVICE === "desktop";
// …
    tags: onDesktop
      ? "not @skip and not @wip and not @deprecated"
      : "not @skip and not @wip and not @deprecated and not @desktop-only",
```

- [ ] **Step 4: All four profiles green**

Run `npm run test:e2e:prod` with `DEVICE` unset and with each of `pixel5`, `iphone12` and `ipadpro`.
Expected: 0 failures on each. Record the pass and `@desktop-only` counts per profile for Task 10.

- [ ] **Step 5: Commit**

Bucket-C fixes are already committed separately. Commit the tags, the step fixes and `cucumber.cjs`:

```bash
git add cucumber.cjs tests/e2e && git commit -m "test(e2e): make the suite pass on Pixel 5, iPhone 12 and iPad Pro 11" -m "Scenarios that describe desktop-only behaviour are tagged @desktop-only with the reason; steps that assumed a 1280px mouse viewport now work on touch devices." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: CI runs every profile; the testing rules say how

**Files:**

- Modify: `.github/workflows/deploy.yml`
- Modify: `docs/rules/testing.md` (the "Rule #9 — Responsive Design Required" section, and the old Playwright example under "E2E Tests (Playwright)")
- Modify: `CLAUDE.md` (Rule 9 line)

- [ ] **Step 1: Split E2E into a matrix job**

Keep `build-test` (lint, format, i18n, steps, unit, and the desktop E2E run plus Pages artifact) as it is. Add a sibling job for the other three devices:

```yaml
e2e-devices:
  name: E2E (${{ matrix.device }})
  runs-on: ubuntu-24.04
  permissions:
    contents: read
  concurrency:
    group: e2e-${{ matrix.device }}-${{ github.ref }}
    cancel-in-progress: true
  strategy:
    fail-fast: false
    matrix:
      device: [pixel5, iphone12, ipadpro]
  steps:
    - uses: actions/checkout@v7
    - uses: actions/setup-node@v7
      with:
        node-version: "24"
        cache: "npm"
    - uses: actions/cache@v6
      with:
        path: ~/.cache/ms-playwright
        key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
        restore-keys: |
          playwright-${{ runner.os }}-
    - run: npm ci
    - run: npx playwright install --with-deps
    - name: Build and run E2E tests on ${{ matrix.device }}
      run: npm run test:e2e:prod
      env:
        DEVICE: ${{ matrix.device }}
```

Change the deploy job to `needs: [build-test, e2e-devices]`, so a phone-only regression blocks a deploy.

- [ ] **Step 2: Rewrite Rule 9's enforcement paragraph in `docs/rules/testing.md`**

Replace `E2E tests verify all four automatically via playwright.config.ts.` with:

```markdown
The Cucumber suite runs once per profile, selected by the `DEVICE` env var
(`tests/e2e/support/device.ts`): `desktop` (default), `pixel5`, `iphone12`,
`ipadpro`. iPhone 12 and iPad Pro 11 run on WebKit. CI runs all four as
parallel jobs; a deploy needs all four green.

    DEVICE=iphone12 npm run test:e2e -- tests/e2e/features/some.feature

Scenarios that describe behaviour a device does not have (mouse hover, the
comparison view on a phone) are tagged `@desktop-only` with a `#` comment
saying why; the non-desktop runs skip them. Everything else must pass on all
four. A scenario that needs a width no profile has (e.g. 320px) uses
`the viewport is N pixels wide`.
```

Delete the `### Test Across All Viewports` Playwright-test example under "E2E Tests (Playwright)". Nothing in the suite uses `playwright test`, and the example taught the wrong mechanism. In `CLAUDE.md` Rule 9, change "configured in `playwright.config.ts`" to "run per profile via `DEVICE` (see `docs/rules/testing.md`)".

- [ ] **Step 3: Validate the workflow, then commit**

Validate the YAML locally if `actionlint` is available (`npx actionlint` or the binary). Otherwise rely on the PR's CI run.

```bash
git add .github/workflows/deploy.yml docs/rules/testing.md CLAUDE.md
git commit -m "ci(e2e): run the Cucumber suite on all four Rule 9 device profiles" -m "Deploy now waits for the Pixel 5, iPhone 12 and iPad Pro 11 jobs as well as desktop." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Full verification and docs

**Files:**

- Modify: `docs/TODO.md`, `docs/FEATURES.md` (if it lists test-infra milestones; check before adding)

- [ ] **Step 1: Full verification**

```bash
npm run test:unit
npm run lint
npm run format:check
npm run check:i18n
npm run check:steps
npm run test:e2e:prod                    # desktop
DEVICE=pixel5   npm run test:e2e:prod
DEVICE=iphone12 npm run test:e2e:prod
DEVICE=ipadpro  npm run test:e2e:prod
```

Expected: all green. Unit tests: 901 + 5 = 906. Re-scan for empty-bodied step definitions with the script from planning, at `$CLAUDE_JOB_DIR/tmp` or re-created. Expected: exactly one (`the sections should remain in single-column layout`, only used by `@skip` Grid scenarios).

- [ ] **Step 2: Update `docs/TODO.md`**

- Delete both "🚨 Must-Have" entries and the whole "🧹 Should-Have" section.
- Keep "Tracked elsewhere".
- In the Grid Merge/Split backlog entry, add a note: `the sections should remain in single-column layout` is a no-op that the feature must implement when un-skipping.
- Update "📊 Current Status" with the per-profile counts from Task 8, Step 4 and the new step-definition total.

- [ ] **Step 3: Commit, then present the branch for review (Rule 1)**

```bash
git add docs && git commit -m "docs(todo): record device-profile baseline and clear the test debt entries" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
