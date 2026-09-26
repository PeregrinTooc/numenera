# Section Drag/Drop E2E Tests & Touch Long-Press Drag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate the two `@skip`ped section-drag scenarios in `section-rearrangement.feature` — fixing the desktop test's scroll problem and building the missing touch long-press drag it depends on.

**Architecture:** Desktop: a shared E2E helper grows the viewport to the full page height so `locator.dragTo()` never scrolls mid-drag. Touch: a DOM-free `LongPressDrag` state machine (`idle → pending → active`) decides _when_ a touch becomes a drag; `CharacterSheet` feeds it touch events and maps its callbacks onto the existing `draggedSectionId` / `dropTargetId` / `reorderSections` machinery. E2E touch steps drive real Chromium touch input over CDP.

**Tech Stack:** TypeScript (strict), lit-html 3.3, Vitest + jsdom (fake timers), Cucumber 12 + Playwright 1.58 (Chromium, `hasTouch: true`), CDP `Input.dispatchTouchEvent`.

**Spec:** `docs/superpowers/specs/2026-09-26-section-dnd-e2e-design.md` — read it first; it holds the investigation findings this plan argues from.

## Global Constraints

- Work only in the worktree `C:\GitRepos\numenera\.claude\worktrees\section-dnd-e2e` on branch `feat/section-dnd-e2e`.
- TypeScript strict, no `any`, explicit return types on exports; `interface` for object shapes, `type` for unions (Rule 5).
- BDD first: the scenario exists (and fails) before the app code that makes it pass (Rule 2). TDD for all `src/` code (Rule 3). Never more than one failing test at a time (Rule 10).
- No user-facing text is added by this feature, so no i18n keys. If you add any, they go in both `en.json` and `de.json` (Rule 4).
- Long-press: hold **250 ms**, move tolerance **10 px** (Euclidean distance from the touch start). E2E long-press hold: **300 ms**.
- Touch events, not pointer events; no `touch-action: none` on sections (spec §2).
- Edge auto-scroll during a touch drag is out of scope. Grid merge/split and the import-layout prompt are out of scope — their `@skip`s stay.
- Never run `cucumber-js` directly — use the `npm run test:e2e -- <feature> [--name "<scenario>"]` scripts (CLAUDE.md).
- Any change to a `*.steps.ts` file or `.feature` file: run `npm run docs:steps` before committing — the pre-commit hook's `check:steps` fails on a stale `tests/e2e/STEP_CATALOG.md` and also fails if a step definition becomes unused.
- Pre-commit runs lint-staged, `test:unit`, `check:i18n`, `check:steps`. Pre-push runs `build` + `test:e2e:prod` (several minutes) — push only in the final task.
- Commits: conventional, one `-m` per paragraph, chained with `&&`, ending with the two trailer paragraphs below (Rule 7). Don't mention test state in messages.
  ```
  -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_011ejETWX6SP92xnaowMkqRU"
  ```
- Run `npm run format` on changed files before committing (Prettier owns formatting).
- Use `@/` aliases for `src` imports in unit tests and `src/` code. E2E code imports `src/` via relative paths (`../../../src/...js`), matching existing E2E files.

## Review Focus

1. **Multi-touch (pinch-zoom) on a section in edit mode** — a second finger must cancel a pending/active long-press and leave the layout untouched. Pinned in Task 7 (unit test "a second finger cancels the touch drag").
2. **Exiting layout edit mode mid touch-drag** — the `dragging` class must disappear and no reorder may happen. Pinned in Task 7 (unit test "exiting edit mode cancels an active touch drag").
3. **Releasing a long-press without moving onto another section** (or over non-section chrome like the header) — no reorder, drag styling cleared. Pinned in Task 7 (unit test "releasing over no other section does not reorder").
4. **Android's native long-press drag/context menu racing our touch drag** — `dragstart` and `contextmenu` on a section must be `preventDefault()`ed while a touch drag is active. Pinned in Task 7 (unit tests "native dragstart is blocked during a touch drag", "contextmenu is blocked during a touch drag").
5. **Ordinary scrolling in edit mode on a phone** — a touch that moves beyond 10 px before 250 ms must not `preventDefault()` its `touchmove` (so the page scrolls) and must never activate. Pinned in Task 6 (unit test "a touch that moves before the hold elapses never activates and is not prevented") and Task 7 (E2E swipe scenario).

---

## File Structure

| File                                                                 | Responsibility                                                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `.gitattributes` (create)                                            | Pin `STEP_CATALOG.md` to LF so `check:steps` passes on Windows checkouts       |
| `docs/CURRENT_FEATURE.md` (create, removed in Task 8)                | In-flight feature doc                                                          |
| `tests/e2e/support/sections.ts` (create)                             | Section name→id lookup, full-height viewport, desktop drag, CDP `TouchGesture` |
| `tests/e2e/step-definitions/section-rearrangement.steps.ts` (modify) | Use the shared helpers; new touch steps; remove dead long-tap steps            |
| `tests/e2e/features/section-rearrangement.feature` (modify)          | Un-skip desktop drag; replace long-tap scenario with three touch scenarios     |
| `src/components/helpers/LongPressDrag.ts` (create)                   | DOM-free long-press state machine                                              |
| `tests/unit/longPressDrag.test.ts` (create)                          | State-machine unit tests (fake timers)                                         |
| `src/types/layout.ts` (modify)                                       | Add `isSectionId` type guard                                                   |
| `src/components/CharacterSheet.ts` (modify)                          | One `renderDraggableSection`; touch wiring                                     |
| `tests/unit/characterSheetTouchDrag.test.ts` (create)                | Touch wiring unit tests on a mounted sheet                                     |
| `src/styles/components/layout-editor.css` (modify)                   | Suppress iOS callout / text selection on draggable sections in edit mode       |
| `docs/TODO.md`, `docs/FEATURES.md` (modify)                          | Move the backlog entry; add auto-scroll follow-up                              |

---

### Task 1: Housekeeping — LF step catalog and in-flight doc

**Files:**

- Create: `.gitattributes`
- Create: `docs/CURRENT_FEATURE.md`

**Interfaces:** none.

- [ ] **Step 1: Confirm the failure**

Run: `npm run check:steps`
Expected on a Windows checkout with `core.autocrlf=true`: either PASS (if the file was already rewritten to LF locally) or `❌ tests/e2e/STEP_CATALOG.md is out of date`. Note which.

- [ ] **Step 2: Add `.gitattributes`**

```gitattributes
# The step catalog is generated with LF line endings by scripts/step-catalog.js,
# and `npm run check:steps` compares it byte-for-byte. Pin it to LF so Windows
# checkouts (core.autocrlf=true) don't fail the check with an identical file.
tests/e2e/STEP_CATALOG.md text eol=lf
```

- [ ] **Step 3: Renormalise and verify**

Run: `git add --renormalize tests/e2e/STEP_CATALOG.md && rm tests/e2e/STEP_CATALOG.md && git checkout -- tests/e2e/STEP_CATALOG.md && npm run check:steps`
Expected: `check:steps` passes. `git diff --cached --stat` shows no content change to the catalog (only `.gitattributes` is new).

- [ ] **Step 4: Create `docs/CURRENT_FEATURE.md`**

