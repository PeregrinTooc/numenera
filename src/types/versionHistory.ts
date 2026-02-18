import type { Character } from "./character.js";

/**
 * Represents a single version snapshot of a character
 */
export interface CharacterVersion {
  /** Unique identifier for this version (UUID) */
  id: string;

  /** Full character snapshot (excluding portrait) */
  character: Omit<Character, "portrait">;

  /** Unix timestamp in milliseconds when this version was created */
  timestamp: number;

  /** Auto-generated description of what changed */
  description: string;

  /** SHA-256 hash for conflict detection (excludes portrait) */
  etag: string;

  /** True if this version is a result of squashing multiple versions */
  isSquashed?: boolean;

  /** Number of versions that were squashed into this one */
  squashedCount?: number;
}

/**
 * State management for version history system
 */
export interface VersionHistoryState {
  /** Array of all versions (max 99, FIFO) */
  versions: CharacterVersion[];

  /** Current position in history (-1 = latest/current character) */
  currentIndex: number;

  /** True when viewing an old version (read-only mode) */
  isNavigating: boolean;

  /** Temporary storage for unsquashed versions (before 5s timer) */
  unsquashedVersions: CharacterVersion[];

  /** Timer ID for squash operation (null if no timer active) */
  squashTimer: number | null;
}
