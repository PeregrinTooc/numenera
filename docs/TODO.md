# TODO - Numenera Character Sheet

## 🔨 Development Workflow

**When starting a new feature:**

1. Move the topmost feature from this file to `CURRENT_FEATURE.md`
2. Delete it from this TODO file
3. Fill out the detailed planning sections in CURRENT_FEATURE.md
4. Implement the feature
5. When complete, move to FEATURES.md and delete CURRENT_FEATURE.md
6. Repeat with next feature

**File Purposes:**

- **TODO.md** (this file) - Backlog of lightweight feature requests
- **CURRENT_FEATURE.md** - Active work with full implementation details
- **FEATURES.md** - Completed, documented features

---

## 📝 Feature Request Template

When adding a new feature to this TODO, provide these **required** sections:

### Feature Name

**Overview** (Required)  
Brief description of what the feature does and why it's needed.

**Goals** (Required)

- What problems does this solve?
- What user needs does it address?

**E2E Tests** (Required)

- File: `tests/e2e/features/[name].feature`
- List expected Gherkin scenarios

_Note: Detailed planning (Architecture, Implementation Steps, Unit Tests, Edge Cases, Success Criteria) is done in CURRENT_FEATURE.md when you start working on the feature._

---

## 📊 Current Status

**Test Coverage**: `npm run test:unit` — 901 tests passing. `npm run test:e2e:prod` —
412 scenarios passing, 7 `@skip`ped (all in `section-rearrangement.feature`,
waiting on Grid Merge/Split below). 681 step definitions, all used
(`npm run check:steps`). Re-measured after the test tech-debt cleanup
(`docs/superpowers/plans/2026-09-27-test-tech-debt-cleanup.md`).  
**Documentation**: See [FEATURES.md](./FEATURES.md) for complete feature list

---

## 🚨 Must-Have (Technical Debt)

### Cucumber suite never exercises the Rule 9 device profiles

**Overview**
`tests/e2e/support/hooks.ts` launches one desktop Chromium context (default
1280×720) for every scenario. The Desktop Chrome / Pixel 5 / iPhone 12 / iPad
Pro projects in `playwright.config.ts` only apply to `playwright test`, which
runs no Gherkin. So Rule 9 ("features must work on all of them") is not
checked by the suite CI runs; only scenarios that call `setViewportSize`
themselves (e.g. `the viewport is {int} pixels wide`) see other widths. Found
when `character-display.feature`'s overflow outline exposed two layout bugs
(long names, attack badges at 320px) that no existing scenario had caught.

**Goals**

- Decide how Rule 9 is enforced: run the Cucumber suite once per device
  profile (a `DEVICE` env var read in `hooks.ts`, one CI job each), or tag
  the viewport-sensitive scenarios and run only those per profile
- Update `docs/rules/testing.md` to say which one it is
- Until then, `character-display.feature`'s no-sideways-scroll outline works
  around the gap by naming five widths explicitly (320, 390, 393, 1024, 1280)

### `a character exists with the following data:` ignores its table

**Overview**
`character-display.feature`'s Background passes a data table that
`character-display.steps.ts` discards; the scenarios pass only because the
default character happens to match. Wire it to `this.setup.character()` or
delete the Background.

### Tracked elsewhere

Open debt that has its own home, listed here so the backlog is complete. The
detail lives in the linked file.

- [RULE_VIOLATIONS.md](./RULE_VIOLATIONS.md) "Open": `@/` path aliases barely
  used, `any` usages with `no-explicit-any` only warning, files over 300 lines,
  swallowed storage write errors, `console.log` in `src/`, and the E2E import
  path bypassing the real sanitizer
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) "Not addressed":
  `beforeunload` flushing of the buffered version-history change needs a
  deliberate decision

---

## 🧹 Should-Have (Minor Debt)

Left over from the PR #9 review; none of these breaks a scenario today.

- **Long attack names at 320px.** An attack name with no spaces can still
  overflow the card at 320px, and when the damage/modifier badges wrap onto
  their own line they sit on the left instead of the right
- **Export capture is fragile.** `tests/e2e/support/exportCapture.ts` has no
  timeout of its own and swallows errors from the blob `fetch`, so a broken
  export surfaces as an unrelated wait timeout
- **Four ways to set the viewport.** `I am using a mobile device`,
  `I am using a phone-width viewport`, `I am using a tablet-width viewport` and
  `the viewport is {int} pixels wide` overlap; collapse them onto the last one
- **Dead weight in the overflow outline.** Its 600-character background adds
  nothing, because the textarea wraps internally

---

## 📋 Feature Backlog

### Grid Merge/Split & Import-Layout Conflict Prompt

