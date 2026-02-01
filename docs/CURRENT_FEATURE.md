# Current Feature Implementation

> **Workflow:** This file contains the feature currently being implemented. When complete, move the feature to FEATURES.md and delete this file.

---

## Version History (Character Time Travel)

### Overview

Implement a version history system that stores the last 99 character edits in IndexedDB, allowing users to navigate through previous versions using arrow buttons and restore any version. Features smart squashing of recent changes and context-aware undo/redo shortcuts.

### Goals

- Provide intelligent undo/redo functionality through version navigation
- Auto-generate concise descriptions of what changed
- Store up to 99 versions efficiently (images excluded from versioning)
- Enable "time travel" through character editing history
- Allow restoration of any previous version
- Smart squashing: compress rapid edits after 5 seconds of inactivity
- Handle multi-tab editing conflicts with etag approach

### E2E Tests

- File: `tests/e2e/features/version-history.feature`
- Scenarios:
  - Saving version on character edit
  - Navigating backward/forward through versions
  - Restoring an old version
  - Smart squashing after inactivity
  - Keyboard shortcuts (Ctrl+Z, Ctrl+Y before squash; opens UI after squash)
  - Multi-tab conflict detection
  - Export from read-only view

---

## Detailed Implementation Plan

### Architecture

**Core Concepts:**

1. **Version Storage:** Each edit creates a new version in IndexedDB (images excluded)
2. **Smart Squashing:** After 5 seconds of inactivity, recent versions merge into single entry
3. **Context-Aware Shortcuts:** Ctrl+Z/Y navigate granular changes before squash, open UI after
4. **ETag Conflicts:** Hash-based conflict detection for multi-tab editing
5. **Read-Only Mode:** Viewing old versions disables editing; must restore to edit

**Data Structures:**

```typescript
// src/types/versionHistory.ts
export interface CharacterVersion {
  id: string; // UUID for this version
  character: Character; // Full character snapshot (excluding portrait)
  timestamp: number; // Unix timestamp (milliseconds)
  description: string; // Auto-generated change description
  etag: string; // SHA-256 hash for conflict detection
  isSquashed?: boolean; // True if this is a squashed version
  squashedCount?: number; // Number of versions that were squashed
}

export interface VersionHistoryState {
  versions: CharacterVersion[]; // Array of versions (max 99)
  currentIndex: number; // Current position in history (-1 = latest)
  isNavigating: boolean; // True when viewing old version (read-only)
  unsquashedVersions: CharacterVersion[]; // Temporary storage before squash
  squashTimer: number | null; // Timer ID for squash operation
}
```

**Storage Strategy:**

- IndexedDB primary storage (separate object store for version history)
- Store last 99 versions using FIFO queue
- Images excluded from versions (reference current character portrait only)
- Each version ~1-2KB (without images), total ~100-200KB max
- Design allows future addition of image diff storage

**Smart Squashing Algorithm:**

```
Timeline:
  0s: Edit → Create version, start 5-second timer
  1s: Edit → Create version, reset timer
  2s: Edit → Create version, reset timer
  --- 5 seconds pass with no edits ---
  7s: Auto-squash → Merge recent versions into single entry
  8s: New edit → Create new version

Timer resets on:
  - Opening edit modal
  - Keyboard activity in modals/inputs
  - Confirming or aborting changes

Timer cancels on:
  - Ctrl+Z or Ctrl+Y (user wants granular navigation)
  - Navigating to old version
```

### Incremental Implementation Plan (TDD/BDD)

This plan breaks the feature into 7 phases. Each phase follows strict TDD/BDD methodology:

- **TDD (Test-Driven Development)**: Write failing unit tests first, implement minimal code to pass, refactor
- **BDD (Behavior-Driven Development)**: Write E2E tests in Gherkin format before implementation for user-facing features

---

#### **Phase 1: Core Version Storage**

**Duration:** ~2-3 hours  
**Methodology:** Strict TDD (unit tests only, no user interaction)  
**Deliverable:** Basic version storage without UI

**TDD Workflow:**