```markdown
# Current Feature: Automated Section Drag/Drop E2E Tests & Touch Long-Press Drag

**Spec:** `docs/superpowers/specs/2026-09-26-section-dnd-e2e-design.md`
**Plan:** `docs/superpowers/plans/2026-09-26-section-dnd-e2e.md`
**Branch:** `feat/section-dnd-e2e`

## Goals

- Automate "Reorder sections by dragging" (desktop) — root cause was
  `dragTo()` scrolling mid-drag, not Playwright's HTML5 DnD support.
- Build touch long-press (250 ms) section dragging and automate it with real
  CDP touch input.

## Status

- [ ] Housekeeping (LF step catalog)
- [ ] Shared E2E section helpers
- [ ] Desktop drag scenario un-skipped
- [ ] `LongPressDrag` state machine
- [ ] `CharacterSheet` draggable-section refactor
- [ ] Touch drag: activation
- [ ] Touch drag: drop, swipe guard, edge cases
- [ ] Docs and final verification
```

- [ ] **Step 5: Commit**

```bash
npm run format -- docs/CURRENT_FEATURE.md && git add .gitattributes docs/CURRENT_FEATURE.md tests/e2e/STEP_CATALOG.md && git commit -m "chore(repo): pin step catalog to LF line endings" -m "check:steps compares the generated catalog byte-for-byte, so autocrlf checkouts on Windows failed it with identical content." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_011ejETWX6SP92xnaowMkqRU"
```

---

### Task 2: Refactor — shared section lookup for E2E steps

Behaviour-preserving refactor (Rule 6). `section-rearrangement.steps.ts` has ~11 copies of a `sectionIdMap` literal; each covers a different subset. `src/types/layout.ts` already has `SECTION_DISPLAY_NAMES: Record<SectionId, string>` whose values are exactly the English names the Gherkin uses ("Basic Info", "Cyphers", "Special Abilities", …), so the lookup reverses that map.

**Files:**

- Create: `tests/e2e/support/sections.ts`
- Modify: `tests/e2e/step-definitions/section-rearrangement.steps.ts` (every `sectionIdMap` block: around lines 243, 279, 320, 389, 425, 467, 506, 566, 605, 634)

**Interfaces:**

- Produces: `sectionId(name: string): SectionId` — throws `Error("Unknown section: <name>")` for an unknown name.
- Produces: `sectionLocator(page: Page, name: string): Locator` — `[data-section-id="<id>"]`.

- [ ] **Step 1: Create `tests/e2e/support/sections.ts`**

```ts
import type { Locator, Page } from "@playwright/test";
import { SECTION_DISPLAY_NAMES, type SectionId } from "../../../src/types/layout.js";

/**
 * Resolve a section's display name as written in Gherkin ("Special Abilities")
 * to its layout id ("specialAbilities").
 */
export function sectionId(name: string): SectionId {
  const entry = (Object.entries(SECTION_DISPLAY_NAMES) as [SectionId, string][]).find(
    ([, displayName]) => displayName === name
  );
  if (!entry) {
    throw new Error(`Unknown section: ${name}`);
  }
  return entry[0];
}

export function sectionLocator(page: Page, name: string): Locator {
  return page.locator(`[data-section-id="${sectionId(name)}"]`);
}
```

- [ ] **Step 2: Replace every `sectionIdMap` in the steps file**

In each step, delete the `const sectionIdMap: Record<string, string> = { … };` literal and the `if (!sourceId || !targetId) throw …` / `if (!sectionId) throw …` guards that follow it, and replace the lookups:

```ts
// before
const sourceId = sectionIdMap[sourceSection];
const targetId = sectionIdMap[targetSection];
// after
const sourceId = sectionId(sourceSection);
const targetId = sectionId(targetSection);
```

Where a step names a local variable `sectionId` (e.g. "I have moved the {string} section to the top", "the {string} section should still be at the top", "I drag {string} out of the grid", "{string} should be in its own row"), rename the local to `id` so it doesn't shadow the import:

```ts
const id = sectionId(sectionName);
```

and update its uses within that step. Where the step then builds `page.locator(\`[data-section-id="${…}"]\`)`from a name, use`sectionLocator(page, name)` instead.

Add the import at the top of the steps file:

```ts
import { sectionId, sectionLocator } from "../support/sections.js";
```

- [ ] **Step 3: Verify nothing changed behaviourally**

Run: `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature`
Expected: same result as before the refactor — all non-`@skip` scenarios pass (run it once on the unmodified branch first if unsure).

Run: `npm run lint`
Expected: clean.

- [ ] **Step 4: Regenerate the step catalog and commit**

```bash
npm run docs:steps && npm run format -- tests/e2e/support/sections.ts tests/e2e/step-definitions/section-rearrangement.steps.ts && git add tests/e2e/support/sections.ts tests/e2e/step-definitions/section-rearrangement.steps.ts tests/e2e/STEP_CATALOG.md && git commit -m "refactor(e2e): share section name lookup across layout steps" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_011ejETWX6SP92xnaowMkqRU"
```

---

### Task 3: Desktop — automate "Reorder sections by dragging"

Root cause (spec, "Findings"): at 1280×720 the source and target sections are not both on screen, so `dragTo()` scrolls to the target with the mouse held, and Chromium starts the drag on the wrong section. Growing the viewport to the page's full height removes all scrolling.

**Files:**

- Modify: `tests/e2e/support/sections.ts`
- Modify: `tests/e2e/step-definitions/section-rearrangement.steps.ts` (step "I drag the {string} section above the {string} section", ~line 238)
- Modify: `tests/e2e/features/section-rearrangement.feature` (remove `@skip` on "Reorder sections by dragging")

**Interfaces:**

- Consumes: `sectionLocator` (Task 2).
- Produces: `withFullHeightViewport<T>(page: Page, action: () => Promise<T>): Promise<T>` — Task 7 uses it for the touch drag.
- Produces: `dragSectionTo(page: Page, sourceName: string, targetName: string): Promise<void>`.

- [ ] **Step 1: Un-skip the scenario (red)**

In `section-rearrangement.feature`, delete the `@skip` line directly above `Scenario: Reorder sections by dragging` and change the comment above it from `# Section Reordering - Drag/Drop tests skipped for now (manual testing required)` to `# Section Reordering`.

Run: `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature --name "Reorder sections by dragging"`
Expected: FAIL at `Then the "Cyphers" section should appear before the "Abilities" section` with `Expected: < 3, Received: 6`.

- [ ] **Step 2: Add the helpers to `tests/e2e/support/sections.ts`**

```ts
/**
 * Run `action` with the viewport grown to the page's full height (width is
 * unchanged, so the layout is unchanged), scrolled to the top.
 *
 * Why: `locator.dragTo()` scrolls the target into view while the mouse button
 * is held. When source and target aren't both on screen, the page moves under
 * the cursor and Chromium starts the drag on whatever is there instead. With
 * everything on screen, nothing scrolls. Restores the viewport afterwards.
 */
export async function withFullHeightViewport<T>(page: Page, action: () => Promise<T>): Promise<T> {
  const original = page.viewportSize();
  if (!original) {
    throw new Error("withFullHeightViewport needs a page with a fixed viewport");
  }
  const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewportSize({
    width: original.width,
    height: Math.max(original.height, fullHeight),
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  try {
    return await action();
  } finally {
    await page.setViewportSize(original);
  }
}

/** Drag a section with the real mouse and drop it near the top of another. */
export async function dragSectionTo(
  page: Page,
  sourceName: string,
  targetName: string
): Promise<void> {
  await withFullHeightViewport(page, async () => {
    await sectionLocator(page, sourceName).dragTo(sectionLocator(page, targetName), {
      targetPosition: { x: 10, y: 10 },
    });
  });
}
```

