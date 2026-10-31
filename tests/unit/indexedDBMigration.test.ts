import { describe, it, expect, vi } from "vitest";
import type { Character } from "@/types/character";
import { STORAGE_KEY } from "@/storage/storageConstants";
import {
  mockCharacter,
  oldVersionedFormat,
  internalsOf,
  setupIndexedDBStorage,
} from "./helpers/indexedDBStorageFixture";

describe("IndexedDBStorageImpl", () => {
  const ctx = setupIndexedDBStorage();

  describe("migrateFromLocalStorage", () => {
    it("should not overwrite an existing IndexedDB record with stale localStorage data", async () => {
      // Setup: IndexedDB already holds the authoritative character...
      await ctx.storage.save({ ...mockCharacter, currentXp: 50 });
      // ...while a stale copy lingers in localStorage from an earlier session.
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...mockCharacter, currentXp: 5 }));

      // Execute migration, as happens on every page load
      await ctx.storage.migrateFromLocalStorage();

      // Verify: the newer IndexedDB record wins
      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded.currentXp).toBe(50);

      // Verify: the stale copy is cleared so it cannot resurface
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("should migrate data from localStorage to IndexedDB (new format)", async () => {
      // Setup: Store data in localStorage (new raw format)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCharacter));

      // Execute migration
      await ctx.storage.migrateFromLocalStorage();

      // Verify: Data should be in IndexedDB
      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded).toEqual(mockCharacter);

      // Verify: Data should be removed from localStorage
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("should migrate data from localStorage to IndexedDB (old versioned format)", async () => {
      // Setup: Store data in localStorage (old versioned format)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(oldVersionedFormat));

      // Spy on console.info to verify migration message (logger.info, dev builds)
      const consoleLogSpy = vi.spyOn(console, "info");

      // Execute migration
      await ctx.storage.migrateFromLocalStorage();

      // Verify: Data should be in IndexedDB (unwrapped from versioned format)
      const loaded = (await ctx.storage.load()) as Character;
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
      await expect(ctx.storage.migrateFromLocalStorage()).resolves.toBeUndefined();

      // Verify: No data in IndexedDB
      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded).toBeNull();
    });

    it("should handle corrupted localStorage data gracefully", async () => {
      // Setup: Store corrupted data in localStorage
      localStorage.setItem(STORAGE_KEY, "invalid json{");

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Execute migration - should not throw
      await expect(ctx.storage.migrateFromLocalStorage()).resolves.toBeUndefined();

      // Verify: Error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to parse localStorage data during migration:",
        expect.any(Error)
      );

      // Verify: No data in IndexedDB (migration skipped)
      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded).toBeNull();

      // Verify: Corrupted data remains in localStorage (not removed since migration failed)
      expect(localStorage.getItem(STORAGE_KEY)).toBe("invalid json{");

      consoleErrorSpy.mockRestore();
    });

    it("should not fail the app if migration fails", async () => {
      // Setup: Valid data in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCharacter));

      // Mock IndexedDB saveInternal to fail
      const internals = internalsOf(ctx.storage);
      const originalSaveInternal = internals.saveInternal.bind(ctx.storage);
      internals.saveInternal = vi.fn().mockRejectedValue(new Error("Save failed"));

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Execute migration - should not throw despite save failure
      await expect(ctx.storage.migrateFromLocalStorage()).resolves.toBeUndefined();

      // Verify: Error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to migrate from localStorage:",
        expect.any(Error)
      );

      // Restore
      internals.saveInternal = originalSaveInternal;
      consoleErrorSpy.mockRestore();
    });

    it("should handle migration when IndexedDB already has data", async () => {
      // Setup: Data in both localStorage and IndexedDB
      const existingCharacter = { ...mockCharacter, name: "Existing in IndexedDB" };
      await ctx.storage.save(existingCharacter);

      const localStorageCharacter = { ...mockCharacter, name: "From localStorage" };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localStorageCharacter));

      // Execute migration
      await ctx.storage.migrateFromLocalStorage();

      // Verify: IndexedDB is authoritative once populated. This assertion was
      // previously inverted — it expected localStorage to win, which is the
      // data-loss path: migration runs on every page load, so a stale
      // localStorage entry would silently revert newer IndexedDB data.
      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded.name).toBe("Existing in IndexedDB");

      // Verify: localStorage data should be removed
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
