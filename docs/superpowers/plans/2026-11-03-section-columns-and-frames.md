# Section Columns and Frames Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Card sections lay out their cards by their own width (one column
when narrow, the stored choice when wide), with a one/two-column switch in
layout edit mode, and every section sits in the same brown frame.

**Architecture:** A pure module holds the per-section column choices (only
non-default values), stored next to the layout by `layoutStorage`. Every
card section's template is wrapped in a `.section-columns` element that is a
CSS size container; card lists use one class, `.section-card-grid`, that
becomes two columns only inside `.section-columns-2` _and_ when the
container is at least 40rem wide. The switch is a small helper-rendered
button inside the same wrapper, shown by the same container query, only in
layout edit mode. Frames are a markup/CSS change: every section root uses
`.section-box`.

**Tech Stack:** TypeScript strict, lit-html, Tailwind v4 + component CSS
(CSS container queries), i18next, Vitest + jsdom, Cucumber + Playwright.

**Spec:** `docs/superpowers/specs/2026-11-03-section-columns-and-frames-design.md`

## Global Constraints

- All 11 rules in `CLAUDE.md`: BDD first, TDD one test at a time, i18n in
  `en.json` and `de.json`, strict TS, no `any`, `@/` aliases, Rule 1 review
  before each commit unless waived, storage only through `layoutStorage`.
- Branch: `feat/section-columns` (already created, spec committed at fa982ad).
- Format only touched files with `npx prettier --write <files>`; run
  `npm run docs:steps` when steps change; never call `cucumber-js` directly;
  `--name` filters break on spaces (run whole feature files).
- ESLint `no-undef` rejects DOM type names used as types (`Keyframe`,
  `ParentNode`, `DOMRect`, `Animation`): use `Element`,
  `ReturnType<Element["getBoundingClientRect"]>` and the like.
- Port check before E2E:
  `Get-NetTCPConnection -State Listen | ? { $_.LocalPort -ge 3000 -and $_.LocalPort -le 3009 }`;
  ask the maintainer before killing anything.
- jsdom applies no stylesheets and has no container queries: unit tests
  assert classes, attributes and data; computed columns are E2E only.

## Decisions taken in this plan (author's calls, within the spec)

1. **Card sections** = `abilities`, `specialAbilities`, `attacks`, `cyphers`,
   `items` (the same five as `COLLECTION_SECTION_IDS` in `SheetSections.ts`).
2. **Defaults:** `abilities`, `cyphers`, `items` → 2; `specialAbilities`,
   `attacks` → 1.
3. **"Wide enough" = container width ≥ 40rem (640 px).** Measured widths of
   a section wrapper: side-by-side half at 1280 px ≈ 540 px (one column);
   single row at 1280 px ≈ 1104 px; iPad Pro 11 portrait (834 px) ≈ 754 px
   (two allowed); Pixel 5 / iPhone 12 ≈ 310 px (one column).
4. **Storage:** separate localStorage key `numenera-section-columns`
   (constant `SECTION_COLUMNS_STORAGE_KEY` in `storageConstants.ts`), read and
   written only by new functions in `layoutStorage.ts`. The `Layout` array and
   its validation stay unchanged, so old layouts and old exports stay valid.
   An invalid stored value is ignored (defaults), never an error.
5. **Export/import:** the export file gains an optional `sectionColumns`
   field (`CharacterFileData`). Import validates it and returns it in
   `ImportResult.sectionColumns`, exactly as it does `layout` today. (Today
   the app does not apply an imported `layout` either; applying both is out
   of scope.)
6. **Reset Layout** also clears the column choices.
7. **Items' Artifacts | Oddities split** (`.two-column-grid`) follows the same
   rule as the card lists: it is a second "column" of the same section.
8. **Switch position:** the button straddles the top edge of the frame at
   its right corner (`top: -1.375rem; right: 1rem`, 44 × 44 px), so it never
   covers content such as Attacks' armor badge, which sits in its heading
   row at the right.
