# Automated Section Drag/Drop E2E Tests & Touch Long-Press Drag — Design

Date: 2026-09-26
Backlog entry: `docs/TODO.md` → "Automated Drag/Drop E2E Tests"

## Goal

Un-skip and automate the two section drag scenarios in
`tests/e2e/features/section-rearrangement.feature`:

- "Reorder sections by dragging" (desktop)
- "Section dragging works on mobile with long-tap" (touch)

## Findings (investigation, 2026-09-26)

### Desktop: the problem is scrolling, not Playwright

The backlog assumed Playwright cannot reliably drive HTML5 drag/drop. That is
false: card reordering already uses `locator.dragTo()` and passes, and the
skipped section step uses the same call.

Instrumenting the drag showed the real cause. At the default 1280×720 viewport,
the Cyphers and Abilities sections are not both on screen. `dragTo()` presses
the mouse on the source, then scrolls the target into view while the button is
held. Chromium then starts the drag on whatever lies under the cursor after the
scroll, which was **Abilities**, not Cyphers. `handleDragOver` returns early for
target === source, so no `drop` fires. In a 1280×4000 viewport, the identical
`dragTo()` call produced `dragstart:cyphers` → `drop:abilities` and the correct
new order.

The `rerender()` inside `CharacterSheet.handleDragStart` is **not** a cause: the
source node stays connected and identical during the drag.

### Touch: the feature does not exist

`src/` contains no touch, pointer or long-press handling. The mobile scenario
describes behaviour the app does not implement; it relied on the browser's
native touch-to-drag, which Playwright cannot emulate. The existing step mixes
`touchscreen.tap` with `mouse.down` and its final Then asserts nothing.

## Design

### 1. Desktop test fix (test code only)

- New helper `dragSectionTo(page, sourceId, targetId)` in
  `tests/e2e/support/` (e.g. `sectionDrag.ts`):
  1. Save the current viewport size.
  2. Set the height to `document.documentElement.scrollHeight`, keeping the
     width (layout depends only on width, so this is safe on every viewport).
  3. Run a real `locator.dragTo()` with `targetPosition` near the top of the
     target.
  4. Restore the saved viewport.
- The section drag steps in `section-rearrangement.steps.ts` use it.
- Refactor first (Rule 6): the steps file duplicates a section-name → id map
  in many steps; collapse it into one shared map/lookup.
- Remove `@skip` from "Reorder sections by dragging".
- Real mouse input is preferred over dispatching synthetic `DragEvent`s,
  because it exercises `draggable`, `dragover` `preventDefault()` and the drop
  hit-test. Fallback only if the viewport approach proves flaky: synthetic
  events with a shared `DataTransfer`.

### 2. Touch long-press drag (new app behaviour)

**Event model: touch events, not pointer events.** Once the browser begins
scrolling, pointer events receive `pointercancel` and the gesture is lost. A
non-passive `touchmove` listener can still call `preventDefault()` after the
long-press activates. `touch-action: none` is rejected: sections cover the
whole page on a phone, so it would make the page unscrollable in edit mode.

**New unit: `src/components/helpers/LongPressDrag.ts`**

A small, DOM-free state machine (`idle → pending → active → idle`):

- Constructor options: `holdMs` (default 250), `moveTolerancePx`
  (default 10), and callbacks `onActivate(id)`, `onHover(x, y)`, `onDrop()`,
  `onAbort()`.
- `start(id, x, y)`: enter `pending`, start the hold timer.
- `move(x, y)`:
  - `pending` and moved more than `moveTolerancePx` from the start point →
    clear the timer, return to `idle` (the user is scrolling). No callback.
  - `active` → `onHover(x, y)`.
  - Returns whether the gesture is `active`, so the caller knows whether to
    `preventDefault()` the `touchmove`.
- Timer fires while `pending` → `active`, `onActivate(id)`.
- `end()`: `active` → `onDrop()`; `pending` → clear timer; then `idle`.
- `cancel()`: `active` → `onAbort()`; `pending` → clear timer; then `idle`.
- `isActive()` getter.

