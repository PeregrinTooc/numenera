import { beforeEach, afterEach } from "vitest";
import { IndexedDBStorageImpl } from "@/storage/indexedDBStorageImpl";
import { CHARACTER_DB_NAME } from "@/storage/storageConstants";
import { createTestCharacter } from "../../factories/character";

// Mock character data
export const mockCharacter = createTestCharacter({
  name: "Test Character",
  descriptor: "Clever",
  type: "Jack",
  focus: "Battles Robots",
  tier: 3,
  effort: 3,
  currentXp: 5,
  totalXp: 5,
});

export const oldVersionedFormat = {
  version: 1,
  data: mockCharacter,
};

const TEST_AVAILABILITY_TIMEOUT_MS = 50;

export interface IndexedDBStorageFixture {
  readonly storage: IndexedDBStorageImpl;
}

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function createEmptyDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Same name and version as the app's database, but the upgrade creates no store
    const request = indexedDB.open(name, 1);
    request.onsuccess = () => {
      request.result.close();
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Runs `run` against an initialised storage whose real database exists without
 * the object store, then removes that database so later tests start clean.
 * The fixture's own connection is closed first or the delete would block.
 */
export async function withDatabaseLackingObjectStore(
  fixture: IndexedDBStorageFixture,
  run: (storage: IndexedDBStorageImpl) => Promise<void>
): Promise<void> {
  fixture.storage.close();
  await deleteDatabase(CHARACTER_DB_NAME);
  await createEmptyDatabase(CHARACTER_DB_NAME);
  const storage = new IndexedDBStorageImpl(TEST_AVAILABILITY_TIMEOUT_MS);
  await storage.init();
  try {
    await run(storage);
  } finally {
    storage.close();
    await deleteDatabase(CHARACTER_DB_NAME);
  }
}

/**
 * Registers hooks that give each test an initialised, empty
 * IndexedDBStorageImpl (short availability timeout) and clean up afterwards.
 * Returns a live accessor.
 */
export function setupIndexedDBStorage(): IndexedDBStorageFixture {
  const fixture = {} as { storage: IndexedDBStorageImpl };

  beforeEach(async () => {
    localStorage.clear();
    fixture.storage = new IndexedDBStorageImpl(TEST_AVAILABILITY_TIMEOUT_MS);
    await fixture.storage.init();
    // Clear any existing data from previous tests
    await fixture.storage.clear();
  });

  afterEach(() => {
    if (fixture.storage) {
      fixture.storage.close();
    }
    localStorage.clear();
  });

  return fixture;
}
