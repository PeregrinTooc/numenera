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

_(None yet - project initialization in progress)_

## Planned Features

### Phase 1: MVP (Current)

- [ ] **Responsive Layout**: Mobile-first design, tablet and smartphone support
- [ ] **Single Character Display**: View and edit one character's information
- [ ] **Character Data Management**:
  - [ ] Name, tier, type, descriptor, focus
  - [ ] Stats (Might, Speed, Intellect with pool/edge/current)
  - [ ] Background, notes, equipment, abilities
- [ ] **Image Upload**: Single character portrait
- [ ] **Local Storage**: Persist character data in browser
- [ ] **i18n Infrastructure**: English for development, German translation support
- [ ] **Export/Import**: JSON format for character data

### Phase 2: Enhanced Features

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
- [ ] **Reference Database**: German language game data

### Phase 4: Cloud Integration

- [ ] **Cloud Storage Adapters**:
  - [ ] OneDrive integration
  - [ ] Google Drive integration
  - [ ] Dropbox integration
  - [ ] iCloud integration (limited browser support)
- [ ] **Auto-sync**: Automatic synchronization with cloud storage
- [ ] **Conflict Resolution**: Handle sync conflicts
- [ ] **Offline Support**: Queue changes when offline

### Phase 5: Advanced Features

- [ ] **Character Creation Wizard**: Guided character creation
- [ ] **Advanced Abilities Tracking**: Detailed abilities management
- [ ] **Equipment Management**: Enhanced equipment tracking
- [ ] **PDF Export**: Printable character sheets
- [ ] **Search & Filter**: Find characters quickly
- [ ] **Dark Mode**: Theme support

## Technical Debt & Improvements

_(Items to address as we progress)_

## Known Issues

_(Issues discovered during development)_

## Future Considerations

- Multiple language support beyond German/English
- Character sharing/collaboration
- Campaign management
- Dice roller integration
- Character templates
