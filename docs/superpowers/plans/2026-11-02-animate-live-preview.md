# Animate the Live Layout Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a section drag's live preview appears, and when a cancel restores
the saved layout, the sections slide from their old to their new places (FLIP)
instead of snapping. No slide under `prefers-reduced-motion`.

**Architecture:** A pure function turns a section's old and new box into slide
keyframes. A small DOM helper measures every `[data-section-id]` box before a
re-render and, after it, starts one Web Animations API `element.animate()` per
moved section, resolving when all have finished. The drag controller asks its
host for this animated re-render when the live preview appears and when a
cancel throws it away, and ignores hovers until the slide has finished.

**Tech Stack:** TypeScript strict, lit-html, Web Animations API, Vitest + jsdom,
Cucumber + Playwright.

**Spec:** `docs/superpowers/specs/2026-10-31-section-pair-drag-design.md`,
section "Live preview after holding still (amended 2026-11-01)". Its line "The
layout changes in one step (no animation)" is what this plan replaces (Task 4
amends it). The maintainer skipped the design questions, so the decisions below
are the plan author's calls; they don't change anything the spec decided
(the 300 ms wait, the 8 px settle rule, what is saved).

## Design decisions (author's calls)

1. **What slides:** every section whose box moved, the dragged section
   included, matched by `data-section-id` (never element identity: a row that
   changes between single and pair re-creates its elements).
2. **When:** when the live preview appears, and when a drag that showed a live
   preview ends without committing (release outside the sheet, Esc, touch
   cancel, a lost dragend). **Not** on a drop (a drop during a live preview
   changes nothing visible; a drop before 300 ms keeps snapping, as today), and
   **not** when leaving layout edit mode (the whole sheet changes there).
3. **How:** translate only, no scale. A section that changes width (single ↔
   half of a pair) takes its new width at once and slides from its old
   top-left corner. Scaling would stretch its text for the duration.
4. **Timing:** `SECTION_SLIDE_MS = 200`, easing `"ease-in-out"`. This matches
   the `transition: all 0.2s ease-in-out` already on `.layout-section`.
5. **Why Web Animations and not a CSS transition:** `element.animate()` never
   writes an inline style, so the `transition: all` on `.layout-section` sees
   no change in `transform` and starts no transition of its own. Setting
   `style.transform` and clearing it (classic FLIP) would trigger that
   transition and fight the inversion.
6. **Hovers while sliding are ignored.** `dropZoneAt` reads
   `getBoundingClientRect()`, which includes the in-flight transform, so zones
   would move with the slide. The controller ignores hovers from the moment the
   slide starts until it has finished (the `finished` promises, in real time,
   not a timer: E2E pauses the page clock). Afterwards the 8 px settle rule
   applies as before, against the anchor recorded when the preview appeared.
   Under reduced motion nothing slides, so nothing is ignored.
7. **A slide that starts during a slide:** a cancel during the 200 ms first
   cancels any running section slide, so the new "Last" boxes are measured
   without transforms. "First" boxes are measured before that, so a section
   continues from where it is on screen.
8. **Reduced motion:** `matchMedia("(prefers-reduced-motion: reduce)")` read at
   each slide. Under it, or where `element.animate` does not exist (jsdom), the
   helper starts nothing and resolves at once.
9. **Animation id:** `"section-slide"` (`SECTION_SLIDE_ID`), so tests and the
   cancel step can find these animations.

## Global Constraints

- All 11 rules in `CLAUDE.md` apply: BDD first, TDD one test at a time, Rule 1
  review before each commit unless the maintainer waives it.
- Work on branch `feat/animate-live-preview` off `main` (2d61e16).
- No new user-facing text (no i18n keys). No new dependencies.
- `@/` path aliases for src imports. Explicit return types on exports. No `any`.
- Format only touched files: `npx prettier --write <files>` (never
  `npm run format`, CRLF churn).
- Run `npm run docs:steps` whenever step definitions change (pre-commit runs
  `check:steps`).
- Never call `cucumber-js` directly. `--name` filters break on spaces: run the
  whole feature file.
