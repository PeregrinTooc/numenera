/**
 * SCHEMA VERSION (Semantic Versioning)
 *
 * Format: "MAJOR.MINOR.PATCH"
 * - MAJOR: Breaking changes requiring migration
 * - MINOR: New fields added (backward compatible)
 * - PATCH: Bug fixes, no schema change
 *
 *
 * Migration Strategy:
 * - Files with different versions are NOT rejected outright
 * - Import attempts to sanitize data to current schema
 * - Missing fields get defaults, invalid types get corrected
 * - Warnings are shown for any corrections made
 *
 * See ARCHITECTURE.md for migration guidelines when adding breaking changes.
 */
export const SCHEMA_VERSION = "1.0.0";

export const STORAGE_KEY = "numenera-character-state";

/**
 * localStorage key for the copy of an unreadable character (localStorage fallback only;
 * IndexedDB keeps its copy as a second record in the character store).
 */
export const UNREADABLE_BACKUP_STORAGE_KEY = "numenera-character-unreadable-backup";

/**
 * Stored separately from character data as it's a user preference
 */
export const LAYOUT_STORAGE_KEY = "numenera-layout";

/**
 * localStorage key for the card sections' column choices.
 * Kept apart from the layout array so old layouts and old exports stay valid.
 */
export const SECTION_COLUMNS_STORAGE_KEY = "numenera-section-columns";

/**
 * localStorage key for the Comparison View on/off preference.
 * Stored separately from character data as it's a user preference.
 */
export const COMPARISON_VIEW_STORAGE_KEY = "numenera-comparison-view-enabled";

/**
 * IndexedDB database names.
 *
 * Centralized here so the app code, the storage layer, and the E2E test
 * harness cannot drift apart.
 *
 * and tests/e2e/support/hooks.ts both hardcoded "NumeneraCharacterDB", which
 * matches none of the databases below — so test cleanup silently deleted
 * nothing and version-clearing threw ("versions" store not found).
 */
export const CHARACTER_DB_NAME = "numenera-character-db";
export const VERSION_HISTORY_DB_NAME = "numenera-version-history-db";
export const FILE_HANDLES_DB_NAME = "FileHandles";
