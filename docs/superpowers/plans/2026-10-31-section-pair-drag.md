# Pairing and Unpairing Sections by Drag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In layout edit mode, let the drop position on a section decide between
"move into the gap above/below" and "pair side by side", with a preview, for
mouse and touch, and reorder-only below Tailwind's `lg` breakpoint.

**Architecture:** Three pure layers, each unit-tested on its own: `dropZoneAt`
turns a pointer position into a zone, `resolveDropIntent` turns zone + target +
layout into a `DropIntent`, and `applyDrop` turns layout + intent into a new
layout. `describeDropPreview` turns an intent into what to draw.
`SectionDragController` only wires pointer events to these and reports
`onDrop(sourceId, intent)`; `CharacterSheet` applies and persists the result.

**Tech Stack:** TypeScript strict, lit-html, Tailwind v4, Vitest + jsdom,
Cucumber + Playwright.

**Spec:** `docs/superpowers/specs/2026-10-31-section-pair-drag-design.md`

## Global Constraints

- All 11 rules in `CLAUDE.md`. Every behaviour task starts with its Gherkin
  scenario (Rule 2), then one failing unit test at a time (Rules 3, 10).
- Work on branch `feat/section-pair-drag`; one commit per task, conventional
  format (Rule 7). Rule 1 review before each commit unless the maintainer
  waives it.
- `@/` imports for `src/` (enforced by `no-restricted-imports`).
- No new user-facing string outside `t()`. Section names come from the
  existing `layout.sections.<id>` keys.
- Tailwind classes literal; preview styling in
  `src/styles/components/layout-editor.css` with `@theme` colours.
- Wide layout means `window.matchMedia("(min-width: 64rem)").matches` (Tailwind
  `lg`, the breakpoint at which `CharacterSheet` renders pairs side by side).
- Zone thresholds: wide: top `< 25 %` height, bottom `>= 75 %`, middle split at
  `50 %` width; narrow: top `< 50 %` height, else bottom.
- New files stay under 300 lines.
- Don't run `npm run format` on the whole repo (CRLF churn on this machine);
  run `npx prettier --write <touched files>`.
- E2E: one feature file during a task (`npm run test:e2e -- tests/e2e/features/section-rearrangement.feature`),
  all profiles in the last task.

## Review Focus