- Before E2E runs, check for stale servers with
  `Get-NetTCPConnection -State Listen | ? { $_.LocalPort -ge 3000 -and $_.LocalPort -le 3009 }`;
  ask the maintainer before killing anything.
- After writing regexes through a script or heredoc, grep for a 0x08 byte
  where `\b` was meant.

## Review Focus

1. **Under a paused Playwright clock the slide still finishes.** The drop
   preview steps call `page.clock.install()`/`pauseAt()`. Playwright's clock
   fakes timers and `requestAnimationFrame`, but Web Animations run on the
   document timeline. If `finished` never resolved, hovers would stay ignored
   for the rest of the drag. Pinned by Task 3's E2E scenario (drop elsewhere
   after the slide) and Task 2's "should slide into its new place" step, which
   waits for `finished`.
2. **Animating the dragged section under a native mouse drag.** The browser
   drags a snapshot taken at dragstart; transforming the faded source must not
   end the gesture. Pinned by Task 3's E2E scenario, which keeps dragging and
   drops after the slide.
3. **A cancel while the preview is still sliding.** Old "Last" boxes would
   include the transform and the slide back would start from the wrong place.
   Pinned by Task 2's unit test "a cancel during the slide cancels it before
   measuring".
4. **Reduced motion must also lift the hover gate** (nothing slides, so
   nothing may wait for a slide). Pinned by Task 3's unit test.
5. **A stale slide's `finished` must not lift a newer slide's gate, or a gate
   after the drag ended.** Pinned by Task 3's unit test "a slide from an ended
   drag does not lift the gate of the next one".

---

### Task 1: Slide keyframes from two boxes

**Files:**

- Create: `src/utils/sectionSlide.ts`
- Test: `tests/unit/sectionSlide.test.ts`

**Interfaces:**

- Produces:
  - `export interface BoxCorner { left: number; top: number }`
  - `export function slideKeyframes(first: BoxCorner, last: BoxCorner): Keyframe[] | null`
    — `[{ transform: "translate(<dx>px, <dy>px)" }, { transform: "none" }]`
    with `dx = first.left - last.left`, `dy = first.top - last.top`; `null` when
    both `|dx|` and `|dy|` are below 0.5 (sub-pixel layout noise).

- [ ] **Step 0: Branch**

Run: `git switch -c feat/animate-live-preview`

- [ ] **Step 1: Write the failing test**

```ts
it("starts a moved section at its old place and ends it at its new one", () => {
  expect(slideKeyframes({ left: 0, top: 100 }, { left: 400, top: 300 })).toEqual([
    { transform: "translate(-400px, -200px)" },
    { transform: "none" },
  ]);
});
```

- [ ] **Step 2: Run it, expect FAIL** (`slideKeyframes` not defined):
      `npm run test:unit -- tests/unit/sectionSlide.test.ts`
- [ ] **Step 3: Implement `slideKeyframes`** in `src/utils/sectionSlide.ts`.
- [ ] **Step 4: Run it, expect PASS.**
- [ ] **Step 5: Next test, one at a time, each Red then Green:**
  - `"returns null for a section that did not move"`:
    `slideKeyframes({ left: 10, top: 20 }, { left: 10, top: 20 })` → `null`
  - `"ignores sub-pixel layout noise"`:
    `slideKeyframes({ left: 10.2, top: 20 }, { left: 10, top: 20.4 })` → `null`
  - `"slides a section that only moved sideways"`:
    `slideKeyframes({ left: 0, top: 50 }, { left: 400, top: 50 })` →
    first keyframe `{ transform: "translate(-400px, 0px)" }`
- [ ] **Step 6: Lint, format touched files, commit** (after Rule 1 review)

```bash
git add src/utils/sectionSlide.ts tests/unit/sectionSlide.test.ts
git commit -m "feat(layout): compute the slide of a section between two boxes"
```

---

### Task 2: Slide the sections when the live preview appears or is cancelled

**Files:**

- Modify: `tests/e2e/features/section-rearrangement.feature` (after the scenario
  "Releasing outside the sheet after a live preview restores the layout")