9. **Badges top-left:** Cypher's max-cyphers badge and Items' shins badge
   drop `badge-top-right` and become the first item of their section's
   heading row (a flex row: badge, heading, add button), so they sit at the
   top-left and push the heading right instead of covering it.
10. **Frames:** every section's root element carries `.section-box` (Basic
    Info keeps `.basic-info-card`, which has identical frame styles). The old
    `mt-8` (Abilities, Special Abilities, Attacks) and `mb-6`
    (Recovery/Damage) spacing go; `.section-box`'s `margin-bottom: 2rem`
    spaces every row the same. Headings stay as they are (spec).
11. **Comparison view** (`diffCollectionSections.ts`): its card lists use
    `.section-card-grid` inside a `.section-columns section-columns-2`
    wrapper, so they are two columns only where the pane is wide; no switch.

## Review Focus

1. **A stored choice for a section that is narrow right now** (paired side
   by side, phone): it must show one column and no switch, and must keep the
   choice for when it is wide again. Pinned by Task 2's paired scenario and
   Task 3's "no switch on a paired section" scenario.
2. **Corrupt or foreign data in `numenera-section-columns`** (not JSON, wrong
   ids, values other than 1/2): defaults, no crash, no lost layout. Pinned by
   Task 1's `loadSectionColumns` tests.
3. **Live preview / slide with a column change:** a section that becomes
   narrow in a live preview changes columns and height mid-drag. FLIP
   matches by id and measures after render, so it must still slide. Pinned by
   re-running `section-rearrangement.feature` in Task 2 and Task 5.
4. **The switch inside a draggable section:** a click must toggle without
   starting a section drag or reaching the section's own handlers, on mouse
   and touch. Pinned by Task 3's scenario that clicks it on every profile and
   by a unit test that the click does not mark the section `.dragging`.
5. **Tests and code that find text fields by `.parchment-field`**
   (`BottomTextFields.ts` dispatch target, `i18n.steps.ts`,
   `visualStyling.test.ts`): must move to the new markup, not break. Pinned
   by Task 4's full unit and E2E runs.

---

### Task 1: Column choices — model and storage

**Files:**

- Create: `src/types/sectionColumns.ts`
- Modify: `src/storage/storageConstants.ts`, `src/storage/layoutStorage.ts`,
  `src/storage/fileStorage.ts` (`CharacterFileData`, `ImportResult`, import
  parsing), `src/storage/exportManager.ts` (`createFileData`)
- Test: `tests/unit/sectionColumns.test.ts`, `tests/unit/layoutStorage.test.ts`,
  the existing export/import unit tests (find them with
  `grep -rln "createFileData\|hasLayoutDifference" tests/unit`)

**Interfaces:**

- Produces (`src/types/sectionColumns.ts`):
  - `export const CARD_SECTION_IDS = ["abilities", "specialAbilities", "attacks", "cyphers", "items"] as const;`
  - `export type CardSectionId = (typeof CARD_SECTION_IDS)[number];`
  - `export type ColumnCount = 1 | 2;`
  - `export type SectionColumns = Partial<Record<CardSectionId, ColumnCount>>;`
  - `export const DEFAULT_SECTION_COLUMNS: Readonly<Record<CardSectionId, ColumnCount>>`
    (decision 2)
  - `export function isCardSection(id: SectionId): id is CardSectionId`
  - `export function columnsFor(columns: SectionColumns, id: CardSectionId): ColumnCount`
    — stored value, else default
  - `export function withColumns(columns: SectionColumns, id: CardSectionId, count: ColumnCount): SectionColumns`
    — new object; an entry equal to the default is removed, not stored
  - `export function isValidSectionColumns(value: unknown): value is SectionColumns`
    — a plain object whose keys are card section ids and values 1 or 2
