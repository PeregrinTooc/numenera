// Shared storage constants
// Centralized to avoid duplication between localStorage and file storage

/**
 * SCHEMA VERSION (Semantic Versioning)
 *
 * Format: "MAJOR.MINOR.PATCH"
 * - MAJOR: Breaking changes requiring migration
 * - MINOR: New fields added (backward compatible)
 * - PATCH: Bug fixes, no schema change
 *
 * Version History:
 * - 1.0.0: Initial release schema (February 2026)
 *          Full character structure with stats, abilities, items, etc.
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

/**
 * localStorage key for character state
 */
export const STORAGE_KEY = "numenera-character-state";

/**
 * localStorage key for layout preferences
 * Stored separately from character data as it's a user preference
 */
export const LAYOUT_STORAGE_KEY = "numenera-layout";

/**
 * IndexedDB database names.
 *
 * Centralized here so the app code, the storage layer, and the E2E test
 * harness cannot drift apart. They previously did: main.ts's E2E test hooks
 * and tests/e2e/support/hooks.ts both hardcoded "NumeneraCharacterDB", which
 * matches none of the databases below — so test cleanup silently deleted
 * nothing and version-clearing threw ("versions" store not found).
 */
export const CHARACTER_DB_NAME = "numenera-character-db";
export const VERSION_HISTORY_DB_NAME = "numenera-version-history-db";
export const FILE_HANDLES_DB_NAME = "FileHandles";