- Create: `tests/e2e/step-definitions/section-slide.steps.ts`
- Modify: `tests/e2e/support/windowGlobals.d.ts` (declare `__sectionSlides`)
- Create: `src/components/helpers/sectionSlide.ts`
- Modify: `src/components/helpers/SectionDragController.ts`
  (`SectionDragHost`, `showLivePreview`, `clearDragState`)
- Modify: `src/components/CharacterSheet.ts` (implement the new host method)
- Create: `tests/unit/characterSheetSectionSlide.test.ts`
- Docs: `docs/step-catalog` output via `npm run docs:steps`

**Interfaces:**

- Consumes: `slideKeyframes`, `BoxCorner` (Task 1)
- Produces:
  - `src/components/helpers/sectionSlide.ts`:
    - `export const SECTION_SLIDE_MS = 200;`
    - `export const SECTION_SLIDE_ID = "section-slide";`
    - `export function measureSections(root: ParentNode): Map<string, BoxCorner>`
      — `getBoundingClientRect()` left/top of every `[data-section-id]`, keyed by id.
    - `export function slideSections(root: ParentNode, first: Map<string, BoxCorner>): Promise<void>`
      — reduced motion or no `Element.prototype.animate`: resolve at once.
      Otherwise cancel every running animation with id `SECTION_SLIDE_ID` under
      `root` (via each section element's `getAnimations()`, guarded), then for
      each section in `root` with an entry in `first` and non-null
      `slideKeyframes(first, now)`: `el.animate(keyframes, { duration:
SECTION_SLIDE_MS, easing: "ease-in-out", id: SECTION_SLIDE_ID })`.
      Resolve when every started animation's `finished` settles (a cancelled
      animation rejects `finished` with an AbortError: treat it as settled).
  - `SectionDragHost` gains
    `renderWithSlide(): Promise<void>` — "Re-render the sheet; sections that
    moved slide from their old places. Resolves when the slide has finished
    (at once when nothing slides)."
  - `CharacterSheet` implements it: container as in `rerender()`;
    `first = measureSections(container)`, `this.rerender()`,
    `return slideSections(container, first)`; no container → `Promise.resolve()`.

- [ ] **Step 1: Write the feature scenarios (BDD first)**

```gherkin
  # Sliding into the live preview
  Scenario: Sections slide into the layout shown after holding still
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    And section slides are recorded
    When I hold the "Cyphers" section over the middle right of the "Items" section
    And I keep still for a moment
    Then the "Items" section should slide into its new place
    And the "Cyphers" section should slide into its new place
    And the grid should show "Items" on the left and "Cyphers" on the right

  Scenario: Sections slide back when a live preview is cancelled
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    And section slides are recorded
    When I hold the "Cyphers" section over the middle right of the "Items" section
    And I keep still for a moment
    And I release the section outside the sheet
    Then the "Items" section should slide back to where it was
    And the "Cyphers" section should appear before the "Items" section

  Scenario: Nothing slides when reduced motion is preferred
    Given the viewport is 1280 pixels wide
    And I prefer reduced motion
    And layout edit mode is active
    And section slides are recorded
    When I hold the "Cyphers" section over the middle right of the "Items" section
    And I keep still for a moment
    Then the grid should show "Items" on the left and "Cyphers" on the right
    And no section should have slid
```

- [ ] **Step 2: Implement the steps** in `section-slide.steps.ts`:
  - `Given section slides are recorded` — `page.evaluate` wraps
    `Element.prototype.animate`: for calls whose options object has
    `id === "section-slide"`, push
    `{ sectionId: el.dataset.sectionId, from: keyframes[0].transform, finished: false }`
    onto `window.__sectionSlides` and set `finished = true` when the returned
    animation's `finished` resolves. Always return the real animation.
  - `Given I prefer reduced motion` — `page.emulateMedia({ reducedMotion: "reduce" })`.
  - `Then the {string} section should slide into its new place` — poll
    (`expect.poll`) until a record for the section has `finished: true` and a
    `from` other than `"none"`.
  - `Then the {string} section should slide back to where it was` — poll until
    the section has at least two finished records and the last record's
    translate offsets have the opposite sign of the first record's on each
    non-zero axis (parse `translate(<x>px, <y>px)`).
  - `Then no section should have slid` — `window.__sectionSlides` is empty.
