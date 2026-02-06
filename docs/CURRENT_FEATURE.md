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

**Test Coverage:**

- ✅ All 514 unit tests passing
- ✅ All 351 E2E scenarios passing (30/31 version history scenarios)
- ✅ No regressions in existing features

**Key Files:**

- `src/storage/versionHistory.ts` - VersionHistoryManager (IndexedDB)
- `src/services/versionHistoryService.ts` - Smart squashing with buffer-then-save
- `src/services/versionState.ts` - Version navigation state management
- `src/components/VersionNavigator.ts` - Navigation UI
- `src/components/VersionWarningBanner.ts` - Warning banner UI
- `src/utils/squashDescriptions.ts` - Description combining logic
- `tests/e2e/features/version-history.feature` - 31 E2E scenarios

#### ⏳ Pending Features (Future Enhancements)

1. **Keyboard Navigation (@wip)**
   - Scenario: "Keyboard navigation support" (line 179-186 in version-history.feature)
   - Missing: Step definitions for Enter/Space on focused arrows
   - Impact: Low priority accessibility enhancement
   - Estimated: 30 minutes

2. **Keyboard Shortcuts (Not Started)**
   - Ctrl+Z / Ctrl+Y for undo/redo
   - Context-aware: granular before squash, opens UI after squash
   - Impact: Medium priority UX enhancement
   - Estimated: 2-3 hours (includes E2E tests)

3. **Multi-Tab Conflict Detection (Not Started)**
   - ETag-based conflict detection when editing in multiple tabs
   - Infrastructure exists (`src/utils/etag.ts`) but not wired up
   - Impact: Medium priority data safety feature
   - Estimated: 3-4 hours (includes E2E tests)

### E2E Test File

**Location:** `tests/e2e/features/version-history.feature`

**Test Summary:**

- 31 scenarios defined
- 30 passing
- 1 marked @wip (keyboard navigation support)

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

**Not Covered:**

- ⏳ Keyboard navigation (Enter/Space on focused arrows) - @wip
- ⏳ Keyboard shortcuts (Ctrl+Z/Y)
- ⏳ Multi-tab conflict detection

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
- ✅ 30/31 E2E tests pass (1 @wip for future enhancement)
- ✅ No regressions in existing features

#### Future Enhancements

- ⏳ Keyboard navigation (@wip scenario)
- ⏳ Keyboard shortcuts (Ctrl+Z/Y)
- ⏳ Multi-tab conflict detection

### Next Steps

1. Move completed feature to FEATURES.md
2. Delete this file
3. Create new feature entries in TODO.md for:
   - Keyboard navigation support
   - Keyboard shortcuts (Ctrl+Z/Y)
   - Multi-tab conflict detection (etag-based)
