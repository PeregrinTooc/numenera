import { beforeEach, afterEach } from "vitest";
import { IndexedDBStorageImpl } from "@/storage/indexedDBStorageImpl";
import type { Character } from "@/types/character";
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

/**
 * Private members the failure-path tests swap out to simulate a broken
 * database. A structural view of the class, not `any`.
 */
interface StorageInternals {
  db: IDBDatabase | null;
  saveInternal: (character: Character) => Promise<void>;
}

export function internalsOf(storage: IndexedDBStorageImpl): StorageInternals {
  return storage as unknown as StorageInternals;
}

/** Swaps in a database without the object store; returns a function that restores the real one. */
export function replaceDbWithoutObjectStore(storage: IndexedDBStorageImpl): () => void {
  const internals = internalsOf(storage);
  const originalDb = internals.db;
  internals.db = {
    objectStoreNames: { contains: () => false },
  } as unknown as IDBDatabase;
  return () => {
    internals.db = originalDb;
  };
}

export interface IndexedDBStorageFixture {
  readonly storage: IndexedDBStorageImpl;
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
