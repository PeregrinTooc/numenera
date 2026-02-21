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