- [ ] **Step 3: Use it in the step**

Replace the body of `When("I drag the {string} section above the {string} section", …)` with:

```ts
When(
  "I drag the {string} section above the {string} section",
  async function (this: CustomWorld, sourceSection: string, targetSection: string) {
    await dragSectionTo(this.page, sourceSection, targetSection);
  }
);
```

(Remove the old `page.waitForTimeout(200)` — the `Then` step reads the DOM synchronously after `reorderSections`' synchronous rerender; if it proves racy, make the `Then` poll with `expect.poll` instead of adding a sleep.) Extend the import: `import { dragSectionTo, sectionId, sectionLocator } from "../support/sections.js";`

- [ ] **Step 4: Run it (green)**

Run: `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature --name "Reorder sections by dragging"`
Expected: PASS.

- [ ] **Step 5: Flakiness check and full feature**

Run the single scenario 5 times in a row (PowerShell: `1..5 | % { npm run test:e2e -- tests/e2e/features/section-rearrangement.feature --name "Reorder sections by dragging" }`).
Expected: 5/5 PASS. If any fail, stop and report — don't add sleeps.

Run: `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature`
Expected: all non-`@skip` scenarios pass.

- [ ] **Step 6: Commit**

```bash
npm run docs:steps && npm run format -- tests/e2e/support/sections.ts tests/e2e/step-definitions/section-rearrangement.steps.ts tests/e2e/features/section-rearrangement.feature && git add tests/e2e && git commit -m "test(e2e): automate desktop section drag reordering" -m "dragTo() scrolled the target into view with the mouse held, so Chromium started the drag on the wrong section. Dragging within a full-height viewport removes the scroll." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_011ejETWX6SP92xnaowMkqRU"
```

---

### Task 4: `LongPressDrag` state machine (unit TDD)

**Files:**

- Create: `src/components/helpers/LongPressDrag.ts`
- Test: `tests/unit/longPressDrag.test.ts`

**Interfaces:**

- Produces (Task 6/7 rely on exactly this):

```ts
export const DEFAULT_HOLD_MS = 250;
export const DEFAULT_MOVE_TOLERANCE_PX = 10;

export interface LongPressDragOptions<Id extends string> {
  holdMs?: number;
  moveTolerancePx?: number;
  onActivate: (id: Id) => void;
  onHover: (x: number, y: number) => void;
  onDrop: () => void;
  onAbort: () => void;
}

export class LongPressDrag<Id extends string> {
  constructor(options: LongPressDragOptions<Id>);
  start(id: Id, x: number, y: number): void; // cancels any gesture in progress first
  move(x: number, y: number): boolean; // true ⇔ gesture is active (caller should preventDefault)
  end(): void; // active → onDrop; pending → no callback
  cancel(): void; // active → onAbort; pending → no callback
  isActive(): boolean;
}
```

Callbacks `onDrop` / `onAbort` are invoked **after** the machine has returned to idle, so `isActive()` is `false` inside them.

Work one test at a time (Rule 10): add a test, run it, see it fail for the right reason, make it pass, next. The complete test file after all cycles:

- [ ] **Step 1: Test — activates after the hold elapses (red)**

Create `tests/unit/longPressDrag.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LongPressDrag } from "@/components/helpers/LongPressDrag";

function createDrag(options: { holdMs?: number; moveTolerancePx?: number } = {}) {
  const onActivate = vi.fn();
  const onHover = vi.fn();
  const onDrop = vi.fn();
  const onAbort = vi.fn();
  const drag = new LongPressDrag<string>({ ...options, onActivate, onHover, onDrop, onAbort });
  return { drag, onActivate, onHover, onDrop, onAbort };
}

describe("LongPressDrag", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("activates once the touch has been held for 250ms", () => {
    const { drag, onActivate } = createDrag();

    drag.start("cyphers", 100, 100);
    vi.advanceTimersByTime(249);
    expect(onActivate).not.toHaveBeenCalled();
    expect(drag.isActive()).toBe(false);

    vi.advanceTimersByTime(1);
    expect(onActivate).toHaveBeenCalledWith("cyphers");
    expect(drag.isActive()).toBe(true);
  });
});
```

Run: `npm run test:unit -- tests/unit/longPressDrag.test.ts`
Expected: FAIL — cannot resolve `@/components/helpers/LongPressDrag`.

- [ ] **Step 2: Minimal implementation (green)**

Create `src/components/helpers/LongPressDrag.ts`:

```ts
/**
 * LongPressDrag - decides when a touch becomes a drag.
 *
 * A touch that stays within `moveTolerancePx` of where it started for
 * `holdMs` activates; a touch that moves further first is a scroll and is
 * ignored. DOM-free: the caller feeds it coordinates and reacts to callbacks.
 */

export const DEFAULT_HOLD_MS = 250;
export const DEFAULT_MOVE_TOLERANCE_PX = 10;

export interface LongPressDragOptions<Id extends string> {
  holdMs?: number;
  moveTolerancePx?: number;
  onActivate: (id: Id) => void;
  onHover: (x: number, y: number) => void;
  onDrop: () => void;
  onAbort: () => void;
}

type LongPressState<Id extends string> =
  | { kind: "idle" }
  | {
      kind: "pending";
      id: Id;
      startX: number;
      startY: number;
      timer: ReturnType<typeof setTimeout>;
    }
  | { kind: "active"; id: Id };

export class LongPressDrag<Id extends string> {
  private state: LongPressState<Id> = { kind: "idle" };
  private readonly holdMs: number;
  private readonly moveTolerancePx: number;

  constructor(private readonly options: LongPressDragOptions<Id>) {
    this.holdMs = options.holdMs ?? DEFAULT_HOLD_MS;
    this.moveTolerancePx = options.moveTolerancePx ?? DEFAULT_MOVE_TOLERANCE_PX;
  }

  start(id: Id, x: number, y: number): void {
    const timer = setTimeout(() => this.activate(id), this.holdMs);
    this.state = { kind: "pending", id, startX: x, startY: y, timer };
  }

  isActive(): boolean {
    return this.state.kind === "active";
  }

  private activate(id: Id): void {
    this.state = { kind: "active", id };
    this.options.onActivate(id);
  }
}
```

Run: `npm run test:unit -- tests/unit/longPressDrag.test.ts` → PASS. (Unimplemented `move`/`end`/`cancel` come in the next cycles.)

- [ ] **Step 3: Cycle — moving beyond the tolerance before activation cancels it**

Add test:

```ts
it("never activates when the touch moves more than 10px before the hold elapses", () => {
  const { drag, onActivate } = createDrag();

  drag.start("cyphers", 100, 100);
  expect(drag.move(100, 111)).toBe(false);
  vi.advanceTimersByTime(250);

  expect(onActivate).not.toHaveBeenCalled();
  expect(drag.isActive()).toBe(false);
});
```

Red (`drag.move is not a function`). Add to the class:

```ts
  move(x: number, y: number): boolean {
    if (this.state.kind === "active") {
      this.options.onHover(x, y);
      return true;
    }
    if (this.state.kind === "pending") {
      const distance = Math.hypot(x - this.state.startX, y - this.state.startY);
      if (distance > this.moveTolerancePx) {
        this.reset();
      }
    }
    return false;
  }

  /** Return to idle, clearing a pending hold timer. */
  private reset(): void {
    if (this.state.kind === "pending") {
      clearTimeout(this.state.timer);
    }
    this.state = { kind: "idle" };
  }
```

Green.

- [ ] **Step 4: Cycle — jitter within the tolerance does not cancel**

```ts
it("still activates when the finger jitters within 10px during the hold", () => {
  const { drag, onActivate } = createDrag();

  drag.start("cyphers", 100, 100);
  drag.move(106, 108); // distance 10
  vi.advanceTimersByTime(250);

  expect(onActivate).toHaveBeenCalledWith("cyphers");
});
```

Expected: passes immediately (guards the `>` vs `>=` boundary). If it passes without code changes, that's fine — it pins the boundary.

- [ ] **Step 5: Cycle — moving while active reports hover and asks for preventDefault**

```ts
it("reports hover positions and asks to prevent scrolling once active", () => {
  const { drag, onHover } = createDrag();

  drag.start("cyphers", 100, 100);
  vi.advanceTimersByTime(250);

  expect(drag.move(100, 400)).toBe(true);
  expect(onHover).toHaveBeenCalledWith(100, 400);
});

it("does not ask to prevent scrolling while still pending", () => {
  const { drag, onHover } = createDrag();

  drag.start("cyphers", 100, 100);

  expect(drag.move(102, 101)).toBe(false);
  expect(onHover).not.toHaveBeenCalled();
});
```

Expected: both pass with the Step 3 code (add them one at a time anyway, confirming each).

- [ ] **Step 6: Cycle — `end()` drops an active gesture**

```ts
it("drops when an active gesture ends, and returns to idle first", () => {
  const { drag, onDrop } = createDrag();
  let activeDuringDrop: boolean | null = null;
  onDrop.mockImplementation(() => {
    activeDuringDrop = drag.isActive();
  });

  drag.start("cyphers", 100, 100);
  vi.advanceTimersByTime(250);
  drag.end();

  expect(onDrop).toHaveBeenCalledTimes(1);
  expect(activeDuringDrop).toBe(false);
  expect(drag.isActive()).toBe(false);
});
```

Red. Add:

```ts
  end(): void {
    const wasActive = this.isActive();
    this.reset();
    if (wasActive) {
      this.options.onDrop();
    }
  }
```

Green.

- [ ] **Step 7: Cycle — `end()` while pending prevents activation, without dropping**

```ts
it("a short tap ends before activation and never activates or drops", () => {
  const { drag, onActivate, onDrop } = createDrag();

  drag.start("cyphers", 100, 100);
  vi.advanceTimersByTime(100);
  drag.end();
  vi.advanceTimersByTime(500);

  expect(onActivate).not.toHaveBeenCalled();
  expect(onDrop).not.toHaveBeenCalled();
});
```

Expected: passes with Step 6 code (`reset()` clears the timer).

- [ ] **Step 8: Cycle — `cancel()` aborts an active gesture**

```ts
it("aborts when an active gesture is cancelled", () => {
  const { drag, onAbort, onDrop } = createDrag();

  drag.start("cyphers", 100, 100);
  vi.advanceTimersByTime(250);
  drag.cancel();

  expect(onAbort).toHaveBeenCalledTimes(1);
  expect(onDrop).not.toHaveBeenCalled();
  expect(drag.isActive()).toBe(false);
});

it("cancelling a pending gesture prevents activation without aborting", () => {
  const { drag, onActivate, onAbort } = createDrag();

  drag.start("cyphers", 100, 100);
  drag.cancel();
  vi.advanceTimersByTime(500);

  expect(onActivate).not.toHaveBeenCalled();
  expect(onAbort).not.toHaveBeenCalled();
});
```

Red on the first. Add:

```ts
  cancel(): void {
    const wasActive = this.isActive();
    this.reset();
    if (wasActive) {
      this.options.onAbort();
    }
  }
```

Green (second test then passes too — add it after the first is green).

- [ ] **Step 9: Cycle — starting again replaces the gesture in progress**

```ts
it("starting a new gesture cancels the one in progress", () => {
  const { drag, onActivate, onAbort } = createDrag();

  drag.start("cyphers", 100, 100);
  vi.advanceTimersByTime(250);
  drag.start("abilities", 50, 50);

  expect(onAbort).toHaveBeenCalledTimes(1);
  expect(drag.isActive()).toBe(false);

  vi.advanceTimersByTime(250);
  expect(onActivate).toHaveBeenLastCalledWith("abilities");
  expect(onActivate).toHaveBeenCalledTimes(2);
});
```

Red (no `onAbort`, and the first timer would also still be pending in the pending→start case). Change `start` to begin with `this.cancel();`:

```ts
  start(id: Id, x: number, y: number): void {
    this.cancel();
    const timer = setTimeout(() => this.activate(id), this.holdMs);
    this.state = { kind: "pending", id, startX: x, startY: y, timer };
  }
```

Green.

- [ ] **Step 10: Cycle — idle calls are no-ops; options are honoured**

```ts
it("ignores move, end and cancel when no gesture is in progress", () => {
  const { drag, onHover, onDrop, onAbort } = createDrag();

  expect(drag.move(10, 10)).toBe(false);
  drag.end();
  drag.cancel();

  expect(onHover).not.toHaveBeenCalled();
  expect(onDrop).not.toHaveBeenCalled();
  expect(onAbort).not.toHaveBeenCalled();
});

it("honours custom hold time and move tolerance", () => {
  const { drag, onActivate } = createDrag({ holdMs: 500, moveTolerancePx: 30 });

  drag.start("cyphers", 100, 100);
  drag.move(120, 100);
  vi.advanceTimersByTime(499);
  expect(onActivate).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(onActivate).toHaveBeenCalledWith("cyphers");
});
```

Expected: both pass.

- [ ] **Step 11: Refactor, lint, commit**

Review the class for duplication (`end`/`cancel` share shape — acceptable at two call sites; don't abstract). Run: `npm run test:unit -- tests/unit/longPressDrag.test.ts && npm run lint` → green/clean.

```bash
npm run format -- src/components/helpers/LongPressDrag.ts tests/unit/longPressDrag.test.ts && git add src/components/helpers/LongPressDrag.ts tests/unit/longPressDrag.test.ts && git commit -m "feat(layout): add long-press drag gesture state machine" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_011ejETWX6SP92xnaowMkqRU"
```

---

### Task 5: Refactor — one `renderDraggableSection` in `CharacterSheet`

Behaviour-preserving (Rule 6). `renderLayoutItem`'s single branch and `renderGridItem` render the identical draggable wrapper; the touch wiring would otherwise be added twice.

**Files:**

- Modify: `src/components/CharacterSheet.ts` (`renderLayoutItem` ~line 177–217, `renderGridItem` ~line 219–245)

**Interfaces:**

- Produces: `private renderDraggableSection(sectionId: SectionId): TemplateResult` — Tasks 6/7 add touch listeners here only.

- [ ] **Step 1: Confirm green baseline**

Run: `npm run test:unit` → all pass. Note the count.

- [ ] **Step 2: Extract**

Rename `renderGridItem` to `renderDraggableSection` (update its JSDoc to "Render a section wrapped for layout editing (drag handle, drop target)"), keep its body unchanged, and rewrite `renderLayoutItem`:

```ts
  /**
   * Render a layout item (single or grid)
   */
  private renderLayoutItem(item: LayoutItem): TemplateResult {
    if (item.type === "single") {
      return this.renderDraggableSection(item.id);
    }

    // Grid layout - two sections side by side
    const wrapperClass = this.isLayoutEditMode ? "layout-grid" : "";

    return html`
      <div
        class="grid grid-cols-1 lg:grid-cols-2 gap-6 ${wrapperClass}"
        data-testid="layout-grid-${item.items[0]}-${item.items[1]}"
      >
        ${this.renderDraggableSection(item.items[0])} ${this.renderDraggableSection(item.items[1])}
      </div>
    `;
  }
```

- [ ] **Step 3: Verify**

Run: `npm run test:unit` → same count, all pass.
Run: `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature` → all non-`@skip` pass (including Task 3's drag scenario).
Run: `npm run lint` → clean.

- [ ] **Step 4: Commit**

```bash
npm run format -- src/components/CharacterSheet.ts && git add src/components/CharacterSheet.ts && git commit -m "refactor(layout): render single and grid sections through one draggable wrapper" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_011ejETWX6SP92xnaowMkqRU"
```

---

### Task 6: Touch drag — long-press activation (outside-in)

**Files:**

- Modify: `tests/e2e/features/section-rearrangement.feature`
- Modify: `tests/e2e/support/sections.ts` (add `TouchGesture`, `nearTopOf`, `LONG_PRESS_HOLD_MS`)
- Modify: `tests/e2e/step-definitions/section-rearrangement.steps.ts`
- Modify: `src/components/CharacterSheet.ts`
- Modify: `src/styles/components/layout-editor.css`
- Create: `tests/unit/characterSheetTouchDrag.test.ts`

**Interfaces:**

- Consumes: `LongPressDrag<SectionId>` (Task 4), `renderDraggableSection` (Task 5), `sectionLocator` (Task 2).
- Produces (E2E, used by Task 7):

```ts
export const LONG_PRESS_HOLD_MS = 300;
export interface Point {
  x: number;
  y: number;
}
export async function nearTopOf(locator: Locator): Promise<Point>;
export class TouchGesture {
  static start(page: Page, point: Point): Promise<TouchGesture>;
  moveTo(point: Point, steps?: number): Promise<void>; // default 10 steps
  end(): Promise<void>;
}
```

- Produces (app, used by Task 7): `CharacterSheet` private members `longPress: LongPressDrag<SectionId>`, `handleTouchStart(e: TouchEvent, sectionId: SectionId): void`, `touchMoveListener` (lit listener object, `passive: false`), `handleTouchDragActivate(id: SectionId): void`, `clearDragState(): void`.

- [ ] **Step 1: Replace the long-tap scenario with the activation scenario (red)**

In `section-rearrangement.feature`, replace the whole block

```gherkin
  @skip
  Scenario: Section dragging works on mobile with long-tap
    Given I am using a mobile device
    And layout edit mode is active
    When I long-tap on a section for 250ms
    Then the section should enter drag mode
    And I should be able to drag it to a new position
```

with

```gherkin
  Scenario: Long-press puts a section into drag mode
    Given I am using a mobile device
    And layout edit mode is active
    When I long-press the "Cyphers" section
    Then the "Cyphers" section should be in drag mode
```

In `section-rearrangement.steps.ts`, delete the three old steps under `// Mobile Long-tap Steps` ("I long-tap on a section for 250ms", "the section should enter drag mode", "I should be able to drag it to a new position") and add:

```ts
// ============================================
// Touch Long-press Steps
// ============================================

When("I long-press the {string} section", async function (this: CustomWorld, name: string) {
  const section = sectionLocator(this.page, name);
  await section.scrollIntoViewIfNeeded();
  // The gesture is deliberately left held: the Then step asserts the drag state.
  await TouchGesture.start(this.page, await nearTopOf(section));
  await this.page.waitForTimeout(LONG_PRESS_HOLD_MS);
});

Then(
  "the {string} section should be in drag mode",
  async function (this: CustomWorld, name: string) {
    await expect(sectionLocator(this.page, name)).toHaveClass(/\bdragging\b/);
  }
);
```

Extend the import: `import { dragSectionTo, LONG_PRESS_HOLD_MS, nearTopOf, sectionId, sectionLocator, TouchGesture } from "../support/sections.js";`

Append to `tests/e2e/support/sections.ts`:

```ts
import type { CDPSession } from "@playwright/test";
// (merge into the existing type import at the top of the file)

/** How long E2E long-presses hold — safely above the app's 250ms threshold. */
export const LONG_PRESS_HOLD_MS = 300;

export interface Point {
  x: number;
  y: number;
}

/**
 * A point just inside the top-left of an element — on the section heading,
 * away from nested cards and inputs.
 */
export async function nearTopOf(locator: Locator): Promise<Point> {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Element has no bounding box (not visible?)");
  }
  return { x: box.x + 20, y: box.y + 10 };
}

/**
 * A single-finger touch driven through Chromium's real input pipeline
 * (CDP Input.dispatchTouchEvent), so scrolling and non-passive touchmove
 * listeners behave as on a device. Coordinates are viewport CSS pixels.
 */
export class TouchGesture {
  private constructor(
    private readonly cdp: CDPSession,
    private current: Point
  ) {}

  static async start(page: Page, point: Point): Promise<TouchGesture> {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
    return new TouchGesture(cdp, point);
  }

  async moveTo(point: Point, steps = 10): Promise<void> {
    const from = this.current;
    for (let i = 1; i <= steps; i++) {
      const next = {
        x: from.x + ((point.x - from.x) * i) / steps,
        y: from.y + ((point.y - from.y) * i) / steps,
      };
      await this.cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [next] });
    }
    this.current = point;
  }

  async end(): Promise<void> {
    await this.cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await this.cdp.detach();
  }
}
```

Run: `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature --name "Long-press puts a section into drag mode"`
Expected: FAIL at the `Then` — `toHaveClass` times out (no `dragging` class; the app has no touch handling).

- [ ] **Step 2: Unit test — long-press marks the section as dragging (red)**

Create `tests/unit/characterSheetTouchDrag.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CharacterSheet } from "@/components/CharacterSheet";
import { createTestCharacter } from "../factories/character.js";

type TouchType = "touchstart" | "touchmove" | "touchend" | "touchcancel";

/** jsdom has TouchEvent but no Touch constructor, so `touches` is stubbed. */
function touch(
  target: Element,
  type: TouchType,
  points: { x: number; y: number }[] = []
): TouchEvent {
  const event = new TouchEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", {
    value: points.map((p) => ({ clientX: p.x, clientY: p.y })),
  });
  target.dispatchEvent(event);
  return event;
}

function section(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-section-id="${id}"]`);
  if (!element) throw new Error(`No section ${id}`);
  return element;
}

function sectionOrder(): string[] {
  return Array.from(document.querySelectorAll("[data-section-id]")).map(
    (el) => el.getAttribute("data-section-id") ?? ""
  );
}

describe("CharacterSheet touch long-press drag", () => {
  let sheet: CharacterSheet;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    document.body.innerHTML = '<div id="app"></div>';
    const container = document.getElementById("app") as HTMLElement;
    sheet = new CharacterSheet(createTestCharacter(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn());
    sheet.mount(container);
    sheet.toggleLayoutEditMode();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("marks a section as dragging after a 250ms long-press", () => {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);

    expect(section("cyphers").classList.contains("dragging")).toBe(true);
  });
});
```

Run: `npm run test:unit -- tests/unit/characterSheetTouchDrag.test.ts`
Expected: FAIL — `expected false to be true`.

- [ ] **Step 3: Wire activation into `CharacterSheet` (green)**

Imports:

```ts
import { LongPressDrag } from "./helpers/LongPressDrag.js";
```

Fields (after `private container: HTMLElement | null = null;`):

```ts
  /** Touch long-press → section drag; mouse drags use native HTML5 DnD. */
  private readonly longPress = new LongPressDrag<SectionId>({
    onActivate: (id) => this.handleTouchDragActivate(id),
    onHover: () => {},
    onDrop: () => this.clearDragState(),
    onAbort: () => this.clearDragState(),
  });

  /**
   * Lit listener object so the touchmove listener is registered non-passive:
   * an active touch drag must be able to preventDefault() the page scroll.
   * Kept as one stable object so lit doesn't re-add it on every render.
   */
  private readonly touchMoveListener = {
    handleEvent: (e: TouchEvent): void => this.handleTouchMove(e),
    passive: false,
  };
```

In `renderDraggableSection`'s wrapper `<div>`, after the `@drop=${…}` line, add:

```ts
        @touchstart=${(e: TouchEvent) => this.handleTouchStart(e, sectionId)}
        @touchmove=${this.touchMoveListener}
        @touchend=${() => this.longPress.end()}
        @touchcancel=${() => this.longPress.cancel()}
```

Methods (after `handleDrop`):

```ts
  /**
   * Handle touch start: begin a long-press that may become a section drag
   */
  private handleTouchStart(e: TouchEvent, sectionId: SectionId): void {
    if (!this.isLayoutEditMode) return;
    const touch = e.touches[0];
    if (!touch) return;
    this.longPress.start(sectionId, touch.clientX, touch.clientY);
  }

  /**
   * Handle touch move: once a long-press is active, the finger drags instead of scrolling
   */
  private handleTouchMove(e: TouchEvent): void {
    const touch = e.touches[0];
    if (!touch) return;
    if (this.longPress.move(touch.clientX, touch.clientY)) {
      e.preventDefault();
    }
  }

  /**
   * A long-press activated: show the section as being dragged
   */
  private handleTouchDragActivate(sectionId: SectionId): void {
    this.draggedSectionId = sectionId;
    this.dropTargetId = null;
    this.rerender();
  }

  /**
   * Clear drag/drop-target styling and re-render
   */
  private clearDragState(): void {
    this.draggedSectionId = null;
    this.dropTargetId = null;
    this.rerender();
  }
```

Also make `handleDragEnd` delegate to it (identical body): `private handleDragEnd(): void { this.clearDragState(); }`.

Run: `npm run test:unit -- tests/unit/characterSheetTouchDrag.test.ts` → PASS.

- [ ] **Step 4: Unit test — scrolling is left alone (Review Focus 5)**

Add to the `describe`:

```ts
it("a touch that moves before the hold elapses never activates and is not prevented", () => {
  touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
  const move = touch(section("cyphers"), "touchmove", [{ x: 20, y: 450 }]);
  vi.advanceTimersByTime(250);

  expect(move.defaultPrevented).toBe(false);
  expect(section("cyphers").classList.contains("dragging")).toBe(false);
});

it("prevents the page from scrolling once the long-press is active", () => {
  touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
  vi.advanceTimersByTime(250);
  vi.spyOn(document, "elementFromPoint").mockReturnValue(null);
  const move = touch(section("cyphers"), "touchmove", [{ x: 20, y: 450 }]);

  expect(move.defaultPrevented).toBe(true);
});
```

Note: jsdom has no `document.elementFromPoint`. `vi.spyOn` requires the property to exist, so define it in `beforeEach` (after `localStorage.clear()`):

```ts
// jsdom does not implement elementFromPoint; tests spy on this stub.
document.elementFromPoint = (): Element | null => null;
```

Expected: both pass with Step 3 code (the second doesn't need `elementFromPoint` yet, but Task 7's hover handler will call it — the spy keeps this test valid then). Add them one at a time.

- [ ] **Step 5: Unit test — no touch drag outside edit mode**

```ts
it("does nothing on long-press when layout edit mode is off", () => {
  sheet.toggleLayoutEditMode();

  touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
  vi.advanceTimersByTime(250);

  expect(section("cyphers").classList.contains("dragging")).toBe(false);
});
```

Expected: passes (guard in `handleTouchStart`; also no `dragging` class is rendered outside edit mode). If it passes without code change, keep it as a regression guard.

- [ ] **Step 6: Suppress the iOS callout / text selection on draggable sections**

In `src/styles/components/layout-editor.css`, extend the existing rule:

```css
.layout-edit-mode .layout-draggable {
  cursor: grab;
  /* A long-press starts a section drag; don't let it select text or open the iOS callout. */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
```

- [ ] **Step 7: Scenario green**

Run: `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature --name "Long-press puts a section into drag mode"`
Expected: PASS.

If it fails because the `dragging` class never appears, check with a throwaway `page.on("console")` log in `handleTouchStart` whether `touchstart` reaches the section. Don't add sleeps.

- [ ] **Step 8: Full checks and commit**

Run: `npm run test:unit && npm run lint && npm run test:e2e -- tests/e2e/features/section-rearrangement.feature` → all green.

```bash
npm run docs:steps && npm run format -- src/components/CharacterSheet.ts src/styles/components/layout-editor.css tests/unit/characterSheetTouchDrag.test.ts tests/e2e/support/sections.ts tests/e2e/step-definitions/section-rearrangement.steps.ts tests/e2e/features/section-rearrangement.feature && git add src tests && git commit -m "feat(layout): start a section drag with a touch long-press" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_011ejETWX6SP92xnaowMkqRU"
```

---

### Task 7: Touch drag — drop, swipe guard and edge cases

**Files:**

- Modify: `tests/e2e/features/section-rearrangement.feature`
- Modify: `tests/e2e/step-definitions/section-rearrangement.steps.ts`
- Modify: `src/types/layout.ts` (add `isSectionId`)
- Modify: `tests/unit/layout.test.ts` if it exists for `src/types/layout.ts` — otherwise add the guard test to `tests/unit/characterSheetTouchDrag.test.ts`'s sibling `tests/unit/layoutTypes.test.ts` (create). Check with `ls tests/unit | grep -i layout` first.
- Modify: `src/components/CharacterSheet.ts`
- Modify: `tests/unit/characterSheetTouchDrag.test.ts`

**Interfaces:**

- Consumes: everything Task 6 produced; `withFullHeightViewport` (Task 3).
- Produces: `export function isSectionId(value: string): value is SectionId` in `src/types/layout.ts`.

- [ ] **Step 1: Reorder scenario (red)**

Add below the Task 6 scenario:

```gherkin
  Scenario: Reorder sections by long-press dragging on a touch device
    Given I am using a mobile device
    And layout edit mode is active
    When I long-press the "Cyphers" section and drag it above the "Abilities" section
    Then the "Cyphers" section should appear before the "Abilities" section
```

Step:

```ts
When(
  "I long-press the {string} section and drag it above the {string} section",
  async function (this: CustomWorld, sourceName: string, targetName: string) {
    const page = this.page;
    // No edge auto-scroll yet, so keep both sections on screen for the gesture.
    await withFullHeightViewport(page, async () => {
      const gesture = await TouchGesture.start(
        page,
        await nearTopOf(sectionLocator(page, sourceName))
      );
      await page.waitForTimeout(LONG_PRESS_HOLD_MS);
      await gesture.moveTo(await nearTopOf(sectionLocator(page, targetName)));
      await gesture.end();
    });
  }
);
```

Add `withFullHeightViewport` to the import from `../support/sections.js`.

Run: `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature --name "long-press dragging on a touch device"`
Expected: FAIL at the `Then` (`Expected: < 3, Received: 6`) — activation works, but `onDrop` only clears state.

- [ ] **Step 2: `isSectionId` guard (unit TDD)**

Test (in the layout-types test file chosen above):

```ts
import { describe, it, expect } from "vitest";
import { isSectionId } from "@/types/layout";

describe("isSectionId", () => {
  it("accepts every layout section id and rejects anything else", () => {
    expect(isSectionId("cyphers")).toBe(true);
    expect(isSectionId("specialAbilities")).toBe(true);
    expect(isSectionId("Cyphers")).toBe(false);
    expect(isSectionId("")).toBe(false);
    expect(isSectionId("toString")).toBe(false);
  });
});
```

Red. Implement in `src/types/layout.ts` after `SECTION_DISPLAY_NAMES`:

```ts
/**
 * Type guard for values read from the DOM (e.g. `data-section-id`).
 */
export function isSectionId(value: string): value is SectionId {
  return Object.prototype.hasOwnProperty.call(SECTION_DISPLAY_NAMES, value);
}
```

Green.

- [ ] **Step 3: Unit test — long-press, move over another section, release reorders (red)**

```ts
it("moves a long-pressed section before the section it is released over", () => {
  const cyphers = section("cyphers");
  vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("abilities"));

  touch(cyphers, "touchstart", [{ x: 20, y: 500 }]);
  vi.advanceTimersByTime(250);
  touch(cyphers, "touchmove", [{ x: 20, y: 120 }]);
  expect(section("abilities").classList.contains("drop-target")).toBe(true);
  touch(cyphers, "touchend");

  const order = sectionOrder();
  expect(order.indexOf("cyphers")).toBeLessThan(order.indexOf("abilities"));
  expect(section("cyphers").classList.contains("dragging")).toBe(false);
});
```

Red. In `CharacterSheet`, change the `longPress` callbacks to:

```ts
    onHover: (x, y) => this.handleTouchDragHover(x, y),
    onDrop: () => this.handleTouchDrop(),
```

Import `isSectionId` from `../types/layout.js` (extend the existing import) and add:

```ts
  /**
   * During a touch drag, mark the section under the finger as the drop target
   */
  private handleTouchDragHover(x: number, y: number): void {
    const hovered = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-section-id]");
    const hoveredId = hovered?.dataset.sectionId;
    const targetId =
      hoveredId && isSectionId(hoveredId) && hoveredId !== this.draggedSectionId ? hoveredId : null;

    if (targetId !== this.dropTargetId) {
      this.dropTargetId = targetId;
      this.rerender();
    }
  }

  /**
   * Touch drag released: move the dragged section before the drop target, if any
   */
  private handleTouchDrop(): void {
    const sourceId = this.draggedSectionId;
    const targetId = this.dropTargetId;
    if (sourceId && targetId) {
      this.draggedSectionId = null;
      this.dropTargetId = null;
      this.reorderSections(sourceId, targetId); // persists and re-renders
    } else {
      this.clearDragState();
    }
  }
