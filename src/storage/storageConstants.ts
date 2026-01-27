// Shared storage constants
// Centralized to avoid duplication between localStorage and file storage

/**
 * SCHEMA VERSION
 *
 * RULE: Increment this version number whenever the Character type changes in src/types/character.ts
 *
 * Version History:
 * - v1: Initial schema (base character structure)
 * - v2: Added ability enhancements (cost, pool, action) - Phase 2
 * - v3: Added attacks and specialAbilities arrays - Phase 3
 * - v4: Added recoveryRolls and damageTrack - Phase 4
 *
 * Used for:
 * - File export/import: Validates compatibility between exported file and current app version
 * - Migration: Helps identify when data needs to be transformed
 */
export const SCHEMA_VERSION = 4;

/**
 * localStorage key for character state
 */
export const STORAGE_KEY = "numenera-character-state";
