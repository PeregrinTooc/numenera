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