```

Green.

- [ ] **Step 4: Unit tests — Review Focus edge cases (one at a time)**

Add each, run, make it pass, then the next.

```ts
it("releasing over no other section does not reorder (Review Focus 3)", () => {
  const before = sectionOrder();
  const cyphers = section("cyphers");
  vi.spyOn(document, "elementFromPoint").mockReturnValue(document.body);

  touch(cyphers, "touchstart", [{ x: 20, y: 500 }]);
  vi.advanceTimersByTime(250);
  touch(cyphers, "touchmove", [{ x: 20, y: 5 }]);
  touch(cyphers, "touchend");

  expect(sectionOrder()).toEqual(before);
  expect(section("cyphers").classList.contains("dragging")).toBe(false);
});
```

Expected: passes with Step 3 code.

```ts
it("a second finger cancels the touch drag (Review Focus 1)", () => {
  const before = sectionOrder();
  const cyphers = section("cyphers");
  vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("abilities"));

  touch(cyphers, "touchstart", [{ x: 20, y: 500 }]);
  vi.advanceTimersByTime(250);
  touch(cyphers, "touchstart", [
    { x: 20, y: 500 },
    { x: 200, y: 500 },
  ]);
  // Keep both fingers down past the hold time: a restarted gesture would re-activate.
  vi.advanceTimersByTime(250);

  expect(section("cyphers").classList.contains("dragging")).toBe(false);
  touch(cyphers, "touchend");
  expect(sectionOrder()).toEqual(before);
});
```

Red (without the fix, the two-finger `touchstart` calls `longPress.start()` again, which aborts and then starts a new pending gesture that re-activates after 250 ms). In `handleTouchStart`, after the edit-mode guard:

```ts
if (e.touches.length !== 1) {
  this.longPress.cancel();
  return;
}
const touch = e.touches[0];
```

(remove the now-redundant `if (!touch) return;`). Green.

```ts
it("exiting edit mode cancels an active touch drag (Review Focus 2)", () => {
  touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
  vi.advanceTimersByTime(250);

  sheet.toggleLayoutEditMode();
  sheet.toggleLayoutEditMode();

  expect(section("cyphers").classList.contains("dragging")).toBe(false);
});
```

Red (`draggedSectionId` survives the toggle). At the top of `toggleLayoutEditMode`:

```ts
this.longPress.cancel();
```

Green.

```ts
it("native dragstart is blocked during a touch drag (Review Focus 4)", () => {
  touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
  vi.advanceTimersByTime(250);

  const dragStart = new Event("dragstart", { bubbles: true, cancelable: true });
  section("cyphers").dispatchEvent(dragStart);

  expect(dragStart.defaultPrevented).toBe(true);
});
```

Red. At the top of `handleDragStart`:

```ts
if (this.longPress.isActive()) {
  // Android can start its own long-press drag; the touch drag owns this gesture.
  e.preventDefault();
  return;
}
```

Green.

```ts
it("contextmenu is blocked during a touch drag (Review Focus 4)", () => {
  touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
  vi.advanceTimersByTime(250);

  const contextMenu = new Event("contextmenu", { bubbles: true, cancelable: true });
  section("cyphers").dispatchEvent(contextMenu);

  expect(contextMenu.defaultPrevented).toBe(true);
});

