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

### Remaining English text (found while translating labels, 2026-10-31)

Left out of `fix(i18n): translate hardcoded labels and text` because each needs a
decision first:

- **Version-history descriptions are stored as English data.** `"Initial state"`
  (`src/app/bootstrap.ts`), `"Imported character"` (`src/app/fileActions.ts`),
  the `"Changed name"`-style strings in `characterFieldUpdate.ts`, and
  `LEGACY_DESCRIPTION = "Updated character"` in
  `src/services/versionDescriptionMigration.ts`. `versionHistory.*` description
  keys already exist in both locales. Translating these means storing a key (or
  translating at render time) and migrating versions already saved.
- **File-picker type label.** `"Numenera Character Files"` in
  `src/storage/exportManager.ts` and `src/storage/fileStorage.ts` shows in the
  OS open/save dialog. It's user-visible, so it probably belongs in `t()`.
- **English text nobody renders.** `SECTION_DISPLAY_NAMES` in
  `src/types/layout.ts` is only used as the key set behind `isSectionId` (the UI
  uses `layout.sections.*`), and the `errors.push(...)` strings in
  `characterValidation.ts` are never shown. Replace them with a plain id list
  and drop or key the strings rather than translating dead text.
- **German game terms to confirm.** `de.json` keeps "Cypher", "Edge", "Pool"
  and "Shins". The new keys use "EINMALIG" (ONE-USE) and "Deskriptor". Decide
  whether to use the German rulebook's terms (e.g. "Chiffre", "Vorteil")
  consistently instead.

---

## 📋 Feature Backlog

### Import-Layout Conflict Prompt

**Overview**  
`fileStorage.ts` already computes `layout` and a `hasLayoutDifference` flag on
import, but `handleLoadFromFile` in `src/app/fileActions.ts` reads only
`character` and `warnings`, so the imported layout is dropped. Split out of
"Grid Merge/Split & Import-Layout Conflict Prompt"; the drag half is in
`CURRENT_FEATURE.md`. Needs its own design before building.

**Goals**

- Warn on import when the imported file's layout differs from the current one,
  offering "Keep current layout" / "Use imported layout" via a new prompt,
  wired to the existing `hasLayoutDifference` flag

**E2E Tests**

- File: `tests/e2e/features/section-rearrangement.feature` (scenarios already
  written, currently `@skip`ped)
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