1. Write failing unit tests for VersionHistoryManager
2. Implement minimal code to pass tests
3. Refactor for clean design
4. Repeat for ETag generator
5. Integration tests for StorageFactory

**Implementation Steps:**

**Step 1.1: Type Definitions**

- File: `src/types/versionHistory.ts`
- Define CharacterVersion and VersionHistoryState interfaces
- No tests needed (type definitions)

**Step 1.2: Version History Manager (TDD)**

- File: `tests/unit/versionHistory.test.ts` → Write failing tests first
- File: `src/storage/versionHistory.ts` → Implement to pass tests
- Tests cover:
  - Creating new versions (excluding portrait)
  - Saving to IndexedDB separate object store
  - Loading versions from storage
  - FIFO queue (max 99 versions)
  - Deep cloning prevents reference bugs
  - Clear all versions

**Step 1.3: ETag Generator (TDD)**

- File: `tests/unit/etag.test.ts` → Write failing tests first
- File: `src/utils/etag.ts` → Implement to pass tests
- Tests cover:
  - Generate SHA-256 hash from character data
  - Exclude portrait from hash
  - Same input produces same hash
  - Different inputs produce different hashes

**Step 1.4: Storage Factory Integration (TDD)**

- File: `tests/unit/storageFactory.test.ts` → Update with version history tests
- File: `src/storage/storageFactory.ts` → Add version history initialization
- Tests cover:
  - VersionHistoryManager initialized alongside character storage
  - Availability checks work correctly
  - Factory exposes version history methods

**Acceptance Criteria:**

- [ ] All unit tests pass
- [ ] Can save/load versions programmatically
- [ ] Portrait excluded from versions
- [ ] FIFO queue works correctly

---

#### **Phase 2: Change Detection**

**Duration:** ~2 hours  
**Methodology:** Strict TDD (unit tests only)  
**Deliverable:** Accurate change descriptions for all edit types

**TDD Workflow:**

1. Write comprehensive failing tests for all change types
2. Implement change detection algorithm
3. Refactor for maintainability

**Implementation Steps:**

**Step 2.1: Change Detection Algorithm (TDD)**

- File: `tests/unit/changeDetection.test.ts` → Write failing tests first
- File: `src/utils/changeDetection.ts` → Implement to pass tests
- Tests cover:
  - Detect basic info changes (name, tier, type, descriptor, focus)
  - Detect stat pool changes (might, speed, intellect)
  - Detect collection changes (cyphers, equipment, attacks, abilities)
  - Detect text field changes (background, notes)
  - Handle multiple simultaneous changes
  - Generate concise descriptions
  - Priority ordering (name > stats > collections > fields)

**Step 2.2: Squash Description Generator (TDD)**

- File: `tests/unit/squashDescriptions.test.ts` → Write failing tests first
- File: `src/utils/squashDescriptions.ts` → Implement to pass tests
- Tests cover:
  - Combine multiple change descriptions
  - Limit to max 3 changes in description
  - Priority ordering applied correctly
  - Format: "Edited basic info, Updated stats, Modified equipment"

**Acceptance Criteria:**

- [ ] All unit tests pass
- [ ] All change types detected correctly
- [ ] Descriptions are concise and accurate
- [ ] Priority ordering works

---

#### **Phase 3: Version Navigator UI**

**Duration:** ~3-4 hours  
**Methodology:** BDD (E2E tests first) + TDD (unit tests)  
**Deliverable:** Working navigation UI with read-only mode

**BDD Workflow:**

1. Write E2E scenarios in Gherkin (version-history.feature)
2. Run scenarios (all fail - RED)
3. Implement components using TDD
4. Run E2E scenarios until GREEN

**Implementation Steps:**

**Step 3.1: E2E Tests (BDD - Write First)**

- File: `tests/e2e/features/version-history.feature` → Add scenarios:
  - Navigate backward through versions
  - Navigate forward through versions
  - Buttons disabled at boundaries
  - Display version info (counter, timestamp, description)
  - Show "viewing old version" warning
  - Restore button returns to latest
- File: `tests/e2e/step-definitions/version-history.steps.ts` → Implement step definitions
- **Run E2E tests → All should FAIL (RED)**

