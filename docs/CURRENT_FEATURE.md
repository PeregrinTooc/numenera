# CURRENT FEATURE: Pairing and Unpairing Sections by Drag

## Overview

In layout edit mode, sections can only be reordered. This feature lets users
pair two sections side by side by dragging one onto the middle of another, and
take a section out of a pair by dragging it between rows. It is the drag half
of the former TODO item "Grid Merge/Split & Import-Layout Conflict Prompt"; the
import prompt stays in `TODO.md` as its own item.

**Design:** `docs/superpowers/specs/2026-10-31-section-pair-drag-design.md`
(approved 2026-10-31). The design is the source of truth for behaviour; this
file tracks progress.

## Starting point

- `CharacterSheet.mergeSections()`, `splitGrid()`, `updateLayout()` and
  `getLayout()` wrap the pure, unit-tested functions in
  `src/utils/layoutOperations.ts` but have no callers.
- `SectionDragController` only reports "move source before target"
  (`SectionDragHost.onReorder`).

## E2E Tests

- File: `tests/e2e/features/section-rearrangement.feature`. Un-skip and rewrite
  the merge/split scenarios to match the design. The step
  `the sections should remain in single-column layout` needs a real body.
  - Merge sections into grid by dragging onto another section
  - Cannot merge non-eligible sections into grid
  - Split sections from grid by dragging out
- New scenarios from the design: left/right side, pairing with an already
  paired section (pushed down/up), swapping with your own partner, previews,
  narrow-screen reorder and breaking a stacked pair.

## Implementation plan

To be written next (superpowers:writing-plans).

## Progress

- [x] Design approved
- [ ] Implementation plan
- [ ] Refactor: drop-intent callback replaces `onReorder` (Rule 6)
- [ ] Behaviour, scenario by scenario
- [ ] Move to `FEATURES.md`
