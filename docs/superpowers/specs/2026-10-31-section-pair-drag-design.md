# Pairing and Unpairing Sections by Drag — Design

Date: 2026-10-31. Status: design, not yet built.

## Intent

In layout edit mode a user can only reorder sections. The default layout ships
two side-by-side pairs (Special Abilities + Attacks, Background + Notes), but a
user can never make a pair of their own choosing (e.g. Cyphers next to Items).
The layout logic to pair two sections exists and is unit-tested
(`mergeSectionsInLayout` in `src/utils/layoutOperations.ts`), but no gesture
calls it. The maintainer wants to arrange the grid freely.

This is the first half of the TODO item "Grid Merge/Split & Import-Layout
Conflict Prompt". The import-layout prompt is a separate piece of work with its
own design, done afterwards. It is out of scope here.

## Goals

- Drag a section onto the middle of another section to pair them side by side.
- Drag a section between rows to move it there, including out of a pair.
- Show, before the drop, what the drop will do.
- Work with mouse (native HTML5 DnD) and touch (long-press drag).

## Non-goals

- The import-layout conflict prompt (separate design).
- Edge auto-scroll during touch drags (separate TODO item).
- Pairs of more than two sections; three-column layouts.
- Making Basic Info, Stats or Recovery/Damage pairable
  (`SINGLE_ONLY_SECTIONS` stays as is).
- Keyboard-driven layout editing.

## Anti-goals

- A drop whose outcome the user could not predict from the preview.
- A drop that silently does something on a narrow screen that the user cannot
  see (pairs are invisible below the `lg` breakpoint, see below).

## Behaviour (decided with the maintainer)

### Drop zones on the hovered section

The hovered section is split into zones by pointer position, relative to the
section's bounding box:

| Zone                            | Meaning                                 |
| ------------------------------- | --------------------------------------- |
| Top quarter (0–25 % height)     | the gap above the hovered section's row |
| Bottom quarter (75–100 %)       | the gap below the hovered section's row |
| Middle half, left half of width | pair, dragged section on the **left**   |
| Middle half, right half         | pair, dragged section on the **right**  |

"Above" and "below" are not separate concepts: both zones name a gap between
two rows. The bottom quarter of one row and the top quarter of the next row
point at the same gap. The bottom quarter of the last row is the gap at the
end of the sheet (_my call_; the maintainer noted the same result is reachable
by dragging the last section above the other one).

For a hovered section that is in a pair, "its row" is the pair's row: the gaps
are above and below the whole pair (at `lg` and wider; see "Narrow screens"
for the stacked case).

### Pairing with a single section

Dropping in the middle of a single, pairable section replaces both with a pair
at the hovered section's row position, the dragged section on the side chosen
by the left/right half. The dragged section's old row closes up. If the dragged
section came out of a pair, its old partner is left alone and becomes a single,
full-width row in place.

### Pairing with a section that is already paired

Dropping in the middle of a paired section (e.g. Cyphers onto Notes, which is
paired with Background):

- The dragged section takes the hovered section's slot in the pair (same
  side). The left/right half does not matter here (_my call_, maintainer did
  not object).
- The hovered section is pushed out to its own full-width row, in the
  direction the dragged section was travelling:
  - dragged section came from **above** the pair → pushed out **below** the
    pair;
  - dragged section came from **below** → pushed out **above** the pair.

  "Above/below" compares the dragged section's row index with the pair's row
  index in the layout before the drop.

Confirmed by the maintainer with the mockups in screens A and B.

### Dropping on the middle of your own partner

**Decided:** dragging one half of a pair onto the middle of its own partner
swaps their sides. The left/right half of the partner's middle zone gives the
dragged section's new side; if that is already its side, the drop does nothing
and no ghost is shown. The preview is an orange ghost on the new side and the
partner shown on the other side.

### Sections that cannot be paired

