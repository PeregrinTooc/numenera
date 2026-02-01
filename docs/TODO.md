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

**Implemented Features**: 24 fully tested features  
**Test Coverage**: 323 unit tests + 317 E2E scenarios (2090 steps) - 100% passing  
**Documentation**: See [FEATURES.md](./FEATURES.md) for complete feature list

---

## 📋 Feature Backlog

### Data Validation Enhancement

**Overview**  
Strengthen validation for imported and loaded character data to prevent corrupt data and improve error recovery.

**Goals**

- Prevent invalid character data from being loaded
- Provide clear error messages when data is corrupt
- Enable graceful schema migration for format changes
- Improve user experience when importing characters

**E2E Tests**

- File: `tests/e2e/features/data-validation.feature`
- Scenarios:
  - Import character with invalid data shows error
  - Import character with missing required fields
  - Import character with wrong data types
  - Migrate character from old schema version

### Re-arrange Sections

**Overview**  
Allow users to drag and drop character sheet sections to customize their layout preferences.

**Goals**

- Personalize character sheet layout
- Save custom layout preferences
- Support different play styles and preferences
- Make frequently-used sections easily accessible

**E2E Tests**

- File: `tests/e2e/features/section-rearrangement.feature`
- Scenarios:
  - Drag section to new position
  - Section order is saved
  - Layout persists after page reload
  - Reset to default layout option

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

### Print-Friendly View

**Overview**  
Add print-optimized view and PDF export for printing physical character sheets.

**Goals**

- Generate print-friendly character sheet layout
- Export character sheet as PDF
- Support printer-friendly styling
- Include all character information

**E2E Tests**

- File: `tests/e2e/features/print-export.feature`
- Scenarios:
  - View print-friendly layout
  - Export character sheet as PDF
  - Print character sheet maintains formatting
  - All character data included in printout

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

## 🔗 Related Documentation

- **[FEATURES.md](./FEATURES.md)** - Completed and documented features
- **[CURRENT_FEATURE.md](./CURRENT_FEATURE.md)** - Feature currently being implemented
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design decisions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment and hosting setup

---

**Last Updated**: January 30, 2026
