import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { IndexedDBStorageImpl } from "../../src/storage/indexedDBStorageImpl.js";
import { STORAGE_KEY } from "../../src/storage/storageConstants.js";

// Mock character data
const mockCharacter = {
  name: "Test Character",
  descriptor: "Clever",
  type: "Jack",
  focus: "Battles Robots",
  tier: 3,
  effort: 3,
  xp: 5,
  statPools: {
    might: { current: 10, max: 12, edge: 1 },
    speed: { current: 8, max: 10, edge: 2 },
    intellect: { current: 15, max: 15, edge: 0 },
  },
};

const oldVersionedFormat = {
  version: 1,
  data: mockCharacter,
};

describe("IndexedDBStorageImpl", () => {
  let storage: IndexedDBStorageImpl;

  beforeEach(async () => {
    localStorage.clear();
    storage = new IndexedDBStorageImpl();
    await storage.init();
    // Clear any existing data from previous tests
    await storage.clear();
  });

  afterEach(() => {
    if (storage) {
      storage.close();
    }
    localStorage.clear();
  });

  describe("isAvailable", () => {
    it("should return true when IndexedDB is available", async () => {
      const result = await storage.isAvailable();
      expect(result).toBe(true);
    });

    it("should handle environment without IndexedDB", async () => {
      const originalIndexedDB = global.indexedDB;
      // @ts-expect-error - Testing undefined scenario
      delete global.indexedDB;

      const result = await storage.isAvailable();
      expect(result).toBe(false);

      // Restore
      global.indexedDB = originalIndexedDB;
    });
  });

  describe("init", () => {
    it("should initialize IndexedDB successfully", async () => {
      await expect(storage.init()).resolves.toBeUndefined();
    });

    it("should create the object store on first initialization", async () => {
      await storage.init();
      // Verify by checking if we can perform operations
      await expect(storage.save(mockCharacter)).resolves.toBeUndefined();
    });
  });

  describe("save and load", () => {
    it("should save and load character data", async () => {
      await storage.save(mockCharacter);
      const loaded = await storage.load();
      expect(loaded).toEqual(mockCharacter);
    });

    it("should return null when no data is stored", async () => {
      const loaded = await storage.load();
      expect(loaded).toBeNull();
    });

    it("should overwrite existing data when saving", async () => {
      await storage.save(mockCharacter);
      const updatedCharacter = { ...mockCharacter, name: "Updated Character" };
      await storage.save(updatedCharacter);
      const loaded = await storage.load();
      expect(loaded).toEqual(updatedCharacter);
      expect(loaded.name).toBe("Updated Character");
    });

    it("should throw error when saving without initialization", async () => {
      const uninitializedStorage = new IndexedDBStorageImpl();
      await expect(uninitializedStorage.save(mockCharacter)).rejects.toThrow(
        "IndexedDB not initialized"
      );
    });

    it("should throw error when loading without initialization", async () => {
      const uninitializedStorage = new IndexedDBStorageImpl();
      await expect(uninitializedStorage.load()).rejects.toThrow("IndexedDB not initialized");
    });
  });

  describe("clear", () => {
    it("should clear stored character data", async () => {
      await storage.save(mockCharacter);
      await storage.clear();
      const loaded = await storage.load();
      expect(loaded).toBeNull();
    });

    it("should handle clearing when no data exists", async () => {
      await expect(storage.clear()).resolves.toBeUndefined();
    });

    it("should throw error when clearing without initialization", async () => {
      const uninitializedStorage = new IndexedDBStorageImpl();
      await expect(uninitializedStorage.clear()).rejects.toThrow("IndexedDB not initialized");
    });
  });

  describe("migrateFromLocalStorage", () => {
    it("should migrate data from localStorage to IndexedDB (new format)", async () => {
      // Setup: Store data in localStorage (new raw format)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCharacter));

      // Execute migration
      await storage.migrateFromLocalStorage();

      // Verify: Data should be in IndexedDB
      const loaded = await storage.load();
      expect(loaded).toEqual(mockCharacter);

      // Verify: Data should be removed from localStorage
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("should migrate data from localStorage to IndexedDB (old versioned format)", async () => {
      // Setup: Store data in localStorage (old versioned format)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(oldVersionedFormat));

      // Spy on console.log to verify migration message
      const consoleLogSpy = vi.spyOn(console, "log");

      // Execute migration
      await storage.migrateFromLocalStorage();

      // Verify: Data should be in IndexedDB (unwrapped from versioned format)
      const loaded = await storage.load();
      expect(loaded).toEqual(mockCharacter);

      // Verify: Migration message was logged
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Migrating from old versioned format to IndexedDB"
      );

      // Verify: Data should be removed from localStorage
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

      // Verify: Success message was logged
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Successfully migrated character data from localStorage to IndexedDB"
      );

      consoleLogSpy.mockRestore();
    });

    it("should handle migration when localStorage is empty", async () => {
      // Execute migration with no localStorage data
      await expect(storage.migrateFromLocalStorage()).resolves.toBeUndefined();

      // Verify: No data in IndexedDB
      const loaded = await storage.load();
      expect(loaded).toBeNull();
    });

    it("should handle corrupted localStorage data gracefully", async () => {
      // Setup: Store corrupted data in localStorage
      localStorage.setItem(STORAGE_KEY, "invalid json{");

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Execute migration - should not throw
      await expect(storage.migrateFromLocalStorage()).resolves.toBeUndefined();

      // Verify: Error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to parse localStorage data during migration:",
        expect.any(Error)
      );

      // Verify: No data in IndexedDB (migration skipped)
      const loaded = await storage.load();
      expect(loaded).toBeNull();

      // Verify: Corrupted data remains in localStorage (not removed since migration failed)
      expect(localStorage.getItem(STORAGE_KEY)).toBe("invalid json{");

      consoleErrorSpy.mockRestore();
    });

    it("should not fail the app if migration fails", async () => {
      // Setup: Valid data in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCharacter));

      // Mock IndexedDB saveInternal to fail
      const originalSaveInternal = (storage as any).saveInternal.bind(storage);
      (storage as any).saveInternal = vi.fn().mockRejectedValue(new Error("Save failed"));

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Execute migration - should not throw despite save failure
      await expect(storage.migrateFromLocalStorage()).resolves.toBeUndefined();

      // Verify: Error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to migrate from localStorage:",
        expect.any(Error)
      );

      // Restore
      (storage as any).saveInternal = originalSaveInternal;
      consoleErrorSpy.mockRestore();
    });

    it("should handle migration when IndexedDB already has data", async () => {
      // Setup: Data in both localStorage and IndexedDB
      const existingCharacter = { ...mockCharacter, name: "Existing in IndexedDB" };
      await storage.save(existingCharacter);

      const localStorageCharacter = { ...mockCharacter, name: "From localStorage" };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localStorageCharacter));

      // Execute migration
      await storage.migrateFromLocalStorage();

      // Verify: localStorage data should overwrite IndexedDB data
      const loaded = await storage.load();
      expect(loaded.name).toBe("From localStorage");

      // Verify: localStorage data should be removed
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("should handle saving complex nested objects", async () => {
      const complexCharacter = {
        ...mockCharacter,
        attacks: [
          { name: "Sword", modifier: 2 },
          { name: "Crossbow", modifier: 1 },
        ],
        cyphers: [
          { name: "Cypher 1", level: 3 },
          { name: "Cypher 2", level: 5 },
        ],
      };

      await storage.save(complexCharacter);
      const loaded = await storage.load();
      expect(loaded).toEqual(complexCharacter);
    });

    it("should handle saving null values in character data", async () => {
      const characterWithNulls = {
        ...mockCharacter,
        optionalField: null,
      };

      await storage.save(characterWithNulls);
      const loaded = await storage.load();
      expect(loaded).toEqual(characterWithNulls);
    });

    it("should handle multiple rapid save operations", async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        const char = { ...mockCharacter, name: `Character ${i}` };
        promises.push(storage.save(char));
      }

      await Promise.all(promises);

      // Last save should win
      const loaded = await storage.load();
      expect(loaded.name).toMatch(/Character \d/);
    });
  });
});