- Produces (`layoutStorage.ts`): `loadSectionColumns(): SectionColumns`
  (missing/invalid/unparseable → `{}`), `saveSectionColumns(columns: SectionColumns): void`;
  `resetLayout()` also removes `SECTION_COLUMNS_STORAGE_KEY`.
- Produces (`fileStorage.ts`): `CharacterFileData.sectionColumns?: SectionColumns`,
  `ImportResult.sectionColumns?: SectionColumns` (set only when present and
  valid; invalid → the existing `fileOperations.invalidLayout` warning).

- [ ] **Step 1: Tests in `tests/unit/sectionColumns.test.ts`, one at a time, Red then Green:**
  - `"a section without a stored choice uses today's columns"`:
    `columnsFor({}, "abilities") === 2`, `columnsFor({}, "attacks") === 1`
  - `"a stored choice wins over the default"`: `columnsFor({ abilities: 1 }, "abilities") === 1`
  - `"storing the default removes the entry"`:
    `withColumns({ attacks: 2 }, "attacks", 1)` equals `{}`
  - `"storing a non-default keeps the others"`:
    `withColumns({ attacks: 2 }, "cyphers", 1)` equals `{ attacks: 2, cyphers: 1 }`
  - `"only card sections with 1 or 2 are valid"`: true for `{}` and
    `{ items: 1 }`; false for `null`, `[]`, `{ stats: 2 }`, `{ items: 3 }`,
    `{ items: "2" }`
  - `"card sections are the five collection sections"`:
    `isCardSection("cyphers")` true, `isCardSection("notes")` false
- [ ] **Step 2: Storage tests in `tests/unit/layoutStorage.test.ts`, one at a time:**
  - `"column choices round-trip through storage"`
  - `"missing, unparseable or invalid column choices load as none"`
    (Review Focus 2: unset key, `"{"`, `'{"stats":2}'`)
  - `"resetting the layout clears the column choices"`
- [ ] **Step 3: Export/import tests, one at a time:** an export contains
      `sectionColumns` equal to the stored choices; an import with a valid
      `sectionColumns` returns it; an import with an invalid one warns and
      returns none; an import without one (an old file) returns none and no
      warning.
- [ ] **Step 4: `npm run test:unit`, `npm run typecheck:tests`, lint;
      format touched files; commit after Rule 1 review:**
      `feat(layout): store a column choice per card section`

---

### Task 2: Card columns follow the section's width

**Files:**

- Create: `src/styles/components/section-columns.css` (import it in
  `src/styles/main.css` after `section-box.css`),
  `tests/e2e/features/section-columns.feature`,
  `tests/e2e/step-definitions/section-columns.steps.ts`