- [ ] **Step 3: Run the feature, expect the three new scenarios to FAIL** on the
      slide steps (reduced-motion scenario passes already; that's fine, it pins the
      next change): `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature`
- [ ] **Step 4: Unit tests, one at a time, each Red then Green**, in
      `tests/unit/characterSheetSectionSlide.test.ts`. Copy the `touch`,
      `section`, `touchDragOver` and `mountSheet` helpers from
      `tests/unit/characterSheetDropZones.test.ts`. Set-up per test:
      `vi.useFakeTimers()`; `window.matchMedia` stubbed so
      `"(prefers-reduced-motion: reduce)"` does not match and every other query
      matches (the setup file's default matches everything, which would read as
      reduced motion); `HTMLElement.prototype.animate` stubbed (`vi.fn`) returning
      `{ finished: <a promise the test controls>, cancel: vi.fn() }`;
      `HTMLElement.prototype.getBoundingClientRect` stubbed to lay sections out by
      document order: row `n` at `top = n * 200`, height 200, a single row 800
      wide, a pair's left half at left 0 and right half at left 400, each 400 wide.
      (Find the row from the closest `[data-testid^="layout-grid-"]` or the section
      itself.) Pointer coordinates come from those boxes.
  - `"slides the moved sections when the live preview appears"`: drag Cyphers
    over Items' middle right, advance 300 ms; `animate` was called on
    `section("cyphers")` and `section("items")` with options containing
    `{ id: "section-slide", duration: 200, easing: "ease-in-out" }`, and on no
    section that did not move (`basicInfo`).
  - `"slides the sections back when a cancel restores the saved layout"`: as
    above, then `touchcancel`; `animate` was called again on `cyphers`, with a
    first keyframe whose translate is the opposite of the first slide's.
  - `"slides nothing when reduced motion is preferred"`: matchMedia stub
    matches `"(prefers-reduced-motion: reduce)"`; after the preview,
    `animate` was never called and the pair grid is shown.
  - `"a cancel during the slide cancels it before measuring"` (Review Focus 3):
    give `section(...).getAnimations` a stub returning the earlier animation
    object (with `id: "section-slide"`); `touchcancel` before resolving its
    `finished`; that animation's `cancel` was called.
  - `"leaving layout edit mode during a live preview does not slide"`: after
    the preview, `sheet.toggleLayoutEditMode()`; `animate` call count unchanged.

  Implement in the order the tests demand: `sectionSlide.ts`, then
  `renderWithSlide` on the host and in `CharacterSheet`, then the controller:
  `showLivePreview()` calls `this.host.renderWithSlide()` in place of
  `requestRender()`; `clearDragState()` calls `renderWithSlide()` when
  `previewedLayout` was non-null before the reset, else `requestRender()`.
  `cancelDrag()` stays as it is. (The promise is unused until Task 3: write
  `void this.host.renderWithSlide()`.)

- [ ] **Step 5: Run unit tests and the feature file, expect PASS:**
      `npm run test:unit` and
      `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature`
- [ ] **Step 6: `npm run docs:steps`, `npm run lint`, `npm run typecheck:tests`,
      format touched files, commit** (after Rule 1 review)

```bash
git add <touched files>
git commit -m "feat(layout): slide sections into a live preview and back on cancel"
```

---

### Task 3: Ignore hovers while the sections slide

**Files:**

- Modify: `tests/e2e/features/section-rearrangement.feature`
- Modify: `tests/e2e/step-definitions/section-slide.steps.ts`
- Modify: `src/components/helpers/SectionDragController.ts` (`hover`,
  `showLivePreview`, `resetDragState`)
- Modify: `tests/unit/characterSheetSectionSlide.test.ts`

**Interfaces:**

- Consumes: `SectionDragHost.renderWithSlide(): Promise<void>` (Task 2)
- Produces: no new exports. Controller field
  `private slide: Promise<void> | null` — the running slide into a live
  preview; `hover()` records `lastPointer`, then returns while it is non-null,
  before the settle check. When the promise settles it clears the field only if
  it is still the same promise. `resetDragState()` sets it to null.

