# Current Feature Implementation

> **Workflow:** This file contains the feature currently being implemented. When complete, move the feature to FEATURES.md and delete this file.

---

## Version History (Character Time Travel)

### Overview

Implement a version history system that stores the last 99 character edits in IndexedDB, allowing users to navigate through previous versions using arrow buttons and restore any version.

### Goals

- Provide undo/redo functionality through version navigation
- Auto-generate meaningful descriptions of what changed
- Store up to 99 versions efficiently
- Enable "time travel" through character editing history
- Allow restoration of any previous version

### E2E Tests

- File: `tests/e2e/features/version-history.feature`
- Scenarios:
  - Saving version on character edit
  - Navigating backward through versions
  - Restoring an old version
  - Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)

---

## Detailed Implementation Plan

### Architecture

Documentation: [VERSION_HISTORY_PLAN.md](./VERSION_HISTORY_PLAN.md)

**Data Structures:**

```typescript
// src/types/versionHistory.ts
export interface CharacterVersion {
  id: string; // UUID for this version
  character: Character; // Full character snapshot
  timestamp: number; // Unix timestamp (milliseconds)
  description: string; // Auto-generated change description
  userId?: string; // For future multi-user support
}

export interface VersionHistoryState {
  versions: CharacterVersion[]; // Array of versions (max 99)
  currentIndex: number; // Current position in history (0-based)
  isNavigating: boolean; // True when viewing old version (read-only)
}
```

**Storage:**

- IndexedDB primary storage
- Store last 99 versions (~850KB total)
- Debounced saves (2 seconds after edit)
- FIFO queue when exceeding limit

### Implementation Steps

**Step 1: Core Version History Manager**

- File: `src/storage/versionHistory.ts`
- Create VersionHistoryManager class
- Implement save/restore/navigate methods
- Debounce saves to prevent spam
- Deep clone characters to prevent reference bugs

**Step 2: Change Detection Algorithm**

- File: `src/utils/changeDetection.ts`
- Auto-generate change descriptions
- Priority: name changes, stat changes, collection changes, field edits
- Handle multiple simultaneous changes

**Step 3: Version Navigator Component**

- File: `src/components/VersionNavigator.ts`
- Create UI with back/forward buttons
- Display version counter and timestamp
- Show change description
- Add warning banner for read-only mode

**Step 4: Read-Only Mode**

- File: `src/utils/readOnlyMode.ts`
- Disable all inputs when viewing old version
- Add visual indicator overlay
- Re-enable when returning to latest

**Step 5: Keyboard Shortcuts**

- File: `src/utils/keyboardShortcuts.ts`
- Ctrl+Z / Cmd+Z for undo
- Ctrl+Shift+Z / Cmd+Shift+Z for redo
- Escape to return to latest version

**Step 6: CharacterSheet Integration**

- File: `src/components/CharacterSheet.ts`
- Initialize version history manager
- Add version navigator to header
- Hook up character-changed events

**Step 7: Styling**

- File: `src/styles/components/version-navigator.css`
- Style version navigator component
- Style read-only mode overlay
- Add warning banner styling

### Unit Tests

Key test scenarios:

- Save new version when character changes
- Generate correct change descriptions
- Limit to 99 versions (FIFO)
- Remove oldest when exceeding limit
- Debounce rapid changes
- Navigate back/forward through versions
- Disable buttons at boundaries
- Discard forward history when editing old version
- Detect various types of changes (name, stats, collections, fields)

### Edge Cases to Handle

1. Empty history - show "No version history" message
2. Single version - disable navigation buttons
3. Rapid edits - debounce to avoid version spam
4. Large characters - monitor storage, warn if approaching limits
5. Browser refresh - persist currentIndex, restore on reload
6. Concurrent tabs - handle conflicts (last-write-wins)
7. Export/Import - option to include/exclude version history
8. Clear all data - prompt to confirm clearing version history

### Success Criteria

- [ ] Can navigate through 99 versions smoothly
- [ ] Change descriptions are accurate and helpful
- [ ] Read-only mode prevents edits on old versions
- [ ] Keyboard shortcuts work (Ctrl+Z, Ctrl+Shift+Z, Escape)
- [ ] Restoring a version works correctly
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No regressions in existing features
- [ ] Feature documented in FEATURES.md
- [ ] This file deleted
- [ ] VERSION_HISTORY_PLAN.md deleted (optional - can keep as reference)

---

## Implementation Notes

_Add notes, discoveries, and decisions as you work..._
