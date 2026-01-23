# TODO - Numenera Character Sheet

## Critical for Production

### Data Management

- [ ] **Character Export/Import** - Allow users to backup and restore character data
  - Export to JSON file
  - Import from JSON file
  - Prevents data loss during schema changes
- [ ] **Data Validation** - Validate imported/loaded character data
  - Type checking
  - Required fields validation
  - Graceful error handling

### User Experience

- [ ] **Error Boundaries** - Catch and display errors gracefully
- [ ] **Loading States** - Show feedback during operations
- [ ] **User Notifications** - Toast/banner for schema version changes

## Phase 5: Editing & Persistence (In Progress)

### Basic Info Editing (Current)

- [ ] Make name, tier, descriptor, focus editable (modal-based)
- [x] EditFieldModal component with validation
- [x] Numenera-themed styling (gold/crimson buttons)
- [x] Keyboard support (Enter/Escape)
- [x] Touch-friendly mobile design
- [x] i18n support (EN/DE)
- [ ] Wire up to character data
- [ ] Auto-save to localStorage on confirm

### Future Editing Features

- [ ] Make all other fields editable (stats, abilities, etc.)
- [ ] Inline editing for simple text fields
- [ ] Confirmation dialogs for destructive actions

### Performance Notes

- **Portrait Images**: When portrait upload is implemented, use keyed elements or CSS backgrounds to prevent image reload on text edits. See implementation notes for details on caching strategies.

## Phase 1: MVP Features (Incomplete)

### Responsive Layout

- [ ] Mobile-first design implementation
- [ ] Mobile viewport (320px): Vertical stacking
- [ ] Tablet viewport (768px): Optimized arrangement
- [ ] Desktop viewport (1280px): Multi-column layout

### Core Features

- [ ] Character Editing: Editable form fields
- [ ] Image Upload: Single character portrait
- [ ] i18n Infrastructure: English for development, German translation support

## Phase 2: Enhanced Features

### UI Enhancements

- [ ] Re-arrange sections: Let users arrange the sheet's sections
- [ ] Multiple Characters: Manage and switch between multiple characters
- [ ] Character List View: Overview of all characters
- [ ] Multiple Images: Support for multiple images per character
- [ ] Image Gallery: View and manage character images

## Phase 3: Reference Data & Modals

### Info Modals

- [ ] Character Types info (Glaive, Nano, Jack)
- [ ] Descriptors info
- [ ] Foci info
- [ ] Cyphers info
- [ ] Artifacts info
- [ ] Oddities/Curiosities info

## Phase 4: Cloud Integration

### Cloud Storage

- [ ] OneDrive integration
- [ ] Google Drive integration
- [ ] Dropbox integration
- [ ] iCloud integration (limited browser support)
- [ ] Auto-sync: Automatic synchronization with cloud storage
- [ ] Conflict Resolution: Handle sync conflicts
- [ ] Offline Support: Queue changes when offline

## Future Enhancements

### Features

- [ ] Multiple character slots/profiles
- [ ] Cloud sync (optional)
- [ ] Print-friendly view/PDF export
- [ ] Character portrait upload
- [ ] Dice roller integration
- [ ] Session notes/log
- [ ] Multiple language support beyond German/English
- [ ] Character sharing/collaboration
- [ ] Campaign management
- [ ] Character templates

### Technical

- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality
- [ ] Performance optimization for large character sheets
- [ ] Accessibility audit (WCAG compliance)

## Known Issues

- None currently

---

## Completed Features

### Phase 1: Core Stats & Resources ✅

- [x] XP tracking
- [x] Shins (currency) tracking
- [x] Armor value display
- [x] Effort tracking

### Phase 2: Ability Enhancements ✅

- [x] Ability cost badges
- [x] Pool type indicators
- [x] Action type display

### Phase 3: Combat & Special Abilities ✅

- [x] Attacks system (damage, modifier, range, notes)
- [x] Special Abilities (description, source)
- [x] Armor badge in attacks section
- [x] Schema versioning system

### Phase 4: Recovery Rolls & Damage Tracking ✅

- [x] Recovery Rolls tracker (action, 10 min, 1 hour, 10 hours)
- [x] Editable recovery modifier (1d6 + modifier)
- [x] Damage Track (healthy, impaired, debilitated)
- [x] Green healing theme for recovery rolls
- [x] Red warning theme for damage track
- [x] Radio buttons for damage status
- [x] Checkboxes for recovery roll usage
- [x] Bilingual support (English/German)

---

**Last Updated:** Phase 4 Complete (January 2026)