Unit-tested with Vitest fake timers.

**Wiring in `CharacterSheet`** (only when `isLayoutEditMode`):

- `@touchstart` on each draggable section (single sections and grid children,
  both templates) → `longPress.start(id, touch.clientX, touch.clientY)`.
  Multi-touch (`touches.length > 1`) → `cancel()`.
- `@touchmove` via a lit listener object with `passive: false` →
  `if (longPress.move(x, y)) e.preventDefault()`.
- `@touchend` → `end()`; `@touchcancel` → `cancel()`.
- `onActivate(id)` → `draggedSectionId = id`, rerender (reuses the existing
  `.dragging` style).
- `onHover(x, y)` → `document.elementFromPoint(x, y)?.closest("[data-section-id]")`;
  if it is a different section, set `dropTargetId` and rerender when changed.
- `onDrop()` → if `dropTargetId` is set, `reorderSections(dragged, target)`;
  then clear drag state and rerender.
- `onAbort()` → clear drag state and rerender.
- While a touch drag is active, `dragstart` and `contextmenu` on sections are
  `preventDefault()`ed so Android's native long-press drag and menu don't also
  fire.
- The long-press is cancelled when layout edit mode is exited.

No user-facing text is added, so no i18n keys are needed.

### 3. Scenarios (BDD, Rule 2)

In `section-rearrangement.feature`, the "Section dragging works on mobile with
long-tap" scenario is replaced by:

```gherkin
Scenario: Reorder sections by long-press dragging on a touch device
  Given I am using a mobile device
  And layout edit mode is active
  When I long-press the "Cyphers" section and drag it above the "Abilities" section
  Then the "Cyphers" section should appear before the "Abilities" section

Scenario: Long-press puts a section into drag mode
  Given I am using a mobile device
  And layout edit mode is active
  When I long-press the "Cyphers" section
  Then the "Cyphers" section should be in drag mode

Scenario: A quick swipe does not start a section drag
  Given I am using a mobile device
  And layout edit mode is active
  When I swipe from the "Cyphers" section towards the "Abilities" section
  Then the "Cyphers" section should appear after the "Abilities" section
```

Touch steps use a helper `touchDragSection(page, …)` in `tests/e2e/support/`
that drives `Input.dispatchTouchEvent` through a Chromium CDP session
(`touchStart` → wait → `touchMove` in steps → `touchEnd`). The long-press hold
used in tests is 300 ms (safely above the 250 ms threshold); the swipe moves
immediately. Real CDP touch input is preferred over dispatching `TouchEvent`
from the page because it goes through Chromium's input pipeline, including
scrolling and passive-listener handling.

The "Given I am using a mobile device" step already exists
(`additional-fields-editing.steps.ts`) and the E2E context already sets
`hasTouch: true`.

### 4. Out of scope

- Edge auto-scroll during a touch drag. Likely needed on phones for long
  distances; add to `docs/TODO.md` as a follow-up.
- Grid merge/split and the import-layout prompt (separate backlog item; their
  `@skip`s stay). The `dragSectionTo` helper should be reusable there.

## Testing

- Unit: `tests/unit/longPressDrag.test.ts` covering each state transition
  above, with fake timers. `CharacterSheet` wiring is covered by the E2E
  scenarios plus, where practical, a unit test that a touch sequence on a
  section in edit mode reorders the layout.
- E2E: the four scenarios above pass in `npm run test:e2e:all` and
  `npm run test:e2e:prod`, and repeated runs of `section-rearrangement.feature`
  (at least 5) show no flakiness.
- `npm run lint`, `npm run check:i18n`, `npm run build` pass.

## Documentation

- `docs/CURRENT_FEATURE.md` while in flight.
- Afterwards move the entry from `docs/TODO.md` to `docs/FEATURES.md`, update
  the Grid Merge/Split backlog note that says drag/drop is not automatable,
  and add the auto-scroll follow-up to `docs/TODO.md`.
