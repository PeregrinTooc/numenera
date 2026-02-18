# Current Feature Implementation

> **Workflow:** This file contains the feature currently being implemented. When complete, move the feature to FEATURES.md and delete this file.

---

## Version History (Character Time Travel)

### Overview

Version history system that stores the last 99 character edits in IndexedDB, allowing users to navigate through previous versions using arrow buttons and restore any version. Features smart squashing of rapid edits after 5 seconds of inactivity.

### Implementation Status

#### ✅ Completed Features

**Core Functionality:**

- Version storage in IndexedDB (max 99 versions, FIFO queue)
- Version Navigator UI (arrow buttons, version counter)
- Version Warning Banner (shown when viewing old versions)
- Navigation through version history (backward/forward)
- Restore old version as new latest
- Smart squashing (buffers changes, saves after 5s inactivity)
- Combined descriptions for squashed versions
- Flush on page unload (prevents data loss)
- Edit from old version creates new version at end (no read-only mode)
- Portrait excluded from versioning
- Export from old version works
- i18n support (English + German)

**Event-Driven Testing System (Phase 1, 2 & 3):**

- ✅ Phase 1: Storage layer events (AutoSaveService, VersionHistoryService)
- ✅ Phase 2: UI operation events (modals, card operations)
  - Modal events: modal-opened, field-edited, modal-closed for all 3 modals
  - Card events: card-added, card-edited, card-deleted in CollectionBehavior
  - E2E tests wait for UI state changes instead of arbitrary timeouts
  - Tests use event-based waiting (e.g., expect(versionCounter).toContainText())
- ✅ Phase 3: Auto-save wait replacement
  - Created `waitForSaveComplete()` helper function in auto-save-indicator.steps.ts
  - Replaced 44 occurrences of `waitForTimeout(400)` auto-save waits with event-based helper
  - Helper waits for save indicator visibility + debounce period (300ms + buffer)
  - 8 failing tests now passing (additional-fields-editing.feature scenarios)
  - Note: Currently uses timeout-based approach due to inline editing complexity
  - Future improvement: Implement proper event-based timestamp monitoring

**Test Coverage:**

- ✅ All 526 unit tests passing
- ✅ All 360 E2E scenarios passing (31/31 version history scenarios)
- ✅ No regressions in existing features

**Key Files:**

- `src/storage/versionHistory.ts` - VersionHistoryManager (IndexedDB)
- `src/services/versionHistoryService.ts` - Smart squashing with buffer-then-save
- `src/services/versionState.ts` - Version navigation state management
- `src/components/VersionNavigator.ts` - Navigation UI
- `src/components/VersionWarningBanner.ts` - Warning banner UI
- `src/utils/squashDescriptions.ts` - Description combining logic
- `tests/e2e/features/version-history.feature` - 31 E2E scenarios

**Keyboard Shortcuts:**

- Keyboard shortcuts for version navigation (Ctrl+Z backward, Ctrl+Y forward)
- Works after squash (navigates through saved versions)
- Prevents shortcuts when modal or input field is focused
- E2E test dispatches real KeyboardEvents on document.body to properly test the keyboard handler
- All tests passing (353/353 E2E scenarios)

#### ⏳ Pending Features (Future Enhancements)

1. **Buffer-Based Undo/Redo (Ctrl+Z/Y Before Squash)**
   - Context-aware undo/redo:
     - Before squash: Granular undo/redo of buffered changes
     - After squash: Navigate through saved versions (✅ IMPLEMENTED)
   - 3 @wip test scenarios added (lines 158-191 in version-history.feature)
   - Impact: High priority UX enhancement
   - Complexity: Medium-high (requires in-memory undo/redo stack in VersionHistoryService)
   - Estimated: 3-4 hours implementation + testing

2. **Multi-Tab Conflict Detection**
   - ETag-based conflict detection when editing same character in multiple tabs
   - Infrastructure exists (`src/utils/etag.ts`)
   - 4 @wip test scenarios added (lines 219-249 in version-history.feature)
   - Impact: Medium priority data safety feature
   - Complexity: Medium (requires StorageChangeListener + conflict resolution UI)
   - Estimated: 3-4 hours implementation + testing

### E2E Test File

**Location:** `tests/e2e/features/version-history.feature`

**Test Summary:**

- 31 scenarios defined
- 31 passing (including keyboard shortcut navigation through squashed versions)
- 7 marked @wip (3 buffer-based undo/redo, 4 multi-tab conflict detection)

**Covered Scenarios:**

- ✅ Version navigator visibility
- ✅ Creating versions on edits
- ✅ Navigation (backward/forward, boundaries)
- ✅ Warning banner display
- ✅ Restore functionality
- ✅ Editing from old version
- ✅ Smart squashing behavior
- ✅ Combined descriptions
- ✅ FIFO queue (99 version limit)
- ✅ Portrait exclusion
- ✅ Export from old version
- ✅ Rapid navigation
- ✅ Browser refresh behavior
- ✅ Keyboard shortcuts (Ctrl+Z/Y for version navigation)

**Not Covered:**

- ⏳ Buffer-based undo/redo (Ctrl+Z/Y before squash) - 3 @wip scenarios
- ⏳ Multi-tab conflict detection - 4 @wip scenarios

### Architecture Notes

**Design Decision: No Read-Only Mode**

- Original plan included read-only mode when viewing old versions
- Implementation allows editing from any version (creates new version at end)
- This is simpler and more flexible for users
- Read-only mode code exists but is not activated in main.ts

**Smart Squashing:**

- Buffers changes in memory
- Single global timer (5000ms production, 1000ms tests)
- Timer resets on each edit
- Combines descriptions (max 3 shown)
- Flushes on page unload

**Version Navigation:**

- Separate latest vs displayed character
- Event-driven architecture (version-squashed event)
- Auto-navigates to latest after editing from old version
- Warning banner with restore button

### Success Criteria

#### Core Feature (Ready to Ship)

- ✅ Can navigate through 99 versions smoothly
- ✅ Smart squashing works (5-second timer, proper resets)
- ✅ Change descriptions are accurate and concise
- ✅ Restoring a version works correctly
- ✅ Edit from old version creates new version
- ✅ Export from old version works
- ✅ Portrait excluded from versions
- ✅ All 514 unit tests pass
- ✅ 31/31 E2E tests pass (7 @wip for future enhancements)
- ✅ No regressions in existing features

#### Future Enhancements

- ⏳ Buffer-based undo/redo (Ctrl+Z/Y before squash)
- ⏳ Multi-tab conflict detection

### Implementation Notes

**Keyboard Shortcut Testing:**

- E2E test dispatches KeyboardEvent on document.body (not document directly)
- This ensures e.target is an HTMLElement, allowing proper input field detection
- Tests the actual keyboard handler code path, including preventDefault() and input filtering
- All 353 E2E scenarios passing, including keyboard shortcut test

**Next Steps:**

1. Move completed feature to FEATURES.md
2. Delete this file
3. Create new feature entries in TODO.md for:
   - Buffer-based undo/redo (Ctrl+Z/Y before squash)
   - Multi-tab conflict detection (etag-based)
