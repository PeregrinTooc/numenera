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

## 🚨 Must-Have (Technical Debt)

None open.

---

## 📋 Feature Backlog

### Visual Regression Tests for Component Styling

**Overview**  
The per-type card themes (cyphers blue, artifacts gold, …) are not guarded by
any test: the class-only `visualStyling` unit tests were removed because they
checked template class names, not the look. Needs its own design (Rule 2).

**Findings so far**

- Byte-equal screenshots are too brittle: font rasterising, compositing and
  browser versions differ between Windows dev machines and Linux CI. Use a pixel
  diff (`pixelmatch`) with a small tolerance instead.
- Generate and compare baselines in one pinned environment (the official
  Playwright Docker image, locally and in CI), one baseline per device profile.
- Screenshot single components (`locator.screenshot()`), not whole pages.
- Playwright's `toHaveScreenshot` needs its own test runner; our E2E runs
  Cucumber on the Playwright library, so the comparison and baseline store are
  ours to write.

### E2E: Vite Re-optimises Dependencies Mid-Run

The first dev-mode E2E run after a commit that adds a new bare import (e.g.
`lit-html/directives/if-defined.js`) can fail a few scenarios in the Before hook
with "Execution context was destroyed": Vite discovers the dependency on first
request, re-optimises and reloads the page. Starting the server in
`scripts/e2e.js` with `optimizeDeps: { force: true }` scans imports up front at
the cost of a few seconds per run. CI runs the production build and is not
affected.

### Section Columns and Frames Follow-ups

Open points from the section columns and frames work (spec:
`docs/superpowers/specs/2026-11-03-section-columns-and-frames-design.md`).

- **Ability-card badge rows overflow their card on phones (needs a design
  decision).** The frame every section now has takes ~52 px of width; with the
  cards unchanged (a spec non-goal), badge rows such as "Kosten: 2 |
  Geschwindigkeit" stick out of the card: +17/+26 px at 390 px (iPhone 12),
  +14/+23 px at 393 px (Pixel 5), +47/+56 px at 360 px (none before the frame
  at 390/393). A 1rem phone frame padding only reduces it. Options: let the
  card's badge row wrap (lifts the "cards unchanged" non-goal), a much thinner
  phone frame, or accept it.
- **One unknown id drops every stored column choice.** `isValidSectionColumns`
  rejects the whole map, so a future card section would wipe all choices on a
  downgrade or in an older app reading a new export. Keep the known, valid
  entries instead.
- **Own warning for invalid imported column choices.** They reuse
  `fileOperations.invalidLayout` ("…Using current layout."), which misleads when
  the layout itself was fine. Add a key in `en.json` and `de.json`.
- **`IFileStorage.ts` duplicates `ImportResult`** without `layout` and
  `sectionColumns`; make it the one definition.
- **Comparison view ignores a section's column choice.** It always allows two
  columns where the pane is wide.
- **Two-column threshold has little slack.** Just above 40rem, two Ability
  cards are ~288 px wide with ~5 px to spare; ~42rem would give more room if
  card content grows.

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