it("contextmenu is left alone when no touch drag is active", () => {
  const contextMenu = new Event("contextmenu", { bubbles: true, cancelable: true });
  section("cyphers").dispatchEvent(contextMenu);

  expect(contextMenu.defaultPrevented).toBe(false);
});
```

Red on the first. In `renderDraggableSection`'s wrapper add `@contextmenu=${(e: Event) => this.handleContextMenu(e)}` and:

```ts
  /**
   * Suppress the long-press context menu while a touch drag is in progress
   */
  private handleContextMenu(e: Event): void {
    if (this.longPress.isActive()) {
      e.preventDefault();
    }
  }
```

Green; then add the second test (passes).

```ts
it("touchcancel aborts an active touch drag without reordering", () => {
  const before = sectionOrder();
  const cyphers = section("cyphers");
  vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("abilities"));

  touch(cyphers, "touchstart", [{ x: 20, y: 500 }]);
  vi.advanceTimersByTime(250);
  touch(cyphers, "touchmove", [{ x: 20, y: 120 }]);
  touch(cyphers, "touchcancel");

  expect(sectionOrder()).toEqual(before);
  expect(section("cyphers").classList.contains("dragging")).toBe(false);
});
```

Expected: passes (`touchcancel → longPress.cancel() → onAbort → clearDragState`).

- [ ] **Step 5: Reorder scenario green**

Run: `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature --name "long-press dragging on a touch device"`
Expected: PASS.

- [ ] **Step 6: Swipe scenario**

Add:

```gherkin
  Scenario: A quick swipe does not start a section drag
    Given I am using a mobile device
    And layout edit mode is active
    When I swipe from the "Cyphers" section towards the "Abilities" section
    Then the "Abilities" section should appear before the "Cyphers" section