**Step 3.2: Version Navigator Component (TDD)**

- File: `tests/unit/versionNavigator.test.ts` → Write failing unit tests
- File: `src/components/VersionNavigator.ts` → Implement component
- Unit tests cover:
  - Render arrow buttons
  - Display version counter
  - Display timestamp and description
  - Disable buttons at boundaries
  - Emit navigation events
  - Show/hide warning banner

**Step 3.3: Read-Only Mode Manager (TDD)**

- File: `tests/unit/readOnlyMode.test.ts` → Write failing tests
- File: `src/utils/readOnlyMode.ts` → Implement read-only mode
- Tests cover:
  - Disable all edit inputs when active
  - Enable inputs when deactivated
  - Visual indicators applied correctly
  - Export still works in read-only mode

**Step 3.4: Styling**

- File: `src/styles/components/version-navigator.css`
- Style version navigator in header
- Arrow buttons with hover/disabled states
- Warning banner styling

**Step 3.5: CharacterSheet Integration**

- File: `tests/unit/characterSheet.test.ts` → Update with version navigator tests
- File: `src/components/CharacterSheet.ts` → Add version navigator to header
- **Run E2E tests → Should now PASS (GREEN)**

**Acceptance Criteria:**

- [ ] All E2E tests pass
- [ ] All unit tests pass
- [ ] Can navigate through versions
- [ ] Read-only mode prevents edits
- [ ] UI displays correctly in header

---

#### **Phase 4: Smart Squashing System**

**Duration:** ~3-4 hours  
**Methodology:** Strict TDD (complex logic, no user-visible UI yet)  
**Deliverable:** Automatic version squashing after 5 seconds

**TDD Workflow:**

1. Write comprehensive failing tests for timer and squashing
2. Implement SquashManager and EditEventDetector
3. Integration tests with version creation

**Implementation Steps:**

**Step 4.1: Edit Event Detector (TDD)**

- File: `tests/unit/editEventDetector.test.ts` → Write failing tests
- File: `src/utils/editEventDetector.ts` → Implement detector
- Tests cover:
  - Detect modal open/close events
  - Detect keyboard activity in inputs
  - Detect confirm/abort actions
  - Emit events for squash timer

**Step 4.2: Squash Manager (TDD)**

- File: `tests/unit/squashManager.test.ts` → Write failing tests
- File: `src/storage/squashManager.ts` → Implement manager
- Tests cover:
  - Timer starts on edit (5 seconds)
  - Timer resets on subsequent edits
  - Timer doesn't reset on non-edit events (mouse move, scroll)
  - Timer cancels on Ctrl+Z/Y
  - Timer cancels on navigation
  - Squash occurs after timeout
  - Versions merge correctly
  - Squashed description generated
  - Unsquashed versions cleared after squash

**Step 4.3: Integration**

- Update `src/storage/versionHistory.ts` to use SquashManager
- Update `src/components/CharacterSheet.ts` to emit edit events
- Integration tests verify full workflow

**Acceptance Criteria:**

- [ ] All unit tests pass
- [ ] Timer behavior correct (starts, resets, cancels)
- [ ] Versions squash after 5 seconds
- [ ] Edit-only events reset timer
- [ ] Ctrl+Z/Y cancel timer

---

#### **Phase 5: Keyboard Shortcuts**

**Duration:** ~2-3 hours  
**Methodology:** BDD (E2E tests first) + TDD (unit tests)  
**Deliverable:** Context-aware Ctrl+Z/Y shortcuts

**BDD Workflow:**

1. Add keyboard shortcut scenarios to E2E tests
2. Run scenarios (FAIL - RED)
3. Implement using TDD
4. Run E2E until GREEN

**Implementation Steps:**

**Step 5.1: E2E Tests (BDD - Write First)**

- File: `tests/e2e/features/version-history.feature` → Add scenarios:
  - Ctrl+Z navigates to previous unsquashed version
  - Ctrl+Y navigates to next unsquashed version
  - Shortcuts don't work when input focused
  - Shortcuts cancel squash timer
  - After squashing, Ctrl+Z navigates squashed versions
  - Escape returns to latest version
