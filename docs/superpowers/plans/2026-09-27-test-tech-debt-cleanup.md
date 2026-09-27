# Test Tech-Debt Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close out the three "Must-Have (Technical Debt)" entries in `docs/TODO.md` and the leftover metrics of `tests/implementation-plan.md` §11, so the E2E suite has one definition per behaviour, one place that seeds state and reloads, and no never-implemented `@skip` scenarios.

**Architecture:** Test-only refactor of the Cucumber/Playwright layer. New behaviour goes into the existing World DSL (`this.setup`) and `tests/e2e/support/` modules, and duplicate step definitions collapse onto parameter types. The only production-code change that may happen is a CSS fix if Task 8's new overflow scenario turns up a real bug.

**Tech Stack:** Cucumber-js (Gherkin) + Playwright, TypeScript strict, `scripts/step-catalog.js` (`npm run docs:steps` / `npm run check:steps`).

**Spec:** No separate spec, by the maintainer's decision. The requirements come from `docs/TODO.md` § "🚨 Must-Have (Technical Debt)" and `tests/implementation-plan.md` §7.3, §7.5, §11, plus these decisions from the 2026-09-27 planning session:

- The `@skip` triage is decided per scenario. Delete the 3 responsive scenarios and the tier-3 scenario. Implement the special-characters scenario. Replace long-text with a concrete "no horizontal overflow" scenario. Rewrite section-order against `DEFAULT_LAYOUT`.
- Scope includes the leftover "seed storage → reload" sites. Targets: a setup DSL for "mutate stored character → reload" and for "seed layout → reload".

## Global Constraints

- CLAUDE.md's 11 rules apply. The ones that bite here:
  - **Rule 1:** present each task's diff and test results for review before committing, unless the maintainer has said to commit without review.
  - **Rule 2:** every behaviour change goes into a `.feature` file first.
  - **Rule 7:** conventional commits, one `-m` per paragraph, chain with `&&`, don't mention test state.
  - **Rule 8:** unit tests, lint and the affected E2E features pass before each commit.
  - **Rule 10:** one failing test at a time.
- **Rule 5:** no new `any`. Where a touched line already uses `any`, replace it with the real type or `unknown` plus a narrowing step.
- Never call `cucumber-js` directly. Always use `npm run test:e2e -- <feature file>` (single feature) or `npm run test:e2e:prod` (full, as CI runs it).
- Every task that adds, removes or renames a step definition ends with `npm run docs:steps`, and the regenerated `tests/e2e/STEP_CATALOG.md` goes in the same commit. `npm run check:steps` must print `✅ All N step definitions are used and tests/e2e/STEP_CATALOG.md is current.`
- Imports from `src/` into `tests/e2e/support/` follow the existing relative style (`../../../src/types/layout.js`, as in `tests/e2e/support/sections.ts`). `docs/RULE_VIOLATIONS.md` §1 records that `@/` resolution under Cucumber's `tsx` loader is not yet confirmed, so don't mix the two in this plan.
- The `@skip` scenarios in `section-rearrangement.feature` belong to the Grid Merge/Split backlog feature. **Don't touch them.**
- Baseline before Task 1: unit **901** passing. E2E **405** passing / **14** `@skip`ped. **684** step definitions.

## Review Focus