```

(Reuses the existing "should appear before" step with the default order — Abilities precedes Cyphers.)

Step:

```ts
When(
  "I swipe from the {string} section towards the {string} section",
  async function (this: CustomWorld, sourceName: string, targetName: string) {
    const page = this.page;
    await withFullHeightViewport(page, async () => {
      const gesture = await TouchGesture.start(
        page,
        await nearTopOf(sectionLocator(page, sourceName))
      );
      await gesture.moveTo(await nearTopOf(sectionLocator(page, targetName)));
      await gesture.end();
    });
  }
);
```

Run: `npm run test:e2e -- tests/e2e/features/section-rearrangement.feature --name "quick swipe"` → PASS. It passes on first run because the tolerance logic already exists — it's a guard against regressions, and that's expected. To confirm it can fail, temporarily change `DEFAULT_MOVE_TOLERANCE_PX` to `10000` and `DEFAULT_HOLD_MS` to `0`, see it fail, then revert.

- [ ] **Step 7: Flakiness check, full checks, commit**

Run the three touch scenarios plus the desktop drag scenario 5 times (PowerShell: `1..5 | % { npm run test:e2e -- tests/e2e/features/section-rearrangement.feature }`). Expected: 5/5 fully green.

Run: `npm run test:unit && npm run lint && npm run check:i18n` → green.

```bash
npm run docs:steps && npm run format -- src tests && git add src tests && git commit -m "feat(layout): drop sections by touch long-press drag" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_011ejETWX6SP92xnaowMkqRU"
```

---

### Task 8: Docs and final verification

**Files:**

- Modify: `docs/TODO.md` (remove "Automated Drag/Drop E2E Tests" ~lines 99–126; edit the Grid Merge/Split "Implementation notes" bullet that says drag/drop is a known unresolved limitation; add auto-scroll follow-up)
- Modify: `docs/FEATURES.md`
- Delete: `docs/CURRENT_FEATURE.md`

- [ ] **Step 1: `docs/FEATURES.md`**

Add an entry in the file's existing style (read the surrounding entries first and match heading level/format):

```markdown
### Automated Section Drag/Drop Tests & Touch Long-Press Drag