- Modify: `src/components/CharacterSheet.ts` (`renderDraggableSection`,
  constructor loads `loadSectionColumns()` into a `private sectionColumns`
  field; `resetLayoutToDefault` resets it to `{}`),
  `src/components/Abilities.ts`, `SpecialAbilities.ts`, `Attacks.ts`,
  `CyphersBox.ts`, `ItemsBox.ts` (list classes; Items' `.two-column-grid`),
  `src/components/diffCollectionSections.ts` (decision 11),
  `src/styles/components/section-box.css` (drop `.two-column-grid` if unused)
- Test: `tests/unit/characterSheetSectionColumns.test.ts`

**Interfaces:**

- Consumes: Task 1's `isCardSection`, `columnsFor`, `loadSectionColumns`.
- Produces:
  - Wrapper markup, for card sections only, around the section template in
    `CharacterSheet.renderDraggableSection`:
    `<div class="section-columns [section-columns-2]" data-columns="1|2" data-testid="section-columns-<id>">…</div>`
    (`section-columns-2` present exactly when `columnsFor` gives 2). Task 3
    adds the switch inside this wrapper.
  - CSS contract (`section-columns.css`):
    `.section-columns { container-type: inline-size; position: relative; }`;
    `.section-card-grid` is a one-column grid (`gap: 1rem`); inside
    `@container (min-width: 40rem)`, `.section-columns-2 .section-card-grid`
    has two equal columns.
  - Every card list (`abilities-list`, `special-abilities-list`,
    `attacks-list`, `cyphers-list`, `equipment-list`, and Items'
    Artifacts | Oddities split) uses `section-card-grid` instead of its
    Tailwind grid classes.

- [ ] **Step 1: Feature scenarios (BDD first)** in `section-columns.feature`:

```gherkin
Feature: Card columns follow the section's width

  Background:
    Given I am on the character sheet page

  Scenario Outline: A section on its own row shows today's columns on a wide screen
    Given the viewport is 1280 pixels wide
    Then the "<section>" section should show its cards in <columns> column(s)

    Examples:
      | section   | columns |
      | Abilities | 2       |
      | Cyphers   | 2       |
      | Items     | 2       |

  Scenario: A section paired side by side shows one column
    Given the viewport is 1280 pixels wide
    And "Cyphers" and "Items" are in a grid
    Then the "Cyphers" section should show its cards in 1 column(s)

  Scenario: A stacked pair follows its sections' columns
    Given the viewport is 834 pixels wide
    And "Cyphers" and "Items" are in a grid
    Then the "Cyphers" section should show its cards in 2 column(s)

  Scenario: On a phone every section shows one column
    Given the viewport is 390 pixels wide
    Then the "Abilities" section should show its cards in 1 column(s)
    And the "Cyphers" section should show its cards in 1 column(s)
```

Check `tests/e2e/STEP_CATALOG.md` for the exact existing texts of "the
viewport is … pixels wide" and "… and … are in a grid" and adapt the
Gherkin to them. New step
`Then the {string} section should show its cards in {int} column(s)`:
count the tracks of `getComputedStyle(<first .section-card-grid in the
  section>).gridTemplateColumns` (split on whitespace). The test character
must have cards in each list; if one is empty, the grid may not render —
then give the step a precondition step or use a section with cards.

- [ ] **Step 2: Run the feature, expect the two-column and phone/pair
      scenarios to FAIL or PASS per today's `md:` rule** (the paired 1280 px
      scenario must FAIL: today Cyphers shows two columns there). Record which.
- [ ] **Step 3: Unit tests, one at a time, Red then Green**
      (`characterSheetSectionColumns.test.ts`, mounting `CharacterSheet` like
      `characterSheetDropZones.test.ts` does):
  - `"a card section is wrapped in a column container with its column count"`:
    `[data-testid="section-columns-cyphers"]` has `data-columns="2"` and
    class `section-columns-2`; `…-attacks` has `data-columns="1"` and not
    the class
  - `"a stored choice sets the column count"`: `localStorage`
    `numenera-section-columns` = `{"cyphers":1}` before mounting →
    `data-columns="1"`
  - `"non-card sections get no column container"`: no
    `[data-testid="section-columns-stats"]`
  - `"card lists use the section card grid"`: each of the five list test
    ids has class `section-card-grid` and no `md:grid-cols-2`
- [ ] **Step 4: Implement** per Interfaces (CSS file, wrapper, list classes,
      diff view).
- [ ] **Step 5: Run unit tests, `section-columns.feature` and
      `section-rearrangement.feature` (Review Focus 3), expect PASS.**
- [ ] **Step 6: docs:steps, lint, typecheck:tests, format, commit after Rule 1
      review:** `feat(layout): lay out cards by the section's own width`

---

### Task 3: The column switch in layout edit mode

**Files:**

- Create: `src/components/helpers/sectionColumnsButton.ts`
- Modify: `src/components/CharacterSheet.ts` (render the button in the
  wrapper in edit mode; `private toggleSectionColumns(id: CardSectionId): void`),
  `src/styles/components/section-columns.css`,
  `src/i18n/locales/en.json`, `src/i18n/locales/de.json`,
  `tests/e2e/features/section-columns.feature`,
  `tests/e2e/step-definitions/section-columns.steps.ts`
