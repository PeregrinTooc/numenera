import type { Character } from "@/types/character";

/**
 * Interface for character persistence implementations
 *
 * This interface allows for multiple storage backends:
 * - LocalStorage (current implementation)
 * - IndexedDB (for larger storage capacity)
 * - Remote server (future possibility)
 *
 * All methods are async to support various storage mechanisms
 */
export interface ICharacterStorage {
  /**
   * Initialize the storage backend
   * Must be called before other methods
   *
   * @throws Error if initialization fails
   */
  init(): Promise<void>;

  /**
   * Save character state to storage
   *
   * @param character The character object to save
   * @throws Error if save operation fails
   */
  save(character: Character): Promise<void>;

  /**
   * Load character state from storage
   *
   * @returns The raw stored data (untrusted, validate before use), or null if not found
   * @throws Error if load operation fails
   */
  load(): Promise<unknown>;

  /**
   * Clear stored character state
   *
   * @throws Error if clear operation fails
   */
  clear(): Promise<void>;

  /**
   * Keep a copy of stored data the app could not read, exactly as it was stored
   * (a string for text that is not valid JSON). Only the latest copy is kept.
   */
  saveCorruptedBackup(raw: unknown): Promise<void>;

  /** @returns The kept unreadable data, or null if there is none */
  loadCorruptedBackup(): Promise<unknown>;

  /** Remove the kept unreadable data (the user downloaded or discarded it) */
  clearCorruptedBackup(): Promise<void>;

  /**
   * Check if this storage mechanism is available
   *
   * @returns true if storage is available and functional
   */
  isAvailable(): Promise<boolean>;
}