- Sections can be reordered on touch devices: in layout edit mode, long-press a
  section (250 ms) and drag it onto another section to move it above that
  section. A quick swipe still scrolls the page.
- The desktop and touch section-drag scenarios in
  `section-rearrangement.feature` run automatically. Desktop drags run in a
  full-height viewport (`tests/e2e/support/sections.ts`) because
  `locator.dragTo()` scrolls mid-drag otherwise; touch drags use real CDP touch
  input (`TouchGesture`).
- Spec: `docs/superpowers/specs/2026-09-26-section-dnd-e2e-design.md`
```

- [ ] **Step 2: `docs/TODO.md`**

1. Delete the whole `### Automated Drag/Drop E2E Tests` section (through the quoted note ending "…see "Grid Merge/Split & Import-Layout Conflict Prompt" below.").
2. In `### Grid Merge/Split & Import-Layout Conflict Prompt` → **Implementation notes**, replace the bullet beginning "This project has a known, unresolved Playwright limitation…" with:

```markdown
- Section drags are automatable: use `dragSectionTo` (mouse) or `TouchGesture`
  inside `withFullHeightViewport` (touch) from `tests/e2e/support/sections.ts`.
  `locator.dragTo()` fails when it has to scroll mid-drag — see
  `docs/superpowers/specs/2026-09-26-section-dnd-e2e-design.md`.
```