- **Run E2E tests → Should FAIL (RED)**

**Step 5.2: Keyboard Shortcut Handler (TDD)**

- File: `tests/unit/keyboardShortcuts.test.ts` → Write failing tests
- File: `src/utils/keyboardShortcuts.ts` → Implement handler
- Tests cover:
  - Detect Ctrl+Z / Cmd+Z
  - Detect Ctrl+Y / Cmd+Y
  - Detect Escape
  - Ignore when input/modal focused
  - Cancel squash timer on activation
  - Navigate unsquashed versions pre-squash
  - Navigate squashed versions post-squash

**Step 5.3: Integration**

- File: `src/components/CharacterSheet.ts` → Add global keyboard listener
- **Run E2E tests → Should PASS (GREEN)**

**Acceptance Criteria:**

- [ ] All E2E tests pass
- [ ] All unit tests pass
- [ ] Shortcuts work correctly
- [ ] Context-aware behavior (pre/post squash)
- [ ] Input focus detection works

---

#### **Phase 6: Multi-Tab Conflict Detection**

**Duration:** ~2-3 hours  
**Methodology:** BDD (E2E tests first) + TDD (unit tests)  
**Deliverable:** ETag-based conflict detection with modal

**BDD Workflow:**

1. Add conflict detection scenarios to E2E tests
2. Run scenarios (FAIL - RED)
3. Implement using TDD
4. Run E2E until GREEN

**Implementation Steps:**

**Step 6.1: E2E Tests (BDD - Write First)**

- File: `tests/e2e/features/version-history.feature` → Add scenarios:
  - Save detects etag mismatch
  - Conflict modal appears on mismatch
  - User can choose "Reload" option
  - User can choose "Overwrite" option
  - Portrait changes don't affect etag
- **Run E2E tests → Should FAIL (RED)**

**Step 6.2: Conflict Detector (TDD)**

- File: `tests/unit/conflictDetector.test.ts` → Write failing tests
- File: `src/storage/conflictDetector.ts` → Implement detector
- Tests cover:
  - Compare etags on save
  - Detect mismatch correctly
  - Emit conflict events
  - Track loaded etag in memory
  - Portrait excluded from etag comparison

**Step 6.3: Conflict Modal (TDD)**

- File: `tests/unit/conflictModal.test.ts` → Write failing tests
- File: `src/components/ConflictModal.ts` → Implement modal
- Tests cover:
  - Display conflict warning
  - Show "Reload" and "Overwrite" buttons
  - Emit user choice events
  - Close on selection

**Step 6.4: Integration**

- File: `src/storage/storageFactory.ts` → Hook conflict detection into save flow
- **Run E2E tests → Should PASS (GREEN)**

**Acceptance Criteria:**

- [ ] All E2E tests pass
- [ ] All unit tests pass
- [ ] Conflicts detected correctly
- [ ] Modal displays on conflict
- [ ] User can resolve conflicts

---

#### **Phase 7: Integration & Polish**

**Duration:** ~2-3 hours  
**Methodology:** BDD (E2E tests) + Integration Testing  
**Deliverable:** Production-ready feature

**Implementation Steps:**

**Step 7.1: Export from Read-Only (BDD + TDD)**

- File: `tests/e2e/features/version-history.feature` → Add scenarios:
  - Can export character while viewing old version
  - Exported file contains viewed version (not current)
  - Export never includes version history
- File: `tests/unit/exportManager.test.ts` → Add read-only export tests
- File: `src/storage/exportManager.ts` → Implement read-only export
- **Run tests → Should PASS**

**Step 7.2: Edge Cases**

