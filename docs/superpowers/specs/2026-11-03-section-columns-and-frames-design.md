# Section Columns and Frames — Design

**Date:** 2026-11-03
**Status:** Draft for review

## Intent

Since sections can be paired side by side (see
`2026-10-31-section-pair-drag-design.md`), the sheet mixes two kinds of
inconsistency that pairing made visible:

1. **Card columns follow the screen, not the section.** Abilities, Cypher and
   Items lay out their cards with `grid-cols-1 md:grid-cols-2`, so on a wide
   screen they split into two columns even when the section is only half the
   sheet wide (a paired Cypher squeezes two cards into ~400 px). Special
   Abilities and Attacks always use one column.
2. **Sections are framed differently.** Basic Info, Stats, Cypher and Items
   sit in the brown framed box (`.section-box` / `.basic-info-card`);
   Abilities, Special Abilities and Attacks have no frame (heading and cards
   straight on the sheet); Background and Notes have their own amber box
   (`.parchment-field`).

The maintainer wants the sheet to read as one system: every section framed
the same way, and card columns that make sense for the space a section
actually has, with a per-section choice where there is room for one.

## Decided with the maintainer

- **Columns follow the section's own width.** A section that is narrow never
  shows two columns, however it got narrow (paired with another section, or a
  narrow screen). Only a section wide enough for two cards side by side can
  show two columns.
- **A one/two-column switch** for a card section that is wide enough, shown
  only in "change layout" (layout edit) mode. Outside that mode there is no
  switch; the section just shows its setting.
- **Which sections get the switch:** the card sections — Abilities, Special
  Abilities, Attacks, Cypher, Items. Basic Info, Stats, Recovery/Damage,
  Background and Notes keep their fixed inner layout and get no switch.
- **The setting is stored with the layout** (same storage as section order
  and pairs, so it travels in exports and imports like the layout does).
- **Width decides, not pairing.** The maintainer corrected "a section next to
  another is one column" to "columns follow the section's width". So a
  paired section side by side (from `lg`, 64rem) is narrow and shows one
  column; below `lg` a pair stacks, each half is full width, and it follows
  its setting like any wide section (and shows the switch in edit mode).
  Pairing and un-pairing never change the setting: a section set to two
  columns shows one while it sits narrow in a pair, two again once it is
  wide.
- **Defaults are today's look.** Without a stored choice: Abilities, Cypher
  and Items two columns; Special Abilities and Attacks one column. Layouts
  saved before this change, and the default layout, therefore look as they do
  today (on a wide screen; a paired or narrow section shows one column).
- **Switch look: an icon button in the section's top-right corner** (option B
  of the mockups). One button; each press toggles one ↔ two columns; its icon
  shows the current state (one bar or two). It needs a translated tooltip and
  accessible label (Rule 4), e.g. "Show cards in two columns" / "Show cards in
  one column", and `aria-pressed` or an equivalent state.
- **The badges move to the top-left corner, always.** Cypher's max-cyphers
  badge and Items' badge (`stat-badge badge-top-right` in `CyphersBox.ts` and
  `ItemsBox.ts`) currently take the top-right corner the switch needs. They
  move to the top-left corner of their section in every mode (not just in
  layout edit mode); they stay clickable and keep opening their edit dialog.
  The maintainer accepts that this is a little unusual.
- **Frames: the brown box everywhere** (option A of the mockups). Every
  section gets the box Basic Info, Stats and Cypher have now:
  Abilities, Special Abilities and Attacks gain it; Background and Notes swap
  the amber `.parchment-field` box for it; Recovery/Damage gets it around its
  green Recovery and red Damage Track boxes, which stay inside it as they are
  (option A of a second mockup). The cards and input fields inside
  sections keep their own borders.
- **Frames mean the box, not the headings** (my call). Abilities, Special
  Abilities and Attacks keep their own heading rows (emoji, add button);
  only the outer box is unified.

## Goals

- Consistent frames across all ten sections.
- Card columns that fit the section's width on every viewport (Rule 9:
  Desktop Chrome, Pixel 5, iPhone 12, iPad Pro).
- A per-section one/two-column choice, set in layout edit mode, persisted
  with the layout, defaulting to today's look.

## Non-goals

- More than two columns.
- Column choices for non-card sections (Stats' three pools, Recovery/Damage,
  Basic Info, Background, Notes).
- Changing the cards themselves (their inner `grid-cols-2` badge rows in
  `AbilityItem`/`AttackItem` stay).
- Changing how pairing, drop zones or the live preview work.

## Anti-goals (would make this a failure even if it technically works)

- Two cramped columns in a half-width section or on a phone.
- A switch that appears outside layout edit mode, or on a section where it
  can do nothing (narrow, or not a card section).
- Existing users opening the app to a different-looking sheet before they
  touch anything (beyond the new frames, which are intended).
- A saved layout from before this change failing validation and being thrown
  away (`loadLayout` falls back to the default on an invalid layout, which
  would silently lose the user's arrangement).

## Constraints

- All 11 rules in `CLAUDE.md`: BDD first, TDD, i18n for the button's label
  and tooltip in both `en.json` and `de.json`, strict TypeScript, storage
  through the existing layout storage, review before each commit.
- Tailwind v4 (classes must be literal strings; theme in the `@theme` block
  of `src/styles/main.css`). Tailwind v4 has container queries built in
  (`@container`, `@md:` style variants), which fit "follow the section's own
  width" directly.
- The layout is validated on load (`isValidLayout` in `src/types/layout.ts`)
  and on import (`src/storage/fileStorage.ts`) and exported by
  `src/storage/exportManager.ts`. Old layouts (no column settings) must stay
  valid, and old app versions should ideally still read new exports.
- Sections re-render through `CharacterSheet` / `SheetSections`, and the
  collection sections (Abilities, Special Abilities, Attacks, Cypher, Items)
  are mounted by `SheetSections.mountCollectionSections`.
- The live-preview slide (FLIP, `src/components/helpers/sectionSlide.ts`)
  must keep working: a section that changes columns when paired by a live
  preview simply has a new box.

## Left to the builder

- **Where the setting lives in the data model.** My call: a per-section map
  stored alongside the layout rows (e.g. `{ rows: Layout, columns:
Partial<Record<CardSectionId, 1 | 2>> }` or a separate field next to the
  array), rather than a property on single rows, so pairing and un-pairing
  (which rebuild rows) can't lose it. Only non-default values need storing.
  Whatever shape is chosen must keep old stored layouts and old exports
  valid (see anti-goals).
- **The width at which a section counts as "wide enough"** for two columns
  (my call: roughly where two cards of today's minimum readable width fit,
  so a half-width pair at 1280 px stays one column and a full-width single
  row on iPad Pro portrait, 834 px, may show two — the builder should pick
  the container breakpoint and check it on all four profiles).
- **Whether the switch is hidden or disabled** on a card section that is
  currently too narrow (my call: hidden, consistent with "never a switch
  where it can do nothing"; a side-by-side paired section in edit mode
  shows no switch, a stacked one below `lg` does). Width-based visibility can
  be done in CSS with the same container query as the columns.
- **The comparison view** (`diffCollectionSections.ts`, `GRID_TWO_COLUMNS`):
  it renders the same card grids in narrow panes. My call: apply the same
  width rule there (narrow panes show one column) without a switch.
- **Reset Layout** (settings): resets column choices along with order and
  pairs (my call).
- **Version history** excludes only the portrait; layout is not part of
  character versions today — no change.
- Exact icon artwork, tooltip wording in both languages, button size (at
  least 44 px touch target, as the Edit Layout button has).
