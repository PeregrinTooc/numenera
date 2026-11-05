import { afterEach, beforeEach } from "vitest";
import { VersionHistoryManager } from "@/storage/versionHistory";
import type { Character } from "@/types/character";
import { createTestCharacter } from "../../factories/character.js";

export interface VersionSeed {
  readonly name: string;
  readonly description: string;
}

let databaseCounter = 0;

/**
 * Registers hooks that give each test its own initialised, real
 * VersionHistoryManager on an isolated (fake-indexeddb) database. Returns a
 * live accessor.
 */
export function setupRealVersionHistory(): { readonly manager: VersionHistoryManager } {
  let manager: VersionHistoryManager;
  let databaseName: string;

  beforeEach(async () => {
    databaseCounter += 1;
    databaseName = `test-version-history-${databaseCounter}`;
    manager = new VersionHistoryManager(databaseName);
    await manager.init();
  });

  afterEach(async () => {
    manager.close();
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase(databaseName);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  });

  return {
    get manager() {
      return manager;
    },
  };
}

/** Stores one version per seed, oldest first, with a character named after the seed. */
export async function seedVersions(
  manager: VersionHistoryManager,
  seeds: readonly VersionSeed[]
): Promise<void> {
  for (const seed of seeds) {
    await manager.saveVersion(createTestCharacter({ name: seed.name }), seed.description);
  }
}

/** Stores a version whose character snapshot is deliberately not a valid Character. */
export async function seedRawVersion(
  manager: VersionHistoryManager,
  snapshot: unknown,
  description: string
): Promise<void> {
  await manager.saveVersion(snapshot as Character, description);
}