- Test: `tests/unit/characterSheetSectionColumns.test.ts`

**Interfaces:**

- Consumes: Task 1's `withColumns`, `saveSectionColumns`; Task 2's wrapper.
- Produces:
  - `export function renderSectionColumnsButton(columns: ColumnCount, onToggle: () => void): TemplateResult`
    — `<button type="button" class="section-columns-button" data-testid="section-columns-button" aria-pressed="true|false" aria-label=… title=…>`
    with an icon of one or two bars (decorative, `aria-hidden`). `aria-pressed`
    is `"true"` when two columns are shown. Label/title:
    `t("layout.columns.showTwo")` when one column is set,
    `t("layout.columns.showOne")` when two are.
  - i18n keys `layout.columns.showTwo` = "Show cards in two columns" /
    "Karten zweispaltig anzeigen"; `layout.columns.showOne` = "Show cards in
    one column" / "Karten einspaltig anzeigen".
  - The click handler stops propagation and calls `onToggle`;
    `toggleSectionColumns` stores `withColumns(…, next)`, saves, re-renders.
  - CSS: `.section-columns-button` is `display: none` by default and
    `display: inline-flex` inside `@container (min-width: 40rem)`;
    absolutely positioned per decision 8; at least 44 × 44 px; above the
    section content (`z-index` above `.badge-*`'s 10 is not needed once
    badges move, but must be above the card grid).

- [ ] **Step 1: Feature scenarios (BDD first):**

```gherkin
  Scenario: Switching a section to one column in layout edit mode
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I switch the "Cyphers" section to 1 column(s)
    Then the "Cyphers" section should show its cards in 1 column(s)
    When I exit layout edit mode
    And I reload the page
    Then the "Cyphers" section should show its cards in 1 column(s)

  Scenario: The switch is only offered where it can do something
    Given the viewport is 1280 pixels wide
    And "Cyphers" and "Items" are in a grid
    And layout edit mode is active
    Then the "Cyphers" section should offer no column switch
    And the "Stats" section should offer no column switch
    And the "Abilities" section should offer a column switch

  Scenario: No column switch outside layout edit mode
    Given the viewport is 1280 pixels wide
    Then the "Abilities" section should offer no column switch
```

New steps: `When I switch the {string} section to {int} column(s)` (click
its `section-columns-button` if `aria-pressed` does not already match),
`Then the {string} section should offer a column switch` /
`… no column switch` (the button is visible / not visible — hidden by the
container query counts as not visible). Check the catalog for the exact
texts of the exit-edit-mode and reload steps.

- [ ] **Step 2: Run the feature, expect the new scenarios to FAIL.**
- [ ] **Step 3: Unit tests, one at a time, Red then Green:**
  - `"layout edit mode shows a column switch on card sections only"`
  - `"no column switch outside layout edit mode"`
  - `"the switch says what pressing it will do"`: on Cyphers (2):
    `aria-pressed="true"`, `aria-label` = `t("layout.columns.showOne")`
  - `"pressing the switch toggles and stores the choice"`: Cyphers →
    `data-columns="1"`, storage `{"cyphers":1}`; press again → `"2"`,
    storage `{}`
  - `"pressing the switch does not start a section drag"` (Review Focus 4):
    after the click no section has class `dragging`
  - `"Reset Layout restores the default columns"`: after a toggle,
    `sheet.resetLayoutToDefault()` → `data-columns="2"` on Cyphers
- [ ] **Step 4: Implement** per Interfaces; run `npm run check:i18n`.
- [ ] **Step 5: Run unit tests and the feature, expect PASS.**
- [ ] **Step 6: docs:steps, lint, typecheck:tests, check:i18n, format, commit
      after Rule 1 review:** `feat(layout): switch a card section between one and two columns`

---

### Task 4: One frame for every section, badges top-left

**Files:**