**Overview**  
`CharacterSheet.mergeSections()`, `splitGrid()`, `updateLayout()` and `getLayout()`
are implemented and unit-tested in isolation, but have zero callers — `handleDrop`
only ever calls `reorderSections`. Separately, `fileStorage.ts` already computes
`layout` and a `hasLayoutDifference` flag on import, but `main.ts`'s
`handleLoadFromFile` reads only `character` and `warnings`, so the imported
layout is dropped. Decided: build this rather than delete the dead code — see
`docs/IMPLEMENTATION_PLAN.md` §3.1 (the original review, `PROJECT_REVIEW.md`
§2.7, was removed in `ad0f8b5` and is in git history).

**Goals**

- Let users create a new side-by-side grid pairing by dragging one section onto
  another (needs drop-position disambiguation in `handleDrop`/`handleDragOver`:
  centre of target = merge, edge = reorder, plus matching drop-zone CSS)
- Let users split an existing grid pairing back into two single-column sections
  by dragging one out of it
- Warn on import when the imported file's layout differs from the current one,
  offering "Keep current layout" / "Use imported layout" via a new prompt,
  wired to the existing `hasLayoutDifference` flag

**Implementation notes**

- The four `CharacterSheet` methods above already exist and persist correctly
  once called — the missing piece is gesture wiring and the import prompt
  component, not the underlying layout logic.
- Section drags are automatable: use `dragSectionTo` (mouse) or `TouchGesture`
  inside `withFullHeightViewport` (touch) from `tests/e2e/support/sections.ts`.
  `locator.dragTo()` fails when it has to scroll mid-drag — see
  `docs/superpowers/specs/2026-09-26-section-dnd-e2e-design.md`.

**E2E Tests**

- File: `tests/e2e/features/section-rearrangement.feature` (scenarios already
  written, currently `@skip`ped)
  - Merge sections into grid by dragging onto another section
  - Cannot merge non-eligible sections into grid
  - Split sections from grid by dragging out
  - Import with different layout shows prompt
  - Keep existing layout on import
  - Use imported layout on import
  - Import with same layout does not show prompt

### Edge Auto-Scroll for Touch Section Drags

**Overview**  
Touch long-press section dragging has no auto-scroll, so on a phone a section
can only be dropped onto a section that is already on screen.

**Goals**

- Scroll the page while a touch drag is held near the top/bottom edge of the
  viewport
- Cover it with an E2E scenario that drags between sections that aren't both
  on screen (don't use `withFullHeightViewport` for that one)

### Multiple Images

**Overview**  
Support multiple images per character including portrait, gear art, and reference images.

**Goals**

- Store multiple images for each character
- Switch between different character portraits
- Add reference images for equipment and abilities
- Manage image gallery per character

**E2E Tests**

- File: `tests/e2e/features/multiple-images.feature`
- Scenarios:
  - Upload multiple images for a character
  - Switch active portrait image
  - View image gallery
  - Delete images from gallery

### Game Reference Info Modals

**Overview**  
Add help modals with game reference information for character types, descriptors, foci, cyphers, artifacts, and oddities.

**Goals**

- Provide quick reference during character creation and playing
- Help new players understand game concepts
- Reduce need to consult rulebooks
- Critical Note: only refer publicly available information (wikis, other internet sources with stable links, they can be rendered in-modal ) and don't store this data in the app since it might breach IP rules!

**E2E Tests**

- File: `tests/e2e/features/reference-info-modals.feature`
- Scenarios:
  - Open character types info modal
  - View descriptor reference
  - Browse foci information
  - Search cypher reference
  - View artifact and oddity descriptions

### Character Sharing

**Overview**  
Share characters with other players via export links or shareable JSON.

**Goals**

- Generate shareable character link including the character data (without pictures)
- Export character for sharing
- Import shared character from others
- Preview shared character before importing

**E2E Tests**

- File: `tests/e2e/features/character-sharing.feature`
- Scenarios:
  - Generate shareable character link
  - Copy character JSON for sharing
  - Import character from shared link
  - Preview shared character

### PWA Support

**Overview**  
Add Progressive Web App support for installing the app and offline functionality.

**Goals**

- Enable app installation on devices
- Support offline character sheet access
- Cache character data locally
- Provide app-like experience

**E2E Tests**

- File: `tests/e2e/features/pwa-support.feature`
- Scenarios:
  - Install app on device
  - Access app while offline
  - Character data persists offline
  - Sync when coming back online

### Multiple Characters

**Overview**
Add the option to have multiple characters, switch between them and also store them in one file on export

### Import/Export Cards

**Overview**
Let the gamemaster prepare cards (cyphers, artifacts...) and export them as files by dragging them onto the desktop or the explorer/finder. Let players import them by dropping them into the character sheet (auto-detect type)

## 🔗 Related Documentation

- **[FEATURES.md](./FEATURES.md)** - Completed and documented features
- **[CURRENT_FEATURE.md](./CURRENT_FEATURE.md)** - Feature currently being implemented
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design decisions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment and hosting setup

---

**Last Updated**: October 3, 2026
