# Features & Functions

## Project Overview

Numenera Character Sheet - A responsive web application for managing Numenera P&P RPG characters with cloud sync capabilities.

## Development Principles

- **BDD/TDD Approach**: Each feature starts with an acceptance test
- **Step-by-step Implementation**: Features implemented incrementally
- **Unit Tests**: Written and passing one at a time
- **Git Workflow**: Each working feature is committed and pushed
- **Quality Gates**: Husky enforces formatting and tests before commit/push

## Implemented Features

### ✅ Character Storage and State Management (Complete)

- **Local Storage Persistence**: Character data saved automatically in browser localStorage
- **Load/Clear Controls**: Buttons to load full character data or clear to empty state
- **State Priority System**: URL parameters > localStorage > default character
- **Test Coverage**: 4/4 storage scenarios passing
  - Load button functionality
  - Clear button functionality
  - Full character state persistence across page reloads
  - Empty state persistence across page reloads

### ✅ Character Display (Complete)

- **Basic Information Display**: Name, tier, type, descriptor, focus
- **Stat Pools**: Might, Speed, Intellect with pool/edge/current values
- **Items Display**: Cyphers, artifacts, oddities with proper empty states
- **Text Fields**: Background, notes, equipment, abilities
- **Test Coverage**: 7/7 display scenarios passing

### ✅ DOM Testing Infrastructure (Complete)

- **data-testid Attributes**: Semantic test identifiers on all key UI elements
- **DOMHelpers Utility**: Type-safe helper class for DOM queries and assertions
  - `getByTestId()`: Locate elements by test ID
  - `hasClass()`: Check CSS classes
  - `isVisible()/isHidden()`: Visibility checks
  - `count()`: Count elements by pattern
  - `getComputedStyle()`: CSS property inspection
- **DOM Structure Tests**: 8 scenarios verifying DOM structure
  - Essential testid attributes
  - Basic info field structure
  - Stat pool DOM structure
  - Items section structure
  - Text field containers
  - Empty state markers
  - Item collections
  - Button elements
- **Test Coverage**: 19/19 total scenarios (109 steps) passing
  - 7 character display scenarios
  - 4 character storage scenarios
  - 8 DOM structure scenarios

## Planned Features

### Phase 1: MVP (Current)

- [ ] **Responsive Layout**: Mobile-first design, tablet and smartphone support
  - [ ] Mobile viewport (320px): Vertical stacking
  - [ ] Tablet viewport (768px): Optimized arrangement
  - [ ] Desktop viewport (1280px): Multi-column layout
- [x] **Single Character Display**: View character information ✅
- [x] **Character Data Management**: ✅
  - [x] Name, tier, type, descriptor, focus ✅
  - [x] Stats (Might, Speed, Intellect with pool/edge/current) ✅
  - [x] Background, notes, equipment, abilities ✅
- [ ] **Character Editing**: Editable form fields
- [ ] **Image Upload**: Single character portrait
- [x] **Local Storage**: Persist character data in browser ✅
- [ ] **i18n Infrastructure**: English for development, German translation support
- [ ] **Export/Import**: JSON format for character data

### Phase 2: Enhanced Features

- [ ] **Re-arrange sections**: Let users arrange the sheet's sections
- [ ] **Multiple Characters**: Manage and switch between multiple characters
- [ ] **Character List View**: Overview of all characters
- [ ] **Multiple Images**: Support for multiple images per character
- [ ] **Image Gallery**: View and manage character images

### Phase 3: Reference Data & Modals

- [ ] **Info Modals**: Display detailed information for:
  - [ ] Character Types (Glaive, Nano, Jack)
  - [ ] Descriptors
  - [ ] Foci
  - [ ] Cyphers
  - [ ] Artifacts
  - [ ] Oddities/Curiosities

### Phase 4: Cloud Integration

- [ ] **Cloud Storage Adapters**:
  - [ ] OneDrive integration
  - [ ] Google Drive integration
  - [ ] Dropbox integration
  - [ ] iCloud integration (limited browser support)
- [ ] **Auto-sync**: Automatic synchronization with cloud storage
- [ ] **Conflict Resolution**: Handle sync conflicts
- [ ] **Offline Support**: Queue changes when offline

## Future Considerations

- Multiple language support beyond German/English
- Character sharing/collaboration
- Campaign management
- Dice roller integration
- Character templates