- Modify: `src/components/Abilities.ts`, `SpecialAbilities.ts`, `Attacks.ts`,
  `RecoveryDamageSection.ts`, `BottomTextFields.ts` (root classes; the
  dispatch target's `closest(".parchment-field")` → `closest(".section-box")`),
  `CyphersBox.ts`, `ItemsBox.ts` (badge in the heading row),
  `src/styles/components/section-box.css` (heading-row class),
  `src/styles/components/stat-badge.css` (drop `.badge-top-right` if unused),
  `tests/unit/visualStyling.test.ts`, `tests/e2e/step-definitions/i18n.steps.ts`
  (locate Background/Notes labels by `data-testid`/structure, not
  `.parchment-field`), `tests/e2e/features/section-columns.feature` (or a
  new `section-frames.feature`) and its steps
- Test: `tests/unit/sectionFrames.test.ts`

**Interfaces:**

- Consumes: nothing from earlier tasks (independent markup), but must keep
  Task 2's list classes and Task 3's wrapper intact.
- Produces: every section's root element — the element with the section's
  own `data-testid` (`abilities-section`, `cyphers-section`, …; for
  collection sections it sits inside the `data-section-host` element, which
  sits inside Task 2's `.section-columns`) — has class `section-box`, except
  Basic Info's `.basic-info-card`. Background/Notes
  roots carry `data-testid="background-section"` / `"notes-section"`.

- [ ] **Step 1: Scenario (BDD first):**

```gherkin
  Scenario: Cypher and Items show their badge at the top left
    Given the viewport is 1280 pixels wide
    Then the max cyphers badge should be left of the "Cyphers" heading
    And the shins badge should be left of the "Items" heading
```

Step(s) compare bounding boxes: badge `x + width` ≤ heading `x`, and the
badge's top within the heading row (badge `y` < heading `y + height`).

- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Unit tests, one at a time, Red then Green**
      (`sectionFrames.test.ts`, mounting `CharacterSheet`):
  - `"every section sits in the same frame"`: for each of the ten section
    ids, the wrapper contains a root with `section-box` (or
    `basic-info-card` for `basicInfo`)
  - `"no section keeps the amber text-field frame"`: no `.parchment-field`
    inside the sheet
  - `"Recovery and Damage keep their own boxes inside the frame"`:
    `.recovery-rolls-section` and `.damage-track-section` are inside
    `[data-testid="recovery-damage-section"].section-box`
  - Update `visualStyling.test.ts`'s parchment-field assertion to the new
    frame (it describes the old look; Rule 3's "the code is wrong, not the
    test" does not apply to a test of a style the spec replaces).
- [ ] **Step 4: Implement** (decisions 9 and 10).
- [ ] **Step 5: Run all unit tests and the whole E2E suite on desktop
      (`npm run test:e2e:all`), expect PASS** — `.parchment-field` and badge
      selectors are used across features (Review Focus 5).
- [ ] **Step 6: Lint, typecheck:tests, docs:steps, format, commit after
      Rule 1 review:** `feat(layout): frame every section alike and move badges to the top left`

---

### Task 5: Every device profile, and the docs

**Files:**

- Modify: `docs/FEATURES.md`, `docs/TODO.md` (if it lists anything this
  delivers), `docs/ARCHITECTURE.md` only if it describes section styling or
  layout storage keys

- [ ] **Step 1:** Run `section-columns.feature` and
      `section-rearrangement.feature` with `DEVICE` unset, `pixel5`, `iphone12`,
      `ipadpro`, one at a time. Expected: all pass. A failure beyond a flaky
      helper: stop and report to the maintainer.
- [ ] **Step 2:** `npm run test:unit`, `npm run lint`,
      `npm run typecheck:tests`, `npm run check:i18n`, `npm run test:e2e:prod`.
- [ ] **Step 3:** Add a FEATURES.md entry (columns by width, the switch, one
      frame, badges top-left); link the spec.
- [ ] **Step 4: Commit after Rule 1 review:** `docs: record section columns and frames`
