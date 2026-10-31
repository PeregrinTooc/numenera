import { describe, it, expect, vi } from "vitest";
import type { Character } from "@/types/character";
import { STORAGE_KEY } from "@/storage/storageConstants";
import {
  mockCharacter,
  replaceDbWithoutObjectStore,
  setupIndexedDBStorage,
} from "./helpers/indexedDBStorageFixture";

describe("IndexedDBStorageImpl", () => {
  const ctx = setupIndexedDBStorage();

  describe("edge cases", () => {
    it("should handle saving complex nested objects", async () => {
      const complexCharacter = {
        ...mockCharacter,
        attacks: [
          { name: "Sword", damage: 5, modifier: 2, range: "Immediate" },
          { name: "Crossbow", damage: 4, modifier: 1, range: "Long" },
        ],
        cyphers: [
          { name: "Cypher 1", level: "3", effect: "Effect 1" },
          { name: "Cypher 2", level: "5", effect: "Effect 2" },
        ],
      };

      await ctx.storage.save(complexCharacter);
      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded).toEqual(complexCharacter);
    });

    it("should handle saving null values in character data", async () => {
      const characterWithNulls = {
        ...mockCharacter,
        optionalField: null,
      };

      await ctx.storage.save(characterWithNulls);
      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded).toEqual(characterWithNulls);
    });

    it("should handle multiple rapid save operations", async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        const char = { ...mockCharacter, name: `Character ${i}` };
        promises.push(ctx.storage.save(char));
      }

      await Promise.all(promises);

      // Last save should win
      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded.name).toMatch(/Character \d/);
    });
  });

  describe("object store validation", () => {
    it("should skip migration gracefully when object store does not exist", async () => {
      // Setup: Store data in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCharacter));

      // Create a mock that simulates missing object store
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Mock objectStoreNames to not contain the store
      const restoreDb = replaceDbWithoutObjectStore(ctx.storage);

      // Execute migration - should skip gracefully, not throw
      await expect(ctx.storage.migrateFromLocalStorage()).resolves.toBeUndefined();

      // Verify: Warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "IndexedDB not ready for migration, skipping localStorage migration"
      );

      // Verify: localStorage data was NOT removed (migration was skipped)
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

      // Restore
      restoreDb();
      consoleWarnSpy.mockRestore();
    });

    it("should throw when save is called and object store does not exist", async () => {
      // Mock objectStoreNames to not contain the store
      const restoreDb = replaceDbWithoutObjectStore(ctx.storage);

      // Execute - should throw error for save
      await expect(ctx.storage.save(mockCharacter)).rejects.toThrow(
        "Object store 'characters' not found in database"
      );

      // Restore
      restoreDb();
    });

    it("should throw when load is called and object store does not exist", async () => {
      // Mock objectStoreNames to not contain the store
      const restoreDb = replaceDbWithoutObjectStore(ctx.storage);

      // Execute - should throw error for load
      await expect(ctx.storage.load()).rejects.toThrow(
        "Object store 'characters' not found in database"
      );

      // Restore
      restoreDb();
    });

    it("should throw when clear is called and object store does not exist", async () => {
      // Mock objectStoreNames to not contain the store
      const restoreDb = replaceDbWithoutObjectStore(ctx.storage);

      // Execute - should throw error for clear
      await expect(ctx.storage.clear()).rejects.toThrow(
        "Object store 'characters' not found in database"
      );

      // Restore
      restoreDb();
    });
  });
});
