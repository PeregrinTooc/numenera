# Numenera Character Sheet - Features

This document tracks all implemented and planned features for the Numenera Character Sheet application.

## ✅ Implemented Features

All features listed below have full BDD test coverage and are verified working.

### Core Character Management

#### Character Display & Storage

- **Character Display** ([character-display.feature](../tests/e2e/features/character-display.feature))
  - Display character name, descriptor, type, and focus
  - Show all character stats and pools
  - Display character portrait
- **Character Storage** ([character-storage.feature](../tests/e2e/features/character-storage.feature))
  - Save character data to localStorage
  - Load character data on page refresh
  - Persist all character changes

- **Character DOM Structure** ([character-dom.feature](../tests/e2e/features/character-dom.feature))
  - Semantic HTML structure
  - Accessible component hierarchy
  - Proper data-testid attributes for testing

#### Basic Information Editing

- **Basic Info Editing** ([basic-info-editing.feature](../tests/e2e/features/basic-info-editing.feature))
  - Edit character name, descriptor, type, focus
  - Edit tier, effort, XP, shins
  - Inline editing with validation

- **Additional Fields Editing** ([additional-fields-editing.feature](../tests/e2e/features/additional-fields-editing.feature))
  - Edit character type via dropdown (Nano, Glaive, Jack)
  - Edit background field (multi-line text)
  - Edit notes field (multi-line text)
  - Inline editing for text areas

- **Empty Fields Visibility** ([empty-fields-visibility.feature](../tests/e2e/features/empty-fields-visibility.feature))
  - Hide empty sections when no data
  - Show sections when data is added
  - Clean UI for new characters

#### Stats & Resources

- **Stat Pool Editing** ([stat-pool-editing.feature](../tests/e2e/features/stat-pool-editing.feature))
  - Edit Might, Speed, Intellect pools
  - Track current and maximum values
  - Visual indicators for pool status

- **Resource Tracker Editing** ([resource-tracker-editing.feature](../tests/e2e/features/resource-tracker-editing.feature))
  - Edit XP (Experience Points)
  - Edit Shins (currency)
  - Edit Armor value
  - Edit Effort

- **Stats Visual Styling** ([stats-visual-styling.feature](../tests/e2e/features/stats-visual-styling.feature))
  - Consistent stat display styling
  - Pool indicators with color coding
  - Responsive stat layout

#### Abilities & Enhancements

- **Ability Enhancements** ([ability-enhancements.feature](../tests/e2e/features/ability-enhancements.feature))
  - Ability cost badges (pool cost display)
  - Pool type indicators (Might, Speed, Intellect)
  - Action type display (Action, Enabler, etc.)

### Combat & Special Features

- **Combat System** ([combat.feature](../tests/e2e/features/combat.feature))
  - Attacks management (damage, modifier, range, notes)
  - Attack card creation and editing
  - Armor badge in attacks section
  - Full CRUD operations for attacks

- **Recovery & Damage Tracking** ([recovery-damage-track.feature](../tests/e2e/features/recovery-damage-track.feature))
  - Recovery Rolls tracker (Action, 10 min, 1 hour, 10 hours)
  - Editable recovery modifier (1d6 + modifier)
  - Damage Track (Healthy, Impaired, Debilitated)
  - Green healing theme for recovery
  - Red warning theme for damage
  - Radio buttons for damage status
  - Checkboxes for recovery roll usage

### Card-Based Items

- **Card Creation** ([card-creation.feature](../tests/e2e/features/card-creation.feature))
  - Create Cyphers, Equipment, Artifacts, Oddities
  - Create Special Abilities
  - Modal-based card editor
  - Form validation

- **Card Deletion** ([card-deletion.feature](../tests/e2e/features/card-deletion.feature))
  - Delete any card type
  - Confirmation dialogs
  - Data persistence after deletion

- **Card Modal Focus Trap** ([card-modal-focus-trap.feature](../tests/e2e/features/card-modal-focus-trap.feature))
  - Tab key cycles through modal inputs
  - Shift+Tab reverse cycling
  - Focus trapped within modal
  - Escape key closes modal
  - Accessibility compliance

### Visual Styling

- **Equipment Visual Styling** ([equipment-visual-styling.feature](../tests/e2e/features/equipment-visual-styling.feature))
  - Consistent card styling for equipment
  - Hover states and interactions
  - Responsive card layout

- **Items Visual Styling** ([items-visual-styling.feature](../tests/e2e/features/items-visual-styling.feature))
  - Unified styling for Artifacts, Oddities
  - Visual consistency across item types

- **Text Fields Visual Styling** ([text-fields-visual-styling.feature](../tests/e2e/features/text-fields-visual-styling.feature))
  - Consistent text field appearance
  - Edit state indicators
  - Focus and hover states

### File Management

- **Character File Export** ([character-file-export.feature](../tests/e2e/features/character-file-export.feature))
  - Export character as JSON file
  - "Save As..." functionality
  - Browser download dialog

- **Character File Import** ([character-file-import.feature](../tests/e2e/features/character-file-import.feature))
  - Import character from JSON file
  - Data validation on import
  - Replace current character data

### Cloud Storage Integration

- **Phase 1: Export Enhancement** ([cloud-storage-phase1-export.feature](../tests/e2e/features/cloud-storage-phase1-export.feature))
  - File System Access API detection
  - Quick Export button (when API available)
  - "Save As..." renamed from "Export"
  - File handle persistence
  - Graceful degradation for unsupported browsers

- **Phase 2: Auto-Save & Timestamp** ([cloud-storage-phase2-autosave.feature](../tests/e2e/features/cloud-storage-phase2-autosave.feature))
  - Debounced auto-save (300ms after edits)
  - Save indicator component (lower-right corner)
  - Timestamp display on save
  - Subtle, non-intrusive styling

- **IndexedDB Storage** ([cloud-storage-phase4-indexeddb.feature](../tests/e2e/features/cloud-storage-phase4-indexeddb.feature))
  - IndexedDB primary storage
  - localStorage fallback
  - Data migration from localStorage
  - Browser sync capability
  - Persistence across browser restarts

### Internationalization

- **i18n Support** ([i18n.feature](../tests/e2e/features/i18n.feature))
  - English language (development)
  - German language (production)
  - Runtime language switching
  - Translated UI labels and messages
  - Localized date/time formats

---

## Related Documentation

- [TODO.md](./TODO.md) - Development roadmap and planned features
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design decisions
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment and hosting setup

---

**Last Updated**: January 30, 2026
