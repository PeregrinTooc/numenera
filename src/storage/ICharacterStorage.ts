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
  save(character: any): Promise<void>;

  /**
   * Load character state from storage
   *
   * @returns The stored character object, or null if not found
   * @throws Error if load operation fails
   */
  load(): Promise<any | null>;

  /**
   * Clear stored character state
   *
   * @throws Error if clear operation fails
   */
  clear(): Promise<void>;

  /**
   * Check if this storage mechanism is available
   *
   * @returns true if storage is available and functional
   */
  isAvailable(): Promise<boolean>;
}