- [ ] **Step 1: Write the feature scenario**

```gherkin
  Scenario: The drag carries on after the sections have slid
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    And section slides are recorded
    When I hold the "Cyphers" section over the middle right of the "Items" section
    And I keep still for a moment
    And the "Cyphers" section should slide into its new place
    And I drop the held section onto the top edge of the "Abilities" section
    Then "Cyphers" should be in its own row
    And the "Cyphers" section should appear before the "Abilities" section
```

New step `When I drop the held section onto the {zone} of the {string} section`
(in `section-slide.steps.ts`): box of the target, `zonePoint`, then the two
separate `mouse.move` calls the hold step uses (most of the way with
`steps: 5`, then onto the point), then `mouse.up()`.

- [ ] **Step 2: Run the feature.** This scenario may already pass (Playwright
      sends no dragover while the slide runs). It still pins Review Focus 1 and 2.
      If it fails, stop and find out why before going on: a broken gesture or a
      `finished` that never resolves under the paused clock is a design problem to
      raise with the maintainer.
- [ ] **Step 3: Unit tests, one at a time, each Red then Green**:
  - `"ignores hovers until the slide into the live preview has finished"`:
    after the preview (animate's `finished` pending), move the finger to the
    top edge of Items (more than 8 px away; against the preview this takes
    Cyphers out of the pair), advance 300 ms: pair still shown. Resolve
    `finished`, flush microtasks (`await Promise.resolve()` a few times, or
    `await vi.runAllTimersAsync()`), move to a point 1 px from the last one,
    advance 300 ms: pair gone.
  - `"does not ignore hovers when nothing slides"` (Review Focus 4): reduced
    motion; after the preview, move to Items' top edge, advance 300 ms: pair gone.
  - `"a slide from an ended drag does not lift the gate of the next one"`
    (Review Focus 5): preview, `touchcancel` (first slide's `finished` still
    pending), new drag to a preview (second slide pending), resolve the first
    slide's `finished`, flush, move to a zone that would change the layout,
    advance 300 ms: layout unchanged.
- [ ] **Step 4: Implement the gate** in `SectionDragController` as the
      Interfaces block describes.
- [ ] **Step 5: Run unit tests and the feature file, expect PASS.**
- [ ] **Step 6: `npm run docs:steps`, lint, typecheck:tests, format touched
      files, commit** (after Rule 1 review)

```bash
git add <touched files>
git commit -m "feat(layout): ignore hovers while sections slide into a live preview"
```

---

### Task 4: Every device profile, and the docs

**Files:**

- Modify: `docs/superpowers/specs/2026-10-31-section-pair-drag-design.md`
- Modify: `docs/TODO.md` (remove "Animate the live preview." from "Section
  Drag Follow-ups")
- Modify: `docs/FEATURES.md` (record the slide next to the live preview entry)
- Modify: `docs/ARCHITECTURE.md` only if it describes the drag controller's
  host interface (add `renderWithSlide`)

- [ ] **Step 1: Run the feature on every profile**, one at a time:
      `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature` with
      `DEVICE` unset, `pixel5`, `iphone12`, `ipadpro`. Expected: all pass (the
      1280 px scenarios set their own width; WebKit runs the mouse drags). A
      failure beyond a flaky helper: stop and report to the maintainer.
- [ ] **Step 2: Run the whole suites:** `npm run test:unit`, `npm run lint`,
      `npm run typecheck:tests`, `npm run check:i18n`, `npm run test:e2e:prod`.
- [ ] **Step 3: Amend the spec.** Replace "The layout changes in one step (no
      animation). Animating sections to their new places is a possible follow-up."
      with a dated (2026-11-02) bullet stating decisions 1–4 and 6–8 above in the
      spec's own voice, each marked as the author's call.
- [ ] **Step 4: Move the TODO entry to FEATURES.md.**
- [ ] **Step 5: Commit** (after Rule 1 review)

```bash
git add docs/
git commit -m "docs: record sliding sections into the live preview"
```