3. Add a backlog entry:

```markdown
### Edge Auto-Scroll for Touch Section Drags

**Overview**  
Touch long-press section dragging has no auto-scroll, so on a phone a section
can only be dropped onto a section that is already on screen.

**Goals**

- Scroll the page while a touch drag is held near the top/bottom edge of the
  viewport
- Cover it with an E2E scenario that drags between sections that aren't both
  on screen (don't use `withFullHeightViewport` for that one)
```

- [ ] **Step 3: Delete `docs/CURRENT_FEATURE.md`**

Run: `git rm docs/CURRENT_FEATURE.md`

- [ ] **Step 4: Full verification (Rule 8)**

Run each and confirm green; paste the summaries into the task report:

- `npm run lint`
- `npm run check:i18n`
- `npm run check:steps`
- `npm run test:unit`
- `npm run build`
- `npm run test:e2e:all`
- `npm run test:e2e:prod`

- [ ] **Step 5: Commit**

```bash
npm run format -- docs/FEATURES.md docs/TODO.md && git add docs && git commit -m "docs(features): move section drag automation from backlog to completed" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_011ejETWX6SP92xnaowMkqRU"
```

- [ ] **Step 6: Push (orchestrator only)**

`git push` — the pre-push hook runs `build` + `test:e2e:prod` again. Opening a PR is the maintainer's call.
