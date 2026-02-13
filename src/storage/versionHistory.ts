import type { Character } from "../types/character.js";
import type { CharacterVersion } from "../types/versionHistory.js";
import { generateETag } from "../utils/etag.js";
import { CompletionNotifier } from "../utils/completionNotifier.js";

const DEFAULT_DB_NAME = "numenera-version-history-db";
const STORE_NAME = "versions";
const DB_VERSION = 1;
const MAX_VERSIONS = 99;

/**
 * Manages version history for characters using IndexedDB
 * Stores up to 99 versions in FIFO queue, excluding portrait data
 */
export class VersionHistoryManager {
  private db: IDBDatabase | null = null;
  private readonly dbName: string;

  /**
   * Create a new VersionHistoryManager
   * @param dbName Optional database name (defaults to "numenera-version-history-db")
   *               Use unique names for test isolation
   */
  constructor(dbName: string = DEFAULT_DB_NAME) {
    this.dbName = dbName;
  }

  /**
   * Initialize the IndexedDB connection
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, DB_VERSION);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB for version history"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Create object store with auto-incrementing key
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
          });
          // Create index on timestamp for chronological ordering
          objectStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  /**
   * Check if IndexedDB is available and initialized
   */
  async isAvailable(): Promise<boolean> {
    return this.db !== null;
  }

  /**
   * Save a new version of the character
   * Automatically excludes portrait data and generates etag
   *
   * @param character The character to save
   * @param description Description of what changed
   * @returns The created CharacterVersion
   */
  async saveVersion(character: Character, description: string): Promise<CharacterVersion> {
    const notifier = new CompletionNotifier("version-create");
    notifier.start();

    try {
      if (!this.db) {
        throw new Error("VersionHistoryManager not initialized");
      }

      // Deep clone character and exclude portrait
      const { portrait: _portrait, ...characterWithoutPortrait } = character;
      const clonedCharacter = JSON.parse(JSON.stringify(characterWithoutPortrait)) as Omit<
        Character,
        "portrait"
      >;

      // Generate etag
      const etag = await generateETag(character);

      // Create version object with unique timestamp
      // Use Date.now() but ensure uniqueness by adding a small increment if needed
      let timestamp = Date.now();
      const existingVersions = await this.getAllVersions();
      if (existingVersions.length > 0) {
        const lastTimestamp = existingVersions[existingVersions.length - 1].timestamp;
        // Ensure new timestamp is greater than the last one
        if (timestamp <= lastTimestamp) {
          timestamp = lastTimestamp + 1;
        }
      }

      const version: CharacterVersion = {
        id: crypto.randomUUID(),
        character: clonedCharacter,
        timestamp,
        description,
        etag,
      };

      // Save to IndexedDB first
      await this.saveToDb(version);

      // Check version count and remove oldest if needed
      let versions = await this.getAllVersions();
      while (versions.length > MAX_VERSIONS) {
        // Remove oldest version
        await this.deleteVersion(versions[0].id);
        // Get fresh list after deletion
        versions = await this.getAllVersions();
      }

      notifier.complete({ versionId: version.id, description: version.description });
      return version;
    } catch (error) {
      notifier.error(error);
      throw error;
    }
  }

  /**
   * Get all versions in chronological order (oldest first)
   */
  async getAllVersions(): Promise<CharacterVersion[]> {
    if (!this.db) {
      throw new Error("VersionHistoryManager not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("timestamp");
      const request = index.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error("Failed to get all versions"));
      };
    });
  }

  /**
   * Get a specific version by ID
   */
  async getVersionById(id: string): Promise<CharacterVersion | null> {
    if (!this.db) {
      throw new Error("VersionHistoryManager not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error("Failed to get version by ID"));
      };
    });
  }

  /**
   * Clear all versions from storage
   */
  async clear(): Promise<void> {
    if (!this.db) {
      throw new Error("VersionHistoryManager not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to clear versions"));
    });
  }

  /**
   * Private helper: Save version to IndexedDB
   */
  private async saveToDb(version: CharacterVersion): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(version);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to save version"));
    });
  }

  /**
   * Private helper: Delete a version by ID
   */
  private async deleteVersion(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to delete version"));
    });
  }

  /**
   * Close the database connection
   * Should be called when done with the manager
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
