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

**Test Coverage**: `npm run test:unit` — 754 tests passing. `npm run test:e2e:prod` —
365 scenarios passing, 16 `@skip`ped (see below for why).  
**Documentation**: See [FEATURES.md](./FEATURES.md) for complete feature list

---

## 🚨 Must-Have (Technical Debt)

### Automated Drag/Drop E2E Tests

**Overview**  
Section reordering has drag/drop functionality that works but currently cannot be
reliably automated with Playwright. These two tests are marked with `@skip` and
require manual testing until a solution is found.

**Goals**

- Find a reliable way to automate HTML5 drag and drop events in Playwright
- Implement automated tests for both scenarios below
- Remove `@skip` tags once tests are reliable

**Skipped Tests** (see `tests/e2e/features/section-rearrangement.feature`)

- Reorder sections by dragging
- Section dragging works on mobile with long-tap

**Research Needed**

- Playwright's `dragTo()` method behavior with HTML5 drag events
- Alternative approaches: programmatic drag simulation, custom data transfer
- Consider if drag/drop should use a different library (sortable.js, drag-drop libraries)

> The other 7 `@skip`ped scenarios in that file (grid merge/split, import-layout
> prompt) are **not** blocked by this — they were previously misattributed here.
> The underlying features were never wired up at all; see "Grid Merge/Split &
> Import-Layout Conflict Prompt" below.

---

## 📋 Feature Backlog

### Grid Merge/Split & Import-Layout Conflict Prompt

**Overview**  
`CharacterSheet.mergeSections()`, `splitGrid()`, `updateLayout()` and `getLayout()`
are implemented and unit-tested in isolation, but have zero callers — `handleDrop`
only ever calls `reorderSections`. Separately, `fileStorage.ts` already computes a
`hasLayoutDifference` flag on import that `main.ts`'s `handleLoadFromFile` reads
but discards. Decided: build this rather than delete the dead code — see
`docs/PROJECT_REVIEW.md` §2.7 for the original defect writeup.

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
- This project has a known, unresolved Playwright limitation automating HTML5
  drag/drop (see "Automated Drag/Drop E2E Tests" above). The merge/split
  scenarios below will likely hit the same wall — plan for `@skip` and manual
  verification unless that's solved first.

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

**Last Updated**: August 1, 2026