- Add tests and handle:
  - Empty history state
  - Browser refresh (persist currentIndex)
  - Clear all data (confirm dialog)
  - Portrait-only changes (don't create version)
  - Storage quota warnings

**Step 7.3: Final E2E Test Suite**

- Run complete E2E test suite
- Verify all scenarios pass
- Test for regressions in existing features

**Step 7.4: Documentation**

- Update FEATURES.md with completed feature
- Add usage examples
- Document keyboard shortcuts

**Acceptance Criteria:**

- [ ] All E2E tests pass (100%)
- [ ] All unit tests pass (100%)
- [ ] No regressions in existing features
- [ ] Export from read-only works
- [ ] Edge cases handled
- [ ] Feature documented in FEATURES.md
- [ ] CURRENT_FEATURE.md moved to archive/deleted

---

### Testing Strategy Summary

**Unit Tests (TDD):**

- Write before implementation
- Test individual components in isolation
- Mock dependencies
- Fast execution (<1s total)

**E2E Tests (BDD):**

- Write before UI implementation
- Test complete user workflows
- Use real browser (Playwright)
- Gherkin scenarios for clarity

**Test Coverage Goals:**

- Unit tests: 100% code coverage
- E2E tests: 100% user workflow coverage
- All tests must pass before phase completion

---

### Total Estimated Time: 16-20 hours

**Phase Breakdown:**

- Phase 1 (TDD): 2-3 hours
- Phase 2 (TDD): 2 hours
- Phase 3 (BDD+TDD): 3-4 hours
- Phase 4 (TDD): 3-4 hours
- Phase 5 (BDD+TDD): 2-3 hours
- Phase 6 (BDD+TDD): 2-3 hours
- Phase 7 (BDD+Integration): 2-3 hours

**Each phase is independently testable and can be deployed incrementally if needed.**

### Unit Tests

Key test scenarios:

**Version Storage:**

- Create version on character change
- Exclude portrait from version data
- Limit to 99 versions (FIFO)
- Remove oldest when exceeding limit
- Deep clone prevents reference bugs

**Smart Squashing:**

- Timer starts on edit
- Timer resets on subsequent edits
- Timer doesn't reset on non-edit events
- Squash occurs after 5 seconds
- Ctrl+Z/Y cancel timer
- Generate correct squashed descriptions

**Change Detection:**

- Detect all change types correctly
- Generate concise descriptions
- Handle multiple simultaneous changes
- Priority ordering works correctly

**Navigation:**

- Navigate back/forward through versions
- Disable buttons at boundaries
- Restore version correctly
- Read-only mode active when navigating

**ETag Conflicts:**

- Generate etag on save
- Detect etag mismatch
- Handle conflict resolution
- Portrait excluded from etag

**Keyboard Shortcuts:**

- Work only when no input focused
- Navigate through unsquashed versions
- Cancel squash timer
- Open UI after squashing (future)

### Edge Cases to Handle

1. **Empty history** - Show "No version history" message, disable buttons
2. **Single version** - Disable navigation buttons
3. **Browser refresh** - Persist currentIndex, restore on reload
4. **Concurrent tabs** - ETag conflict detection and resolution
5. **Export/Import** - Never include history, allow export from read-only
6. **Clear all data** - Prompt to confirm clearing version history
7. **Large characters** - Monitor storage, warn if approaching limits
8. **Squashing in progress** - Handle user navigation during squash timer
9. **Portrait changes** - Don't create version for portrait-only changes
10. **Rapid typing** - Debounce properly, don't create version on every keystroke

### Future Enhancements (Not in Initial Release)

- Image diff storage (Option A from planning)
- Configurable "allow editing old versions"
- Version history modal/timeline view
- Version branching from old states
- Adjustable squash timer (user preference)
- Version search/filtering
- Storage quota warnings

### Success Criteria

- [ ] Can navigate through 99 versions smoothly
- [ ] Smart squashing works (5-second timer, proper resets)
- [ ] Change descriptions are accurate and concise
- [ ] Read-only mode prevents edits on old versions
- [ ] Keyboard shortcuts work correctly (context-aware)
- [ ] ETag conflict detection prevents data loss
- [ ] Restoring a version works correctly
- [ ] Export from read-only view works
- [ ] Portrait excluded from versions (design ready for image versioning)
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No regressions in existing features
- [ ] Feature documented in FEATURES.md
- [ ] This file deleted

---

## Implementation Notes

_Add notes, discoveries, and decisions as you work..._
