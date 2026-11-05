import type { Character } from "@/types/character";
import type { CharacterVersion } from "@/types/versionHistory";
import { generateETag } from "@/utils/etag";
import { openDatabase, requireDatabase, runRequest } from "./idb.js";
import { VERSION_HISTORY_DB_NAME } from "./storageConstants.js";

const DEFAULT_DB_NAME = VERSION_HISTORY_DB_NAME;
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

  constructor(dbName: string = DEFAULT_DB_NAME) {
    this.dbName = dbName;
  }

  async init(): Promise<void> {
    this.db = await openDatabase(
      this.dbName,
      DB_VERSION,
      (db) => {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
          });
          objectStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      },
      () => new Error("Failed to open IndexedDB for version history")
    );
  }

  async isAvailable(): Promise<boolean> {
    return this.db !== null;
  }

  /**
   * Automatically excludes portrait data and generates etag
   */
  async saveVersion(character: Character, description: string): Promise<CharacterVersion> {
    this.requireDb();

    const { portrait: _portrait, ...characterWithoutPortrait } = character;
    const clonedCharacter = JSON.parse(JSON.stringify(characterWithoutPortrait)) as Omit<
      Character,
      "portrait"
    >;

    const etag = await generateETag(character);

    // Use Date.now() but ensure uniqueness by adding a small increment if needed
    let timestamp = Date.now();
    const existingVersions = await this.getAllVersionsInternal();
    if (existingVersions.length > 0) {
      const lastTimestamp = existingVersions[existingVersions.length - 1].timestamp;
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

    await this.saveToDb(version);

    let versions = await this.getAllVersionsInternal();
    while (versions.length > MAX_VERSIONS) {
      await this.deleteVersion(versions[0].id);
      versions = await this.getAllVersionsInternal();
    }

    return version;
  }

  async getAllVersions(): Promise<CharacterVersion[]> {
    return this.getAllVersionsInternal();
  }

  private async getAllVersionsInternal(): Promise<CharacterVersion[]> {
    const versions = await runRequest(
      this.requireDb(),
      STORE_NAME,
      "readonly",
      (store) => store.index("timestamp").getAll() as IDBRequest<CharacterVersion[]>,
      () => new Error("Failed to get all versions")
    );
    return versions || [];
  }

  private requireDb(): IDBDatabase {
    return requireDatabase(this.db, "VersionHistoryManager not initialized");
  }

  async getVersionById(id: string): Promise<CharacterVersion | null> {
    const version = await runRequest(
      this.requireDb(),
      STORE_NAME,
      "readonly",
      (store) => store.get(id) as IDBRequest<CharacterVersion | undefined>,
      () => new Error("Failed to get version by ID")
    );
    return version || null;
  }

  /**
   * Update an existing version's description in place. Not part of the normal
   * save/squash flow (saveVersion covers that): only the description migration
   * rewrites a stored description.
   */
  async updateVersionDescription(id: string, description: string): Promise<void> {
    const existing = await this.getVersionById(id);
    if (!existing) {
      throw new Error(`Version ${id} not found`);
    }

    await this.saveToDb({ ...existing, description });
  }

  async updateVersionMetadata(
    id: string,
    updates: Pick<CharacterVersion, "isSquashed" | "squashedCount">
  ): Promise<void> {
    const existing = await this.getVersionById(id);
    if (!existing) {
      throw new Error(`Version ${id} not found`);
    }

    await this.saveToDb({
      ...existing,
      ...(updates.isSquashed !== undefined && { isSquashed: updates.isSquashed }),
      ...(updates.squashedCount !== undefined && { squashedCount: updates.squashedCount }),
    });
  }

  async clear(): Promise<void> {
    await runRequest(
      this.requireDb(),
      STORE_NAME,
      "readwrite",
      (store) => store.clear(),
      () => new Error("Failed to clear versions")
    );
  }

  private async saveToDb(version: CharacterVersion): Promise<void> {
    await runRequest(
      this.requireDb(),
      STORE_NAME,
      "readwrite",
      (store) => store.put(version),
      () => new Error("Failed to save version")
    );
  }

  private async deleteVersion(id: string): Promise<void> {
    await runRequest(
      this.requireDb(),
      STORE_NAME,
      "readwrite",
      (store) => store.delete(id),
      () => new Error("Failed to delete version")
    );
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