1. **Storage still empty when `this.setup.updateCharacter()` runs** (a step fires before the app's bootstrap persist). The old call sites silently skipped the write and passed for the wrong reason. The new helper must throw a clear error instead (Task 2, Step 1 pins it).
2. **A 50-character name with no spaces on a 320-px-wide phone.** `validateName` allows it. A person would expect the name to wrap, not push the whole sheet sideways (Task 8 pins it on all four device profiles).
3. **An export whose data arrives after the click returns.** The Safari/Firefox fallback reads a blob URL asynchronously. A fixed `waitForTimeout(1000)` either wastes time or races. The shared capture must wait for the data itself (Task 4, Step 3).
4. **`the character has no artifacts` after `the character has no cyphers`.** The first used to be a no-op that relied on the second. After collapsing, every such step starts a new character, so a scenario that stacks several must still end on an empty character (Task 1, Step 4 runs `character-display.feature`, which stacks three).
5. **Text containing `<…>` and `&`.** A person expects exactly what they typed back, not an injected element or `&amp;` (Task 7 pins both).

---

## File Structure

| File                                                                                                                   | Responsibility                                                                                                      | Tasks      |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------- |
| `tests/e2e/support/parameterTypes.ts`                                                                                  | adds `{cardTypes}` (plural card words → `empty-*` test id)                                                          | 1          |
| `tests/e2e/support/setup.ts`                                                                                           | `SetupDsl`: gains `replaceCharacter`, `updateCharacter` and `layout`. The only place that seeds storage and reloads | 2, 3       |
| `tests/e2e/support/exportCapture.ts` (new)                                                                             | installs the export stub and waits for and reads the captured file                                                  | 4          |
| `tests/e2e/support/world.ts`                                                                                           | `ExportedCharacterFile` gains `layout`/`versionHistory`. Drops `exportedLayoutData`                                 | 4          |
| `tests/e2e/step-definitions/character-display.steps.ts`                                                                | single home of the empty-state family, plus the new display steps                                                   | 1, 7, 8, 9 |
| `tests/e2e/step-definitions/{combat,ability-enhancements}.steps.ts`                                                    | lose their empty-state duplicates                                                                                   | 1          |
| `tests/e2e/step-definitions/{card-reordering,recovery-damage-track,resource-tracker-editing,version-history}.steps.ts` | call `this.setup.*` instead of set→reload                                                                           | 2          |
| `tests/e2e/step-definitions/section-rearrangement.steps.ts`                                                            | calls `this.setup.layout`. Loses its export-mock copy                                                               | 3, 4       |
| `tests/e2e/step-definitions/character-file-export.steps.ts`                                                            | the single `I export the character` definition                                                                      | 4          |
| `tests/e2e/features/*.feature`                                                                                         | lowercase `export button` → `I export the character`; version fixture wording; `@skip` triage                       | 4, 5, 6–9  |
| `docs/TODO.md`, `tests/implementation-plan.md`                                                                         | record the new baseline, remove the finished entries                                                                | 10         |

---

### Task 1: `{cardTypes}` parameter type collapses the empty-state family

Today 12 definitions in 3 files cover `the character has no <plural>` and `I should see an empty <plural> section` for 6 card types. The feature lines are already uniform, so this task changes no Gherkin.

**Files:**

- Modify: `tests/e2e/support/parameterTypes.ts`
- Modify: `tests/e2e/step-definitions/character-display.steps.ts:161-185`
- Modify: `tests/e2e/step-definitions/combat.steps.ts` (delete `the character has no attacks` at :14, `I should see an empty attacks section` at :106, `the character has no special abilities` at :135, `I should see an empty special abilities section` at :187)
- Modify: `tests/e2e/step-definitions/ability-enhancements.steps.ts` (delete `the character has no abilities` at :35 and `I should see an empty abilities section` at :120)
- Test: `tests/e2e/features/{character-display,combat,ability-enhancements}.feature` (unchanged; they are the regression net)

**Interfaces:**

- Produces: the parameter type `{cardTypes}`. It matches `special abilities|abilities|cyphers|artifacts|oddities|attacks` and transforms to the section's empty-state test id (e.g. `"special abilities"` → `"empty-special-abilities"`).

- [ ] **Step 1: Register the parameter type**

Append to `tests/e2e/support/parameterTypes.ts`:

```ts
// Plural card words as written in empty-state steps, mapped to the
// data-testid of that section's empty-state element.
const EMPTY_STATE_TEST_IDS: Record<string, string> = {
  cyphers: "empty-cyphers",
  artifacts: "empty-artifacts",
  oddities: "empty-oddities",
  attacks: "empty-attacks",
  abilities: "empty-abilities",
  "special abilities": "empty-special-abilities",
};

defineParameterType({
  name: "cardTypes",
  regexp: /special abilities|abilities|cyphers|artifacts|oddities|attacks/,
  transformer: (s: string) => EMPTY_STATE_TEST_IDS[s],
});
```

- [ ] **Step 2: Add the two generic steps next to the old ones and watch them collide (red)**

In `character-display.steps.ts`, add the following above `// Scenario 6: View empty character items sections`. Import `CustomWorld` as a type from `../support/world.js` if it isn't imported already.

```ts
Given("the character has no {cardTypes}", async function (this: CustomWorld, _emptyTestId: string) {
  await startNewCharacter(this.page, this.getBaseUrl());
});

Then(
  "I should see an empty {cardTypes} section",
  async function (this: CustomWorld, emptyTestId: string) {
    await expect(this.dom.getByTestId(emptyTestId)).toBeVisible();
  }
);
```

Run: `npm run test:e2e -- tests/e2e/features/combat.feature`
Expected: FAIL with `Multiple step definitions match` for `the character has no attacks`. That proves the new pattern matches the existing lines.

- [ ] **Step 3: Delete the 12 old definitions**

Delete these:

- `character-display.steps.ts`: `the character has no cyphers`, `… no artifacts`, `… no oddities`, `I should see an empty cyphers section`, `… artifacts section`, `… oddities section`
- `combat.steps.ts`: the 4 listed under **Files**
- `ability-enhancements.steps.ts`: the 2 listed under **Files**

Then remove any import that becomes unused (`startNewCharacter` in `combat.steps.ts` / `ability-enhancements.steps.ts`, if nothing else there uses it).

- [ ] **Step 4: Run the three features (green)**

Run each of these in turn:

- `npm run test:e2e -- tests/e2e/features/character-display.feature`
- `npm run test:e2e -- tests/e2e/features/combat.feature`
- `npm run test:e2e -- tests/e2e/features/ability-enhancements.feature`

Expected: all pass. `character-display.feature` stacks `no cyphers` / `no artifacts` / `no oddities` (Review Focus 4). Each now starts a new character, and the scenario must still pass.

- [ ] **Step 5: Catalog, lint, commit**

Run `npm run docs:steps`, then `npm run check:steps` (expect 674 definitions, all used), then `npm run lint`.

Present the diff for review (Rule 1), then:

```bash
git add tests/e2e/support/parameterTypes.ts tests/e2e/step-definitions tests/e2e/STEP_CATALOG.md && git commit -m "test(e2e): collapse empty-state steps onto a {cardTypes} parameter type" -m "Six card types had a hand-written 'has no X' and 'empty X section' step each across three files." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `this.setup.replaceCharacter` / `updateCharacter` replace the hand-rolled set→reload sites

**Files:**

- Modify: `tests/e2e/support/setup.ts`
- Modify: `tests/e2e/step-definitions/card-reordering.steps.ts:18-38` (`setupCyphersWithNames`) and `:245-263` (`setupAbilitiesWithNames`)
- Modify: `tests/e2e/step-definitions/recovery-damage-track.steps.ts:70-97` (`the character is {string}`) and `:136-150` (`the character has recovery modifier {int}`)
- Modify: `tests/e2e/step-definitions/resource-tracker-editing.steps.ts:52-66` (`the character was saved with a single legacy XP value of {int}`)
- Modify: `tests/e2e/step-definitions/version-history.steps.ts:259-270` (`the character has a portrait image`)
- Test: `tests/e2e/features/{card-reordering,recovery-damage-track,resource-tracker-editing,version-history}.feature`

**Interfaces:**

- Consumes: `TestStorageHelper.getCharacter(): Promise<any>`, `setCharacter(c: any): Promise<void>`, and `waitForCharacterSheetReady(page)` from `app-ready.ts`
- Produces on `SetupDsl` (reached through `this.setup` / `world.setup`):
  - `replaceCharacter(character: unknown): Promise<void>` stores the value exactly as given (legacy shapes included), reloads, and waits until the sheet is ready.
  - `updateCharacter(mutate: (character: Character) => void): Promise<void>` loads the stored character, lets `mutate` change it in place, then calls `replaceCharacter`. It throws if storage is empty.
  - `character(overrides)` is unchanged externally and now delegates to `replaceCharacter`.

- [ ] **Step 1: Write the helper with a loud failure for empty storage**

Replace the body of `tests/e2e/support/setup.ts` with:

```ts
import type { CustomWorld } from "./world.js";
import type { Character } from "../../../src/types/character.js";
import { waitForCharacterSheetReady } from "./app-ready.js";
import { FULL_CHARACTER, EMPTY_ARRAYS } from "./cardTestFixtures.js";

export class SetupDsl {
  constructor(private world: CustomWorld) {}

  /**
   * Replaces the character in storage with FULL_CHARACTER plus the given
   * overrides, reloads, and waits for the sheet to be ready. This is the
   * same "Kael the Wanderer" template every card fixture already builds on.
   */
  async character(overrides: Record<string, unknown> = {}): Promise<void> {
    await this.replaceCharacter({ ...FULL_CHARACTER, ...EMPTY_ARRAYS, ...overrides });
  }

  /**
   * Stores `character` exactly as given — including legacy or deliberately
   * malformed shapes a migration scenario needs — reloads, and waits.
   */
  async replaceCharacter(character: unknown): Promise<void> {
    await this.world.storageHelper.setCharacter(character);
    await this.world.page.reload();
    await waitForCharacterSheetReady(this.world.page);
  }

  /**
   * Applies `mutate` to the character currently in storage, then reloads.
   * Throws rather than silently skipping when storage is still empty: a
   * step that no-ops here passes for the wrong reason.
   */
  async updateCharacter(mutate: (character: Character) => void): Promise<void> {
    const character = (await this.world.storageHelper.getCharacter()) as Character | null;
    if (!character) {
      throw new Error(
        "setup.updateCharacter: no character in storage yet — navigate with waitForCharacterSheetReady first"
      );
    }
    mutate(character);
    await this.replaceCharacter(character);
  }
}
```

- [ ] **Step 2: Migrate `card-reordering.steps.ts`**

```ts
async function setupCyphersWithNames(world: CustomWorld, names: string[]): Promise<void> {
  const cyphers = names.map((name) => ({ name, level: "1d6", effect: `Effect of ${name}` }));
  await world.setup.updateCharacter((character) => {
    character.cyphers = cyphers;
  });
  await world.page.waitForSelector('[data-testid="cyphers-section"]');
}
```

```ts
async function setupAbilitiesWithNames(world: CustomWorld, names: string[]): Promise<void> {
  const abilities = names.map((name) => ({
    name,
    description: `Description of ${name}`,
    cost: 1,
    pool: "might" as const,
    action: "Action",
  }));
  await world.setup.updateCharacter((character) => {
    character.abilities = abilities;
  });
  await world.page.waitForSelector('[data-testid="abilities-section"]');
}
```

Remove the `waitForCharacterSheetReady` import if nothing else in the file uses it.

If `tsc`/lint rejects the object literals against `Cypher`/`Ability`, the fixture is missing a required field. Add that field to the literal. Don't cast.

Run: `npm run test:e2e -- tests/e2e/features/card-reordering.feature`
Expected: PASS

- [ ] **Step 3: Migrate `recovery-damage-track.steps.ts`**

Keep each step's trailing `waitForSelector` / `waitForFunction` block as it is. Replace only the fetch → `waitForTimeout(500)` → set → `waitForTimeout(500)` → reload → ready sequence:

```ts
Given("the character is {string}", async function (this: CustomWorld, impairmentStatus: string) {
  await this.setup.updateCharacter((character) => {
    character.damageTrack.impairment = impairmentStatus as DamageTrack["impairment"];
  });
  // …existing damage-track-section / radio waitForFunction block unchanged…
});
```

```ts
Given(
  "the character has recovery modifier {int}",
  async function (this: CustomWorld, modifier: number) {
    await this.setup.updateCharacter((character) => {
      character.recoveryRolls.modifier = modifier;
    });
    // …existing "1d6 + X" waitForFunction block unchanged…
  }
);
```

Add `import type { DamageTrack } from "../../../src/types/character.js";` (check that the interface is exported under that name at `src/types/character.ts:55`). Add `this: CustomWorld` to both signatures.

The two `waitForTimeout(500)` calls were workarounds for the bootstrap-save race that `waitForCharacterSheetReady` now closes. **Delete them.**

Run `npm run test:e2e -- tests/e2e/features/recovery-damage-track.feature` **twice**.
Expected: PASS both times. If either run flakes, put back one `waitForTimeout(500)` _before_ `updateCharacter` with a comment naming the race, and note it in the review.

- [ ] **Step 4: Migrate the legacy-XP and portrait steps**

`resource-tracker-editing.steps.ts`: the stored shape is deliberately _not_ a `Character`, so it uses `replaceCharacter`.

```ts
const character = { ...rest, xp: legacyXp };
await this.setup.replaceCharacter(character);
// …existing waitForFunction on the XP cells unchanged…
```

Delete the two surrounding `waitForTimeout(500)` calls.

`version-history.steps.ts`:

```ts
Given("the character has a portrait image", async function (this: CustomWorld) {
  // 1x1 transparent PNG
  const portrait =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  await this.setup.updateCharacter((character) => {
    character.portrait = portrait;
  });
  this.uploadedPortrait = portrait;
});
```

Run `npm run test:e2e -- tests/e2e/features/resource-tracker-editing.feature`, then `npm run test:e2e -- tests/e2e/features/version-history.feature`.
Expected: PASS both

- [ ] **Step 5: Verify the metric, lint, commit**

Run: `grep -rn "reload()" tests/e2e/step-definitions tests/e2e/support`

Expected, with nothing else remaining:

- `support/setup.ts`
- `common-steps.ts` (the "refresh" step)
- `additional-fields-editing.steps.ts` (userAgent override)
- `version-history.steps.ts` (`I refresh the browser`)
- the 4 `section-rearrangement.steps.ts` sites (Task 3)

Run `npm run lint` and `npm run check:steps` (no definitions changed, so the catalog must still be current).

Present, then:

```bash
git add tests/e2e/support/setup.ts tests/e2e/step-definitions && git commit -m "test(e2e): seed stored characters through setup.updateCharacter" -m "Six steps hand-rolled get, set, sleep, reload, wait, and skipped the write silently when storage was still empty. updateCharacter throws instead." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: `this.setup.layout()` replaces the four layout-seeding reloads

**Files:**

- Modify: `tests/e2e/support/setup.ts`
- Modify: `tests/e2e/step-definitions/section-rearrangement.steps.ts`:
  - `I have customized the layout` (~:174)
  - `I have the default layout` (~:231)
  - the move-to-top step whose `page.evaluate` builds `fixedSections`/`rearrangeableSections` (~:290-325)
  - the grid-seeding step (~:470-500)
- Test: `tests/e2e/features/section-rearrangement.feature`, `tests/e2e/features/settings*.feature` (whichever uses `I have customized the layout`; find it with `grep -rln "customized the layout" tests/e2e/features`)

**Interfaces:**

- Consumes: `LAYOUT_STORAGE_KEY` from `src/storage/storageConstants.ts:35` and `Layout` from `src/types/layout.ts`
- Produces: `SetupDsl.layout(layout: Layout | null): Promise<void>`. `null` removes the saved layout, so the app falls back to `DEFAULT_LAYOUT`. It then reloads and waits for the sheet to be ready.

- [ ] **Step 1: Add `layout()` to `SetupDsl`**

```ts
import { LAYOUT_STORAGE_KEY } from "../../../src/storage/storageConstants.js";
import type { Layout } from "../../../src/types/layout.js";
```

```ts
  /**
   * Seeds the saved section layout (null = none saved, so the app uses
   * DEFAULT_LAYOUT), reloads, and waits for the sheet to be ready.
   */
  async layout(layout: Layout | null): Promise<void> {
    await this.world.page.evaluate(
      ({ key, value }) => {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      },
      { key: LAYOUT_STORAGE_KEY, value: layout === null ? null : JSON.stringify(layout) }
    );
    await this.world.page.reload();
    await waitForCharacterSheetReady(this.world.page);
  }
```

- [ ] **Step 2: Migrate the four steps**

Build each layout in Node as a typed `Layout` and hand it to `this.setup.layout(...)`. Keep every line after the reload unchanged, for example re-entering edit mode with `page.click('[data-testid="edit-layout-button"]')`.

```ts
Given("I have customized the layout", async function (this: CustomWorld) {
  await this.setup.layout([
    { type: "single", id: "basicInfo" },
    { type: "single", id: "stats" },
    { type: "single", id: "recoveryDamage" },
    { type: "single", id: "cyphers" }, // moved up
    { type: "single", id: "abilities" },
    { type: "grid", items: ["specialAbilities", "attacks"] },
    { type: "single", id: "items" },
    { type: "grid", items: ["background", "notes"] },
  ]);
});

Given("I have the default layout", async function (this: CustomWorld) {
  await this.setup.layout(null);
});
```

For the move-to-top step:

```ts
const fixed: SectionId[] = ["basicInfo", "stats", "recoveryDamage"];
const rearrangeable: SectionId[] = [
  "abilities",
  "specialAbilities",
  "attacks",
  "cyphers",
  "items",
  "background",
  "notes",
];
const order = [id, ...rearrangeable.filter((existing) => existing !== id)];
await this.setup.layout([...fixed, ...order].map((sid) => ({ type: "single", id: sid })));
// …re-enter edit mode, existing code…
```

For the grid step:

```ts
await this.setup.layout([
  { type: "single", id: "basicInfo" },
  { type: "single", id: "stats" },
  { type: "single", id: "recoveryDamage" },
  { type: "single", id: "abilities" },
  { type: "single", id: "specialAbilities" },
  { type: "single", id: "attacks" },
  { type: "single", id: "cyphers" },
  { type: "single", id: "items" },
  { type: "grid", items: [id1, id2] },
]);
// …re-enter edit mode, existing code…
```

Import `SectionId` from `../../../src/types/layout.js` as a type if it isn't already.

- [ ] **Step 3: Run and commit**

Run `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature`, plus the settings feature found above.
Expected: PASS. The `@skip` count in `section-rearrangement.feature` stays 7.

Run: `grep -rn "reload()" tests/e2e/step-definitions/section-rearrangement.steps.ts`
Expected: no output

Lint, `check:steps`, present, then:

```bash
git add tests/e2e/support/setup.ts tests/e2e/step-definitions/section-rearrangement.steps.ts && git commit -m "test(e2e): seed saved layouts through setup.layout" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: One export-capture helper; `I export the character` becomes the only capturing step

`I click the export button` (lowercase, capturing) and `I click the Export button` (capitalised, plain click) differ only in case. The capture stub exists three times: `character-file-export.steps.ts:35`, `section-rearrangement.steps.ts:541` (`I export the character`), and implicitly in `version-history.steps.ts`, whose Then-steps read `window.__exportedData` directly.

**Files:**

- Create: `tests/e2e/support/exportCapture.ts`
- Modify: `tests/e2e/support/world.ts` (the `ExportedCharacterFile` interface at :16; delete `exportedLayoutData` at :35 and :61)
- Modify: `tests/e2e/step-definitions/character-file-export.steps.ts` (replace `I click the export button` with `I export the character`)
- Modify: `tests/e2e/step-definitions/section-rearrangement.steps.ts` (delete its `I export the character`; `the exported file should contain the layout configuration` reads `this.exportedFileData`)
- Modify: `tests/e2e/step-definitions/version-history.steps.ts` (the three `the exported file should …` Then-steps at ~:817-870 read `this.exportedFileData`; drop their `waitForTimeout(1000)`)
- Modify features, 5 lines `When I click the export button` → `When I export the character`:
  - `character-file-export.feature:11,17,25`
  - `export-enhancement.feature:37`
  - `version-history.feature:177`

**Interfaces:**

- Produces:
  - `installExportCapture(page: Page): Promise<void>`
  - `waitForExportCapture(page: Page): Promise<CapturedExport>`, where `interface CapturedExport { filename: string; data: string }`
  - The step `When I export the character` sets `this.exportedFilename: string` and `this.exportedFileData: ExportedCharacterFile`.
  - `ExportedCharacterFile` gains `layout?: unknown[]` and `versionHistory?: unknown`.

- [ ] **Step 1: Point the five feature lines at the canonical phrasing (red)**

Edit the 5 lines listed above.

Run: `npm run test:e2e -- tests/e2e/features/character-file-export.feature`
Expected: FAIL at `Then a file export should be triggered`. The When-line now resolves to `section-rearrangement.steps.ts`'s `I export the character`, which stores only `exportedLayoutData`, so `this.exportedFilename` is undefined. That failure is the red for this task.

- [ ] **Step 2: Create `tests/e2e/support/exportCapture.ts`**

Port the body of `character-file-export.steps.ts`'s stub (showSaveFilePicker mock plus the `<a download>` fallback) here, typed:

```ts
import type { Page } from "@playwright/test";

declare global {
  interface Window {
    __exportedFilename?: string;
    __exportedData?: string;
  }
}

export interface CapturedExport {
  filename: string;
  data: string;
}

interface WritableStub {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}

/**
 * Stubs both export paths the app uses — showSaveFilePicker (Chromium) and the
 * <a download> blob fallback (WebKit/Firefox) — so an export lands in
 * window.__exportedFilename / __exportedData instead of on disk.
 */
export async function installExportCapture(page: Page): Promise<void> {
  await page.evaluate(() => {
    delete window.__exportedFilename;
    delete window.__exportedData;

    (
      window as unknown as {
        showSaveFilePicker: (o: { suggestedName: string }) => Promise<unknown>;
      }
    ).showSaveFilePicker = async (options) => {
      window.__exportedFilename = options.suggestedName;
      return {
        name: options.suggestedName,
        kind: "file",
        createWritable: async (): Promise<WritableStub> => ({
          write: async (data: string) => {
            window.__exportedData = data;
          },
          close: async () => {},
        }),
        queryPermission: async () => "granted",
      };
    };

    const originalCreateElement = document.createElement.bind(document);
    document.createElement = ((tagName: string, options?: ElementCreationOptions) => {
      const element = originalCreateElement(tagName, options);
      if (element instanceof HTMLAnchorElement) {
        element.click = () => {
          window.__exportedFilename = element.download;
          if (element.href.startsWith("blob:")) {
            void fetch(element.href)
              .then((res) => res.text())
              .then((data) => {
                window.__exportedData = data;
              });
          }
        };
      }
      return element;
    }) as typeof document.createElement;
  });
}

/** Waits until the stubbed export has delivered both filename and data. */
export async function waitForExportCapture(page: Page): Promise<CapturedExport> {
  await page.waitForFunction(
    () => window.__exportedFilename !== undefined && window.__exportedData !== undefined
  );
  return page.evaluate(() => ({
    filename: window.__exportedFilename as string,
    data: window.__exportedData as string,
  }));
}
```

`page.evaluate` bodies run in the browser, so `WritableStub` is only a compile-time annotation there. If the evaluate serialiser complains about the interface reference, inline the type.

- [ ] **Step 3: One `I export the character` definition**

In `character-file-export.steps.ts`, delete `When("I click the export button", …)` in full and add:

```ts
When("I export the character", async function (this: CustomWorld) {
  await installExportCapture(this.page);
  await this.page.getByTestId("export-button").click();
  const captured = await waitForExportCapture(this.page);
  this.exportedFilename = captured.filename;
  this.exportedFileData = JSON.parse(captured.data) as ExportedCharacterFile;
});
```

Delete `When("I export the character", …)` from `section-rearrangement.steps.ts`. Change its layout assertion to read `this.exportedFileData?.layout`. In `world.ts`:

- add `layout?: unknown[];` and `versionHistory?: unknown;` to `ExportedCharacterFile`
- delete both `exportedLayoutData` declarations

In `version-history.steps.ts`, change each of the three Then-steps to start from `const exported = this.exportedFileData; expect(exported).toBeTruthy();`. Delete their `page.evaluate(() => (window as any).__exportedData)` blocks and the `waitForTimeout(1000)`.

- [ ] **Step 4: Run every affected feature (green)**

Run each of these; expected: all PASS.

- `npm run test:e2e -- tests/e2e/features/character-file-export.feature`
- `npm run test:e2e -- tests/e2e/features/export-enhancement.feature`
- `npm run test:e2e -- tests/e2e/features/version-history.feature`
- `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature`

Run: `grep -rn "__exportedData" tests/e2e/step-definitions`
Expected: no output

- [ ] **Step 5: Catalog, lint, commit**

`npm run docs:steps`, `npm run check:steps` (one definition fewer), `npm run lint`. Present, then:

```bash
git add tests/e2e && git commit -m "test(e2e): share one export capture behind 'I export the character'" -m "'I click the export button' and 'I click the Export button' differed only in case but only the lowercase one stubbed the file picker. Capturing is now its own phrase and waits for the data instead of sleeping." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Name the 3-version fixture honestly

`version-history.steps.ts:70` `the character has a version with name change` builds **3** versions. `version-comparison.steps.ts:90` `… with a name change` builds **2**. They're the same phrase with different fixtures.

**Files:**

- Modify: `tests/e2e/step-definitions/version-history.steps.ts:70-97` (delete) and add `the character has a later version`
- Modify: `tests/e2e/features/version-history.feature:124`

**Interfaces:**

- Consumes: `TestStorageHelper.getAllVersions(): Promise<Array<{ character: Character }>>`, `createVersion(c, description)`, and the existing `the character has a version with a name change` (version-comparison)
- Produces: the step `Given the character has a later version`, which appends one version and waits for the counter to show `Version N of N`.

- [ ] **Step 1: Rewrite the scenario (red)**

`version-history.feature`, scenario "Version description shows what changed":

```gherkin
    Scenario: Version description shows what changed
        Given the character has a version with a name change
        And the character has a later version
        And I am viewing that version
        Then the version description should contain "Changed name"
        And the timestamp should be in human-readable format
```

Run: `npm run test:e2e -- tests/e2e/features/version-history.feature --name "Version description shows what changed"`
Expected: FAIL, undefined step `the character has a later version`

- [ ] **Step 2: Add the step, delete the old fixture**

```ts
Given("the character has a later version", async function (this: CustomWorld) {
  const versions = await this.storageHelper.getAllVersions();
  const latest = versions[versions.length - 1].character;
  await this.storageHelper.createVersion({ ...latest, name: "Latest Version" }, "Another change");
  const count = versions.length + 1;
  await expect(this.page.locator('[data-testid="version-counter"]')).toContainText(
    `Version ${count} of ${count}`,
    { timeout: 10000 }
  );
});
```

Delete `Given("the character has a version with name change", …)`. Update the comment in `I am viewing that version` (:300): it now reads "a name-change version followed by a later version".

- [ ] **Step 3: Run and commit**

Run `npm run test:e2e -- tests/e2e/features/version-history.feature`, then `npm run test:e2e -- tests/e2e/features/version-comparison.feature`.
Expected: PASS both

`docs:steps`, `check:steps`, lint. Present, then:

```bash
git add tests/e2e && git commit -m "test(e2e): split the 3-version name-change fixture into two honest steps" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Delete the four `@skip` scenarios that are vague or already covered

**Files:**

- Modify: `tests/e2e/features/character-display.feature:95-126`

- [ ] **Step 1: Delete these scenarios, with their tag lines**
  - `Display character on mobile viewport (320px width)`, `… tablet … (768px width)`, `… desktop … (1280px width)`. Rule 9 already runs every scenario on Desktop Chrome, Pixel 5, iPhone 12 and iPad Pro, and their assertions ("optimized arrangement") aren't checkable. The one concrete idea, no horizontal scrolling, becomes Task 8.
  - `View character with maximum cypher limit (Tier 3)`. Max cyphers is an editable badge value, not derived from tier, and `resource-tracker-editing.feature:179-181` covers the badge.

- [ ] **Step 2: Verify and commit**

Run `npm run docs:steps`. The catalog's "Feature lines with no matching step definition" section shrinks from 24 lines to the remaining 3 scenarios' lines. Then run `npm run check:steps` and `npm run test:e2e -- tests/e2e/features/character-display.feature` (PASS, with 3 skipped instead of 7).

Present, then:

```bash
git add tests/e2e/features/character-display.feature tests/e2e/STEP_CATALOG.md && git commit -m "test(e2e): drop never-implemented responsive and tier-limit scenarios" -m "Every scenario already runs on all four device profiles, and max cyphers is covered by the resource-tracker badge scenarios." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Special characters are shown verbatim

**Files:**

- Modify: `tests/e2e/features/character-display.feature` (the `View character with special characters in text fields` scenario)
- Modify: `tests/e2e/step-definitions/character-display.steps.ts`

**Interfaces:**

- Consumes: `this.setup.updateCharacter` (Task 2)
- Produces these steps:
  - `Given the character has the following text:` takes a data table with columns `Field | Content`, where Field is `Name` or `Background`.
  - `Then the character text should read exactly:` takes the same table.
  - `Then no markup from the text should be rendered as HTML`

- [ ] **Step 1: Rewrite the scenario (red)**

```gherkin
    Scenario: Text with quotes, ampersands and angle brackets is shown verbatim
        Given I am on the character sheet page
        And the character has the following text:
            | Field      | Content                                   |
            | Name       | Kael "The Swift" O'Connor                 |
            | Background | Born in <Unknown Location> & raised alone |
        Then the character text should read exactly:
            | Field      | Content                                   |
            | Name       | Kael "The Swift" O'Connor                 |
            | Background | Born in <Unknown Location> & raised alone |
        And no markup from the text should be rendered as HTML
```

Remove its `@validation @skip` tag and keep `@validation`.

Run: `npm run test:e2e -- tests/e2e/features/character-display.feature --name "shown verbatim"`
Expected: FAIL, undefined step

- [ ] **Step 2: Implement the steps**

In `character-display.steps.ts` (add `DataTable` to the `@cucumber/cucumber` import):

```ts
type TextRow = { Field: string; Content: string };

const TEXT_FIELD_SETTERS: Record<string, (character: Character, value: string) => void> = {
  Name: (character, value) => {
    character.name = value;
  },
  Background: (character, value) => {
    character.textFields.background = value;
  },
};

Given(
  "the character has the following text:",
  async function (this: CustomWorld, table: DataTable) {
    const rows = table.hashes() as TextRow[];
    await this.setup.updateCharacter((character) => {
      for (const { Field, Content } of rows) {
        const set = TEXT_FIELD_SETTERS[Field];
        if (!set) throw new Error(`Unknown text field: ${Field}`);
        set(character, Content);
      }
    });
  }
);

Then(
  "the character text should read exactly:",
  async function (this: CustomWorld, table: DataTable) {
    for (const { Field, Content } of table.hashes() as TextRow[]) {
      if (Field === "Name") {
        await expect(this.dom.getByTestId("character-name")).toHaveText(Content);
      } else if (Field === "Background") {
        // Background renders as a <textarea>, so its text is the element's value.
        await expect(this.dom.getByTestId("character-background")).toHaveValue(Content);
      } else {
        throw new Error(`Unknown text field: ${Field}`);
      }
    }
  }
);

Then("no markup from the text should be rendered as HTML", async function (this: CustomWorld) {
  // "<Unknown Location>" would parse as an <unknown> element if interpolated as HTML.
  await expect(this.page.locator("unknown")).toHaveCount(0);
});
```

Import `Character` as a type from `../../../src/types/character.js`.

- [ ] **Step 3: Green, then prove the assertion can fail**

Run the scenario. Expected: PASS, because lit-html escapes interpolated text.

Sanity check: temporarily change the expected Name row to `Kael "The Swift" OConnor` and re-run. It must FAIL. Revert the change.

- [ ] **Step 4: Catalog, lint, commit**

```bash
git add tests/e2e && git commit -m "test(e2e): pin verbatim display of quotes, ampersands and angle brackets" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Long text never makes the sheet scroll sideways

**Files:**

- Modify: `tests/e2e/features/character-display.feature` (replaces `View character with long text content`)
- Modify: `tests/e2e/step-definitions/character-display.steps.ts`
- Possibly modify: the stylesheet that styles `.character-name` (find it with `grep -rn "\.character-name" src/styles`), only if Step 3 is red

**Interfaces:**

- Consumes: `this.setup.updateCharacter` (Task 2)
- Produces these steps:
  - `Given the character has a {int}-character name without spaces`
  - `Given the character has a {int}-character background without spaces`
  - `Then the page should not scroll horizontally`

- [ ] **Step 1: Rewrite the scenario (red)**

```gherkin
    @validation
    Scenario: Long unbroken text does not make the sheet scroll sideways
        Given I am on the character sheet page
        And the character has a 50-character name without spaces
        And the character has a 600-character background without spaces
        Then the page should not scroll horizontally
```

50 is `validateName`'s maximum (`src/utils/unified-validation.ts:70`), so this is a name a user can really enter.

Run: `npm run test:e2e -- tests/e2e/features/character-display.feature --name "scroll sideways"`
Expected: FAIL, undefined step

- [ ] **Step 2: Implement the steps**

```ts
Given(
  "the character has a {int}-character name without spaces",
  async function (this: CustomWorld, length: number) {
    await this.setup.updateCharacter((character) => {
      character.name = "W".repeat(length);
    });
  }
);

Given(
  "the character has a {int}-character background without spaces",
  async function (this: CustomWorld, length: number) {
    await this.setup.updateCharacter((character) => {
      character.textFields.background = "W".repeat(length);
    });
  }
);

Then("the page should not scroll horizontally", async function (this: CustomWorld) {
  const { scrollWidth, clientWidth } = await this.page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});
```

- [ ] **Step 3: Run on every device profile**

Run: `npm run test:e2e -- tests/e2e/features/character-display.feature --name "scroll sideways"` (the Playwright config runs it on all four devices)

- **If it passes:** do the sanity check. Temporarily add `document.body.style.minWidth = "3000px"` in a `page.evaluate` before the assertion, confirm it FAILS, then remove it.
- **If it fails on any device:** that is a real bug (Review Focus 2), and this scenario is its Rule 2 test. Add `overflow-wrap: anywhere;` to the `.character-name` rule in the stylesheet found above, re-run until it passes on all devices, and mention the production change explicitly in the review.

- [ ] **Step 4: Catalog, lint, commit**

If the CSS changed, use `fix(style): wrap unbroken character names instead of widening the sheet` as the commit type/subject and include `src/styles` in the add. Otherwise:

```bash
git add tests/e2e && git commit -m "test(e2e): pin that long unbroken text keeps the sheet within the viewport" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Sections appear in the default layout order

**Files:**

- Modify: `tests/e2e/features/character-display.feature` (replaces `View all character sections in correct order`)
- Modify: `tests/e2e/step-definitions/character-display.steps.ts`

**Interfaces:**

- Consumes: `Given I have the default layout` (Task 3, now `this.setup.layout(null)`) and `sectionId(name)` from `tests/e2e/support/sections.ts`
- Produces: the step `Then I should see sections in this order:`. It takes a one-column table of display names from `SECTION_DISPLAY_NAMES` and compares them with the DOM order of `[data-section-id]`.

- [ ] **Step 1: Rewrite the scenario (red)**

```gherkin
    @validation
    Scenario: Sections appear in the default layout order
        Given I am on the character sheet page
        And I have the default layout
        Then I should see sections in this order:
            | Basic Info        |
            | Stats             |
            | Recovery & Damage |
            | Abilities         |
            | Special Abilities |
            | Attacks           |
            | Cyphers           |
            | Items             |
            | Background        |
            | Notes             |
```

This is `DEFAULT_LAYOUT` (`src/types/layout.ts:146`) flattened. Grid pairs contribute left then right.

Run: `npm run test:e2e -- tests/e2e/features/character-display.feature --name "default layout order"`
Expected: FAIL, undefined step `I should see sections in this order:`

- [ ] **Step 2: Implement the step**

```ts
Then("I should see sections in this order:", async function (this: CustomWorld, table: DataTable) {
  const expected = table.raw().map(([name]) => sectionId(name));
  const actual = await this.page
    .locator("[data-section-id]")
    .evaluateAll((els) => els.map((el) => el.getAttribute("data-section-id")));
  expect(actual).toEqual(expected);
});
```

Import `sectionId` from `../support/sections.js`.

- [ ] **Step 3: Green, then prove it can fail**

Run the scenario. Expected: PASS.

Sanity check: temporarily swap `Cyphers` and `Items` in the table, re-run, confirm FAIL, then revert.

Run the full feature: `npm run test:e2e -- tests/e2e/features/character-display.feature`. Expected: PASS with **0** skipped.

- [ ] **Step 4: Catalog, lint, commit**

`npm run docs:steps`. The "Feature lines with no matching step definition" section must now be empty. Then `check:steps`, lint, and present.

```bash
git add tests/e2e && git commit -m "test(e2e): pin the default section order against DEFAULT_LAYOUT" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Full verification and docs

**Files:**

- Modify: `docs/TODO.md`
- Modify: `tests/implementation-plan.md` (a status note at the top)

- [ ] **Step 1: Full suite as CI runs it**

Run each of these:

- `npm run test:unit` (expect 901)
- `npm run lint`
- `npm run check:steps`
- `npm run test:e2e:prod`

Record the E2E numbers. Expected: 7 `@skip` (only `section-rearrangement.feature`'s), and the passing count is 405 + 3 new scenarios × however many profiles the run counts. Write down the real figure; don't compute it.

- [ ] **Step 2: Update `docs/TODO.md`**

- In "📊 Current Status": new unit / E2E / skipped numbers, and the step-definition count from `npm run docs:steps`.
- Delete the three "🚨 Must-Have" entries (DSL consolidation, undocumented `@skip`s, ability wording). Replace them with this one entry:

  ```markdown
  ### `a character exists with the following data:` ignores its table

  **Overview**
  `character-display.feature`'s Background passes a data table that
  `character-display.steps.ts:5` discards; the scenarios pass only because the
  default character happens to match. Wire it to `this.setup.character()` or
  delete the Background.
  ```

- Restore the missing `### Character Sharing` heading above the orphaned "Share characters with other players…" Overview in the backlog.
- Set **Last Updated** to the commit date.

- [ ] **Step 3: Status note on `tests/implementation-plan.md`**

Insert under the title:

```markdown
> **Status (2026-09-27):** complete. Phases 1–6 landed in #7; the remaining
> §7.3 families, §7.5 `@skip` triage and §11 reload metric were finished by
> `docs/superpowers/plans/2026-09-27-test-tech-debt-cleanup.md`.
```

- [ ] **Step 4: Commit**

```bash
git add docs/TODO.md tests/implementation-plan.md && git commit -m "docs(todo): record test tech-debt cleanup and new suite baseline" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