The middle zone of Basic Info, Stats or Recovery/Damage does nothing, and
nothing pairs when the _dragged_ section is one of those three. Only the
top/bottom gaps are live in that case (_my call_ for the "dragged section
non-pairable" half; the maintainer saw and accepted the "hovered section
non-pairable" mockup).

### Leaving a pair

Dragging one half of a pair into any gap moves it there as a single row. The
partner left behind becomes a single, full-width row in the pair's old
position. This matches what `reorderLayout` already does.

### Preview while hovering

The preview is a rendered ghost, not just a highlight, so the drop is
predictable:

- **Gap zones:** a horizontal insertion line in the gap.
- **Middle zone, single target:** an orange dashed ghost of the dragged section
  beside the target, on the chosen side.
- **Middle zone, paired target:** an orange ghost in the hovered section's slot
  and a green dashed ghost of the hovered section on its own row where it will
  land. The maintainer found showing both at once clear.
- **Non-pairable middle:** no ghost.
- The dragged section stays in place, faded, while dragging (as today's
  `.dragging` style).

Mockups: `.superpowers/brainstorm/16904-1793457743/content/` (`drop-zones.html`,
`pair-hover.html`, `into-pair-hover.html`). These are throwaway mockups, kept
locally and not committed.

### Live preview after holding still (amended 2026-11-01)

**Decided with the maintainer after Task 7**, once the overlay previews were
visible: overlays alone are hard to read over a section's content, so the
sheet also shows the real result.

- When the drop intent has stayed the same for **300 ms**, the sheet renders
  the layout the drop would produce. Nothing is saved yet. The dragged section
  sits in its new place, faded.
- Only a change of intent restarts the wait. Pointer jitter inside one zone
  does not, and moving over a zone whose drop would do nothing (for example
  the dragged section's own new place) keeps the current live preview.
- After the live preview, further hovering is resolved against the previewed
  layout, so the next 300 ms preview builds on it.
- During the wait, the overlays above are shown, with a "charging" cue: the
  ghost or line fills in over the 300 ms, so the jump that follows is
  expected.
- Dropping never waits: releasing before 300 ms applies the intent, as
  before. Releasing during a live preview commits what is shown.
- Cancelling (releasing outside the sheet, Esc, a touch cancel, leaving edit
  mode) restores the layout from before the drag and saves nothing.
- The layout changes in one step (no animation). Animating sections to their
  new places is a possible follow-up.

This replaces the earlier blanket "no layout jumps while hovering": the jump
happens only after the pointer has been still, and the dragged section then
lies under the pointer, which is a no-op zone, so the layout settles instead
of flipping.

A spike (not committed) confirmed that re-rendering mid-drag re-creates the
dragged section's element without breaking the gesture: native mouse drags on
Chromium and WebKit and CDP touch drags on Chromium kept delivering
`dragover`/`touchmove`, and drop/`touchend` committed. WebKit touch (iOS)
cannot be automated; check it by hand on a device.

### Narrow screens (below `lg`)

Pairs only render side by side at Tailwind's `lg` breakpoint (`lg:grid-cols-2`
in `CharacterSheet.ts`, 64rem = 1024px). Below it, a pair renders as two
stacked rows. **Decided:** below `lg` the middle zone does not pair; it behaves
as a gap (reorder only). So below `lg` the whole section is effectively top
half = gap above, bottom half = gap below (_my call_ on the 50/50 split; with
no middle zone, splitting at the middle avoids a dead band).

Dragging half of an existing pair on a narrow screen still takes it out of the
pair, as today.

**Decided:** below `lg`, each half of a pair is treated as its own row for gap
purposes, because that is what the user sees. The seam between the two stacked
halves (bottom half of the upper one, top half of the lower one) is a real
gap: dropping there **breaks the pair** and inserts the dragged section between
the two former halves, which become singles. The insertion line is drawn at the
seam. The gap above the upper half and the gap below the lower half behave as
the gaps above and below the pair and leave the pair intact.

Viewports (Rule 9): the rule is "pair only where pairs are visible side by
side", decided by what the CSS renders, not by device name. Playwright's iPad
Pro 11 profile is 834px wide, below `lg`, so it gets reorder only, as do Pixel
5 and iPhone 12. Desktop Chrome is the only test profile with pairing. Touch
pairing on a wide screen therefore needs its own CDP touch scenario on
Chromium at a viewport of at least 1024px.

## Constraints

- All 11 rules in `CLAUDE.md`. In particular BDD first (Rule 2): un-skip and
  rewrite the merge/split scenarios in
  `tests/e2e/features/section-rearrangement.feature`. The empty step
  `the sections should remain in single-column layout` must get a real body.
- Layout changes stay pure: add or extend functions in
  `src/utils/layoutOperations.ts` (unit-tested), and keep
  `SectionDragController` translating pointer positions into a drop intent.
- `SectionDragHost.onReorder(source, target)` ("move source before target")
  is too narrow. Replace it with one callback taking a drop intent
  (gap at index / pair with target on side), and wire it to the existing
  `CharacterSheet` layout methods (`applyLayout`). This is a Rule 6 refactor
  that comes first, with tests green.
- Persistence is already handled by `CharacterSheet.applyLayout`.
- Any new user-visible text (e.g. an aria-live announcement, if the builder
  adds one) goes through `t()` with keys in both locales (Rule 4).
- Preview CSS lives in `src/styles/components/layout-editor.css`, using
  `@theme` colours. Tailwind class names must be literal.
- E2E drags: use `dragSectionTo` (mouse) or `TouchGesture` inside
  `withFullHeightViewport` (touch) from `tests/e2e/support/sections.ts`. These
  helpers need to target a point inside a zone (e.g. the target's
  middle-left), not just the target's centre. See
  `docs/superpowers/specs/2026-09-26-section-dnd-e2e-design.md`.

## Left to the builder

- The exact drop-intent type and where the zone computation lives.
- How ghosts are rendered: real elements in the layout flow versus
  overlays. It must not cause layout jumps that move the zone under the
  pointer while hovering. If in-flow ghosts make the target jump, prefer
  overlays.
- Whether the `drop-target` class survives or is replaced by zone-specific
  classes.
- Hit-testing for gaps between rows: the `gap-6` space between a pair's
  columns and between rows belongs to no section. Treat it sensibly, e.g.
  as the nearest gap, or keep the last intent.
- Unit test split between `layoutOperations` and `SectionDragController`.