1. **A drop over the space between sections** (the `gap-6` gutters, or between
   a pair's columns) keeps the last intent instead of cancelling the drag or
   jumping. Pinned in Task 7 (mouse) and Task 8 (touch).
2. **Nested drag handlers inside sections** (Abilities, Cyphers and Items have
   their own card drag-reorder) must not swallow the section drag's
   `dragover`/`drop`, or eat the zone. Pinned in Task 2 by dropping on the
   bottom edge of Items, which has nested cards.
3. **A no-op drop** (back into the gap it came from, onto its own pair side,
   onto its own pair's seam) shows no preview and writes nothing to storage.
   Pinned in Tasks 1, 5 and 6 via `applyDrop(...) === null` → `resolveDropIntent` returns `null`.
4. **Resizing across `lg` mid-session.** Zones must be re-evaluated per hover
   rather than cached at drag start. Pinned in Task 6 by a unit test that
   flips `matchMedia` between two hovers.
5. **The overlay preview must not move the layout.** (The live preview of Task
   7b moves it deliberately, after 300 ms still.) If an in-flow element shifted the
   target, the zone under the pointer would flip every frame. Pinned in Task 7:
   previews are pseudo-element overlays only, and a test asserts the
   target's bounding box is unchanged while previewing.

Reference layout used in tests below: `DEFAULT_LAYOUT` from
`src/types/layout.ts`, rows
`0 basicInfo · 1 stats · 2 recoveryDamage · 3 abilities · 4 [specialAbilities|attacks] · 5 cyphers · 6 items · 7 [background|notes]`.
Tests write `D` for it and `g(...)` / `s(...)` as shorthand for grid/single
items. Define those two helpers at the top of each new test file.

---

### Task 1: Refactor — drop intents replace `onReorder` (Rule 6)

Behaviour unchanged: a drop anywhere on a section still moves the source into
the gap before the target's row.

**Files:**

- Create: `src/types/layoutDrop.ts`
- Modify: `src/utils/layoutOperations.ts` (add `applyDrop`, `rowIndexOf`; delete `reorderLayout`)
- Modify: `src/components/helpers/SectionDragController.ts`
- Modify: `src/components/CharacterSheet.ts:23-27,89-94`
- Test: `tests/unit/layoutOperations.test.ts` (migrate the `reorderLayout` block to `applyDrop` gap tests)

**Interfaces:**

- Produces:

  ```ts
  // src/types/layoutDrop.ts
  export type DropZone = "top" | "bottom" | "left" | "right";
  export type PairSide = "left" | "right";
  export type DropIntent =
    | { kind: "gap"; index: number } // before row `index` of the input layout; layout.length = end
    | { kind: "pair"; targetId: SectionId; side: PairSide }
    | { kind: "breakPair"; rowIndex: number };
  ```

  `applyDrop(layout: Layout, sourceId: SectionId, intent: DropIntent): Layout | null`.
  It returns `null` when the drop is invalid or leaves the layout equal to its
  input (`layoutsAreEqual`). Task 1 implements only `gap`; other kinds return
  `null`.
  `rowIndexOf(layout: Layout, sectionId: SectionId): number` (-1 if absent).
  `SectionDragHost` becomes
  `{ isEditMode(): boolean; requestRender(): void; getLayout(): Layout; onDrop(sourceId: SectionId, intent: DropIntent): void }`.

- [ ] **Step 1: Write failing tests** in `layoutOperations.test.ts`, `describe("applyDrop — gap")`:
  ```ts
  expect(applyDrop(D, "cyphers", { kind: "gap", index: 3 })).toEqual([
    s("basicInfo"),
    s("stats"),
    s("recoveryDamage"),
    s("cyphers"),
    s("abilities"),
    g("specialAbilities", "attacks"),
    s("items"),
    g("background", "notes"),
  ]);
  // end of sheet
  expect(applyDrop(D, "abilities", { kind: "gap", index: 8 })?.at(-1)).toEqual(s("abilities"));
  // out of a pair: partner stays as a single in place
  expect(applyDrop(D, "attacks", { kind: "gap", index: 0 })).toEqual([
    s("attacks"),
    s("basicInfo"),
    s("stats"),
    s("recoveryDamage"),
    s("abilities"),
    s("specialAbilities"),
    s("cyphers"),
    s("items"),
    g("background", "notes"),
  ]);
  // no-ops: the gaps directly above and below the source's own row
  expect(applyDrop(D, "cyphers", { kind: "gap", index: 5 })).toBeNull();
  expect(applyDrop(D, "cyphers", { kind: "gap", index: 6 })).toBeNull();
  // input not mutated
  ```
  Also `rowIndexOf(D, "notes") === 7`, `rowIndexOf(D, "abilities") === 3`.
- [ ] **Step 2: Run** `npm run test:unit -- tests/unit/layoutOperations.test.ts`. Expected: FAIL, `applyDrop` not exported.
- [ ] **Step 3: Implement** `applyDrop` (gap only) and `rowIndexOf`. The gap index refers to the input layout's rows. Take the source out first (if it was a single row, later indices shift up by one), then insert `s(source)`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Switch the controller and sheet.** `SectionDragController` holds `intent: DropIntent | null` instead of `dropTargetId`. Hovering a section sets `{ kind: "gap", index: rowIndexOf(host.getLayout(), targetId) }`, and drop calls `host.onDrop`. `CharacterSheet` passes `getLayout: () => this.layout` and `onDrop: (id, intent) => this.applyLayout(applyDrop(this.layout, id, intent))`. Delete `reorderSections` and `reorderLayout` with its tests. Keep the `drop-target` class on the hovered section for now; Task 7 replaces it.
- [ ] **Step 6: Run** `npm run test:unit` and `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature`. Expected: all pass, no behaviour change.
- [ ] **Step 7: Commit** `refactor(layout): report section drops as drop intents`.

### Task 2: Top and bottom zones (gap above / gap below)

**Files:**

- Create: `src/utils/sectionDrop.ts`
- Modify: `src/components/helpers/SectionDragController.ts`, `src/utils/viewport.ts` (add `isWideLayout`)
- Modify: `tests/e2e/support/sections.ts` (zone points), `tests/e2e/step-definitions/grid-merge-split.steps.ts`
- Modify: `tests/e2e/features/section-rearrangement.feature`
- Test: `tests/unit/sectionDrop.test.ts`, `tests/unit/characterSheetDropZones.test.ts`

**Interfaces:**

- Consumes: `DropZone`, `DropIntent`, `applyDrop`, `rowIndexOf` (Task 1).
- Produces:
  `dropZoneAt(rect: { left: number; top: number; width: number; height: number }, x: number, y: number, wide: boolean): DropZone`.
  `resolveDropIntent(layout: Layout, sourceId: SectionId, targetId: SectionId, zone: DropZone, wide: boolean): DropIntent | null`.
  It returns `null` whenever `applyDrop` would return `null`.
  `isWideLayout(): boolean` in `src/utils/viewport.ts`.
  E2E helper: `type SectionZone = "top edge" | "bottom edge" | "middle left" | "middle right"`.
  `zonePoint(box, zone): Point` puts the pointer at 10 %/90 % height (x at 50 %) for the edges, and at 25 %/75 % width (y at 50 %) for the middles.
  `dragSectionTo(page, source, target, zone: SectionZone = "top edge")`.

- [ ] **Step 1: Write the scenarios** in `section-rearrangement.feature`:

  ```gherkin
  Scenario: Drop a section below another by its bottom edge
    Given layout edit mode is active
    When I drag the "Abilities" section onto the bottom edge of the "Items" section
    Then the "Items" section should appear before the "Abilities" section

  Scenario: Move a section to the end of the sheet
    Given layout edit mode is active
    When I drag the "Abilities" section onto the bottom edge of the "Notes" section
    Then the "Abilities" section should be the last section
  ```

  New steps: `I drag the {string} section onto the {zone} of the {string} section`. Register a Cucumber `defineParameterType` named `zone` matching the four `SectionZone` strings, in the steps file. Also add `the {string} section should be the last section`. Run the feature: expected FAIL (Abilities lands before Items).

- [ ] **Step 2: Failing unit tests** (`sectionDrop.test.ts`), one at a time. With `rect = { left: 0, top: 100, width: 400, height: 200 }` and `wide = true`: `(10,120)→"top"`, `(10,149)→"top"`, `(100,150)→"left"`, `(300,200)→"right"`, `(10,250)→"bottom"`. With `wide = false`: `(300,199)→"top"`, `(300,200)→"bottom"`.
      `resolveDropIntent(D, "items", "abilities", "top", true)` → `{ kind:"gap", index:3 }`; with `"bottom"` → `index: 4`. `(D, "items", "attacks", "top", true)` → `index: 4` (the pair's row). `(D, "abilities", "notes", "bottom", true)` → `index: 8`. `(D, "cyphers", "items", "top", true)` → `null` (no-op).
- [ ] **Step 3: Implement** `dropZoneAt`, the gap half of `resolveDropIntent` and `isWideLayout`. Run `npm run test:unit -- tests/unit/sectionDrop.test.ts`. Expected: PASS.
- [ ] **Step 4: Wire the controller.** On both mouse `dragover` and touch hover: find the hovered section element, then `zone = dropZoneAt(el.getBoundingClientRect(), x, y, isWideLayout())`, then `intent = resolveDropIntent(...)`. Re-render only when the intent changes. Call `preventDefault` on `dragover` only when `intent !== null`. Unit test in `characterSheetDropZones.test.ts`: stub `getBoundingClientRect` on the `items` wrapper, touch-hover at its 90 % height, drop, then expect `items` before `abilities` in the rendered order. Copy the touch helpers pattern from `characterSheetTouchDrag.test.ts`.
- [ ] **Step 5: Run** `npm run test:unit` and the feature file. Expected: PASS, including the existing reorder and touch scenarios (they drop near the top). The Items drop lands on its nested cards (Review Focus 2).
- [ ] **Step 6: Commit** `feat(layout): drop a section above or below another by its edge`.

### Task 3: Pair with a single section (wide screens)

**Files:**

- Modify: `src/utils/layoutOperations.ts`, `src/utils/sectionDrop.ts`
- Modify: `tests/e2e/features/section-rearrangement.feature`, `tests/e2e/step-definitions/grid-merge-split.steps.ts`
- Test: `tests/unit/layoutOperations.test.ts`, `tests/unit/sectionDrop.test.ts`

**Interfaces:**

- Consumes: Task 2's `resolveDropIntent`, `zonePoint`.
- Produces: the `pair` branch of `applyDrop` for single targets. E2E step
  `the grid should show {string} on the left and {string} on the right`.

- [ ] **Step 1: Scenarios.** Replace the `@skip`ped "Merge sections…" and "Cannot merge…" scenarios:

  ```gherkin
  Scenario Outline: Pair two sections by dropping on the middle of one
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I drag the "Cyphers" section onto the middle <side> of the "Items" section
    Then the grid should show "<left>" on the left and "<right>" on the right

    Examples:
      | side  | left    | right   |
      | right | Items   | Cyphers |
      | left  | Cyphers | Items   |

  Scenario Outline: Sections that cannot be paired are not paired
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I drag the "<source>" section onto the middle left of the "<target>" section
    Then the layout should still be the default layout

    Examples:
      | source | target |
      | Stats  | Items  |
      | Items  | Stats  |
  ```

  `the layout should still be the default layout` reads the stored layout through the existing setup/storage helpers and compares it with `DEFAULT_LAYOUT`. Delete the old steps `I drag the {string} section onto the {string} section`, `{string} and {string} should be displayed side by side in a grid`, `no grid should be created` and the empty `the sections should remain in single-column layout`. The step catalog check fails on unused steps. Run: expected FAIL.

- [ ] **Step 2: Failing unit tests**, one at a time:
  ```ts
  expect(applyDrop(D, "cyphers", { kind: "pair", targetId: "items", side: "right" })).toEqual([
    s("basicInfo"),
    s("stats"),
    s("recoveryDamage"),
    s("abilities"),
    g("specialAbilities", "attacks"),
    g("items", "cyphers"),
    g("background", "notes"),
  ]);
  // side left → g("cyphers", "items") at the same row
  // source from a pair: partner expands in place
  expect(applyDrop(D, "attacks", { kind: "pair", targetId: "cyphers", side: "left" })).toEqual([
    s("basicInfo"),
    s("stats"),
    s("recoveryDamage"),
    s("abilities"),
    s("specialAbilities"),
    g("attacks", "cyphers"),
    s("items"),
    g("background", "notes"),
  ]);
  expect(applyDrop(D, "stats", { kind: "pair", targetId: "items", side: "left" })).toBeNull();
  expect(applyDrop(D, "items", { kind: "pair", targetId: "stats", side: "left" })).toBeNull();
  ```
  `resolveDropIntent(D, "cyphers", "items", "right", true)` → `{ kind:"pair", targetId:"items", side:"right" }`, and `(D, "items", "stats", "left", true)` → `null`.
- [ ] **Step 3: Implement**, then run unit tests and the feature. Expected: PASS.
- [ ] **Step 4: Commit** `feat(layout): pair two sections by dropping on the middle of one`.

### Task 4: Pair with an already paired section; leaving a pair

**Files:** `src/utils/layoutOperations.ts`, the feature file, `grid-merge-split.steps.ts`, `tests/unit/layoutOperations.test.ts`.

**Interfaces:**

- Consumes: Task 3's `pair` branch.
- Produces: the `pair` branch for a paired target that is not the source's partner. The source takes the target's slot. The target goes to its own row below the pair if the source's row index (before the drop) is smaller than the pair's, otherwise above.

- [ ] **Step 1: Scenarios** (replacing the `@skip`ped "Split sections from grid by dragging out"):

  ```gherkin
  Scenario: Pairing with a paired section pushes it out below when coming from above
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I drag the "Cyphers" section onto the middle left of the "Notes" section
    Then the grid should show "Background" on the left and "Cyphers" on the right
    And "Notes" should be in its own row
    And the "Notes" section should be the last section

  Scenario: Pairing with a paired section pushes it out above when coming from below
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I drag the "Items" section onto the middle right of the "Attacks" section
    Then the grid should show "Special Abilities" on the left and "Items" on the right
    And "Attacks" should be in its own row
    And the "Attacks" section should appear before the "Special Abilities" section

  Scenario: Split sections from grid by dragging out
    Given layout edit mode is active
    And "Background" and "Notes" are in a grid
    When I drag the "Background" section onto the top edge of the "Cyphers" section
    Then "Background" should be in its own row
    And "Notes" should be in its own row
  ```

  Delete the old `I drag {string} out of the grid` step. Run: the first two FAIL; the split one passes already (Task 2), which is expected and covers the spec's "Leaving a pair".

- [ ] **Step 2: Failing unit tests:**
  ```ts
  expect(applyDrop(D, "cyphers", { kind: "pair", targetId: "notes", side: "left" })).toEqual([
    s("basicInfo"),
    s("stats"),
    s("recoveryDamage"),
    s("abilities"),
    g("specialAbilities", "attacks"),
    s("items"),
    g("background", "cyphers"),
    s("notes"),
  ]);
  expect(applyDrop(D, "items", { kind: "pair", targetId: "attacks", side: "right" })).toEqual([
    s("basicInfo"),
    s("stats"),
    s("recoveryDamage"),
    s("abilities"),
    s("attacks"),
    g("specialAbilities", "items"),
    s("cyphers"),
    g("background", "notes"),
  ]);
  ```
  Plus a case where the source comes from another pair: its partner expands in place.
  `applyDrop(D, "attacks", { kind:"pair", targetId:"notes", side:"right" })` → row 4 `s("specialAbilities")`, row 7 `g("background","attacks")`, then `s("notes")`.
- [ ] **Step 3: Implement**, then run. Expected: PASS.
- [ ] **Step 4: Commit** `feat(layout): pair with a paired section by pushing its section out`.

### Task 5: Swap sides with your own partner

**Files:** `src/utils/layoutOperations.ts`, the feature file, `tests/unit/layoutOperations.test.ts`, `tests/unit/sectionDrop.test.ts`.

- [ ] **Step 1: Scenario:**
  ```gherkin
  Scenario: Swap the two sections of a pair
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I drag the "Attacks" section onto the middle left of the "Special Abilities" section
    Then the grid should show "Attacks" on the left and "Special Abilities" on the right
  ```
  Run: FAIL.
- [ ] **Step 2: Failing unit tests:** `applyDrop(D, "attacks", { kind:"pair", targetId:"specialAbilities", side:"left" })` → row 4 `g("attacks","specialAbilities")`, all else unchanged. With `side:"right"` → `null`. `resolveDropIntent(D, "attacks", "specialAbilities", "right", true)` → `null`.
- [ ] **Step 3: Implement**, then run. Expected: PASS.
- [ ] **Step 4: Commit** `feat(layout): swap a pair's sides by dropping on the partner`.

### Task 6: Narrow screens — reorder only, seam breaks a stacked pair

**Files:** `src/utils/layoutOperations.ts`, `src/utils/sectionDrop.ts`, the feature file, `tests/unit/layoutOperations.test.ts`, `tests/unit/sectionDrop.test.ts`, `tests/unit/characterSheetDropZones.test.ts`.

**Interfaces:**

- Produces: `resolveDropIntent` with `wide = false`:
  - Middle zones → `null`.
  - Target is the upper half of a pair: `top` → gap before the pair row, `bottom` → `{ kind:"breakPair", rowIndex }`.
  - Target is the lower half: `top` → `breakPair`, `bottom` → gap after the pair row.
  - The `breakPair` branch of `applyDrop`: `[a|b]` becomes `a`, source, `b`. It returns `null` when the source is in that pair or the row is not a pair.

- [ ] **Step 1: Scenarios:**

  ```gherkin
  Scenario: On a narrow screen dropping on the middle of a section reorders
    Given the viewport is 768 pixels wide
    And layout edit mode is active
    When I drag the "Cyphers" section onto the middle left of the "Abilities" section
    Then "Cyphers" should be in its own row
    And the "Abilities" section should appear before the "Cyphers" section

  Scenario: On a narrow screen dropping between the halves of a pair breaks the pair
    Given the viewport is 768 pixels wide
    And layout edit mode is active
    When I drag the "Cyphers" section onto the top edge of the "Notes" section
    Then "Background" should be in its own row
    And "Cyphers" should be in its own row
    And "Notes" should be in its own row
    And the "Background" section should appear before the "Cyphers" section
    And the "Cyphers" section should appear before the "Notes" section
  ```

  Run: the second FAILS. The first may already pass (middle-left at 50 % height lands in the bottom half), which is fine.

- [ ] **Step 2: Failing unit tests:**
  - `applyDrop(D, "cyphers", { kind:"breakPair", rowIndex:7 })` ends `s("items"), s("background"), s("cyphers"), s("notes")`.
  - `applyDrop(D, "background", { kind:"breakPair", rowIndex:7 })` → `null`; `rowIndex:3` (a single row) → `null`.
  - `resolveDropIntent(D, "cyphers", "notes", "top", false)` → `breakPair 7`; `(…, "background", "bottom", false)` → `breakPair 7`; `(…, "background", "top", false)` → `gap 7`; `(…, "notes", "bottom", false)` → `gap 8`; `(…, "items", "left", false)` → `null`.
  - Controller test (Review Focus 4): hover the middle of `items` with `matchMedia` matching, which previews a pair; flip `matchMedia` to not matching and hover again, which gives a gap intent.
- [ ] **Step 3: Implement**, then run unit tests and the feature. Expected: PASS.
- [ ] **Step 4: Commit** `feat(layout): reorder only on narrow screens and break a stacked pair at its seam`.

### Task 7: Drop previews

**Files:**

- Create: `src/utils/dropPreview.ts`
- Modify: `SectionDragController.ts`, `CharacterSheet.ts` (`renderLayoutItem` gets the row index), `layout-editor.css`
- Modify: `tests/e2e/step-definitions/section-touch-drag.steps.ts:48`, `tests/unit/characterSheetTouchDrag.test.ts:98` (`drop-target` → `drop-line-before`)
- Test: `tests/unit/dropPreview.test.ts`, feature file

**Interfaces:**

- Produces:

  ```ts
  export interface DropPreview {
    line?:
      | { kind: "row"; rowIndex: number; edge: "before" | "after" }
      | { kind: "section"; sectionId: SectionId; edge: "before" };
    ghost?: { sectionId: SectionId; placement: "left" | "right" | "replace" };
    bump?: { rowIndex: number; edge: "above" | "below"; sectionId: SectionId };
  }
  export function describeDropPreview(
    layout: Layout,
    sourceId: SectionId,
    intent: DropIntent
  ): DropPreview;
  ```

  Rendered as literal classes on the row element (a single's section wrapper, or a pair's grid div): `drop-line-before`, `drop-line-after`, `drop-bump-above`, `drop-bump-below`, the last two with `data-drop-bump-label`. On the section wrapper: `drop-line-before` (seam), `drop-ghost-left`, `drop-ghost-right`, `drop-ghost-replace`, the ghosts with `data-drop-ghost-label`. Labels are `t(\`layout.sections.${id}\`)`: the dragged section for ghosts, the bumped section for bumps. CSS draws them as `::after`overlays using`content: attr(...)`. Line: primary colour. Ghost: accent, dashed. Bump: a distinct `@theme`colour (add`--color-numenera-drop-bump`if none fits). Delete the`drop-target`, `.layout-drop-zone*`and`.layout-merge-indicator*` rules; the last one hardcodes the English "Merge into grid" (Rule 4).

- [ ] **Step 1: Scenarios** (new step `I hold the {string} section over the {zone} of the {string} section` keeps the mouse button down; an `After` hook or a final `And I let go` step releases it):

  ```gherkin
  Scenario: Hovering the middle of a single section previews the pair
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I hold the "Cyphers" section over the middle right of the "Items" section
    Then the "Items" section should preview "Cyphers" on its right

  Scenario: Hovering the middle of a paired section previews the push
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I hold the "Cyphers" section over the middle left of the "Notes" section
    Then the "Notes" section should preview "Cyphers" in its place
    And the row of "Notes" should preview "Notes" below it

  Scenario: Hovering the middle of a section that cannot be paired previews nothing
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I hold the "Cyphers" section over the middle left of the "Stats" section
    Then no drop preview should be shown
  ```

  Expected label texts come from `en.json` via `englishText()` (`tests/e2e/support/i18nKeys.ts`). If native mid-drag hover proves unreliable on WebKit, tag the hover scenarios `@chromium-only` with the `#` reason comment (docs/rules/testing.md). Run: FAIL.

- [ ] **Step 2: Failing unit tests** (`dropPreview.test.ts`):
  - `{gap,3}` → `{ line:{kind:"row",rowIndex:3,edge:"before"} }`; `{gap,8}` → row 7 `"after"`.
  - Pair onto single `items` right → `{ ghost:{sectionId:"items",placement:"right"} }`.
  - Cyphers onto `notes` → `{ ghost:{sectionId:"notes",placement:"replace"}, bump:{rowIndex:7,edge:"below",sectionId:"notes"} }`; Items onto `attacks` → bump `{rowIndex:4,edge:"above",sectionId:"attacks"}`.
  - Swap → `{ ghost:{sectionId:"specialAbilities",placement:"replace"} }`, no bump.
  - `breakPair 7` → `{ line:{kind:"section",sectionId:"notes",edge:"before"} }`.
- [ ] **Step 3: Implement and render.** Then add the controller unit tests for Review Focus 1 and 5:
  - A `dragover` with no section under the pointer keeps the intent. Mouse: move the `dragover`/`drop` listeners to the `parchment-container` div and find the section with `closest("[data-section-id]")`, so gutters reach the controller too.
  - The target wrapper renders no extra child elements while previewing (pseudo-elements only).
- [ ] **Step 4: Run** unit tests and the feature. Expected: PASS.
- [ ] **Step 5: Commit** `feat(layout): preview where a dragged section will land`.

### Task 7b: Live layout preview after holding still (spec amendment 2026-11-01)

**Files:**

- Modify: `src/components/helpers/SectionDragController.ts`, `src/components/CharacterSheet.ts`, `layout-editor.css`
- Modify: the feature file, `section-drop-preview.steps.ts`
- Test: `tests/unit/characterSheetDropZones.test.ts`

**Interfaces:**

- Refactor first (Rule 6): `SectionDragHost.onDrop(sourceId, intent)` becomes
  `commitLayout(layout: Layout): void`. The controller computes the final
  layout itself, because a drop during a live preview with no new intent must
  commit the previewed layout.
- The controller keeps `liveLayout: Layout | null` (the previewed layout) and
  resolves intents and overlay previews against `liveLayout ?? host.getLayout()`.
  `CharacterSheet` renders `this.drag.liveLayout() ?? this.layout`.
- `LIVE_PREVIEW_DELAY_MS = 300`. An intent change clears the timer and, for a
  non-null intent, starts it. When it fires: `liveLayout = applyDrop(working,
source, intent)`, the intent becomes null, re-render.
- A drop is possible (mouse `dragover` calls `preventDefault`) when there is an
  intent or a live preview. Drop commits `applyDrop(working, source, intent)`
  if there is an intent, else `liveLayout`. Cancel paths clear `liveLayout`
  without committing.
- Charging cue: a 300 ms CSS animation on the overlay `::after` rules.

- [ ] **Step 1: Refactor** `onDrop` → `commitLayout`, tests green.
- [ ] **Step 2: Scenarios** (mouse; Playwright's `page.clock` controls the timer, so
      the overlay scenarios install a paused clock and stay deterministic):

  ```gherkin
  Scenario: Holding still over a section shows the resulting layout before the drop
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I hold the "Cyphers" section over the middle right of the "Items" section
    And I keep still for a moment
    Then the grid should show "Items" on the left and "Cyphers" on the right
    And the layout should still be the default layout

  Scenario: Releasing outside the sheet after a live preview restores the layout
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I hold the "Cyphers" section over the middle right of the "Items" section
    And I keep still for a moment
    And I release the section outside the sheet
    Then the "Cyphers" section should appear before the "Items" section
    And the layout should still be the default layout
  ```

- [ ] **Step 3: Failing unit tests**, one at a time (fake timers):
  - 299 ms still: order unchanged; 300 ms: the sheet shows `g("items","cyphers")`; storage untouched.
  - An intent change at 200 ms restarts the wait.
  - After the live preview, a drop over the dragged section's new place commits the preview.
  - After the live preview, the next hover resolves against it (e.g. dragging on to the top edge of Abilities moves Cyphers out of the new pair).
  - Touch cancel and `dragend` without a drop restore the pre-drag layout and save nothing.
  - A drop before 300 ms still applies the intent (existing tests).
- [ ] **Step 4: Implement**, add the charging cue CSS, run unit tests and the feature. Expected: PASS.
- [ ] **Step 5: Commit** `feat(layout): show the resulting layout after holding a dragged section still`.

### Task 8: Touch pairing on wide screens

**Files:** the feature file, `section-touch-drag.steps.ts`, `tests/unit/characterSheetDropZones.test.ts`.

- [ ] **Step 1: Scenario:**
  ```gherkin
  # The gesture helper uses CDP touch input, which Playwright offers only on Chromium.
  @chromium-only
  Scenario: Pair two sections by long-press dragging on a wide touch screen
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I long-press the "Cyphers" section and drag it onto the middle right of the "Items" section
    Then the grid should show "Items" on the left and "Cyphers" on the right
  ```
  Implement the step with `TouchGesture` + `zonePoint` inside `withFullHeightViewport`. Run: PASS is likely already. If it fails, fix the touch path, not the test.
- [ ] **Step 2: Unit test** (Review Focus 1, touch): hover the middle of `items`, then a hover where `elementFromPoint` returns `null`, then drop. The layout gets `g("items","cyphers")`.
- [ ] **Step 3: Run** `npm run test:unit` and the feature. Expected: PASS.
- [ ] **Step 4: Commit** `test(layout): cover pairing by touch on wide screens`.

### Task 9: Cleanup, all profiles, docs

**Files:** `src/components/CharacterSheet.ts`, `src/utils/layoutOperations.ts`, their tests, `docs/FEATURES.md`, `docs/CURRENT_FEATURE.md` (delete), `docs/TODO.md`, `docs/EVENT_CATALOG.md` (if it lists section drag events), `tests/e2e/STEP_CATALOG.md` (`npm run docs:steps`).

- [ ] **Step 1: Delete code with no callers.** That includes `CharacterSheet.mergeSections`/`splitGrid`, plus `mergeSectionsInLayout`/`splitGridInLayout` and their tests unless `applyDrop` reuses them. Keep `updateLayout`/`getLayout`: the import-layout prompt item needs them.
- [ ] **Step 2: Run all four profiles** on the feature file: `DEVICE=pixel5`, `DEVICE=iphone12` and `DEVICE=ipadpro` with `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature`, plus the default desktop run. Then `npm run test:e2e:all`, `npm run test:unit`, `npm run lint`, `npm run typecheck:tests` and `npm run check:i18n`. Expected: all green.
- [ ] **Step 3: Update the docs.**
  - Move the feature to `FEATURES.md`, linking the spec, and delete `CURRENT_FEATURE.md`.
  - In `TODO.md`, correct the "English text nobody renders" bullet: `SECTION_DISPLAY_NAMES` is also the Gherkin-name lookup in `tests/e2e/support/sections.ts`.
- [ ] **Step 4: Commit** `docs: record section pairing by drag as done` (or split into `refactor:` + `docs:` if Step 1 removed code).
- [ ] **Step 5:** Present the branch for review, then use superpowers:finishing-a-development-branch.
