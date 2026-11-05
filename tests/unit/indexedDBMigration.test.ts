import { describe, it, expect, vi } from "vitest";
import type { Character } from "@/types/character";
import { abortWriteTransactions } from "./helpers/abortingTransaction";
import { STORAGE_KEY } from "@/storage/storageConstants";
import {
  mockCharacter,
  oldVersionedFormat,
  setupIndexedDBStorage,
} from "./helpers/indexedDBStorageFixture";

describe("IndexedDBStorageImpl", () => {
  const ctx = setupIndexedDBStorage();

  describe("migrateFromLocalStorage", () => {
    it("should not overwrite an existing IndexedDB record with stale localStorage data", async () => {
      await ctx.storage.save({ ...mockCharacter, currentXp: 50 });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...mockCharacter, currentXp: 5 }));

      await ctx.storage.migrateFromLocalStorage();

      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded.currentXp).toBe(50);

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("should migrate data from localStorage to IndexedDB (new format)", async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCharacter));

      await ctx.storage.migrateFromLocalStorage();

      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded).toEqual(mockCharacter);

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("should migrate data from localStorage to IndexedDB (old versioned format)", async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(oldVersionedFormat));

      // Spy on console.info to verify migration message (logger.info, dev builds)
      const consoleLogSpy = vi.spyOn(console, "info");

      await ctx.storage.migrateFromLocalStorage();

      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded).toEqual(mockCharacter);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Migrating from old versioned format to IndexedDB"
      );

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Successfully migrated character data from localStorage to IndexedDB"
      );

      consoleLogSpy.mockRestore();
    });

    it("should handle migration when localStorage is empty", async () => {
      await expect(ctx.storage.migrateFromLocalStorage()).resolves.toBeUndefined();

      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded).toBeNull();
    });

    it("should keep unparseable localStorage text as the stored value instead of dropping it", async () => {
      localStorage.setItem(STORAGE_KEY, "invalid json{");

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(ctx.storage.migrateFromLocalStorage()).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to parse localStorage data during migration:",
        expect.any(Error)
      );

      // Verify: the raw text is adopted as-is so the app can back it up (a later load would
      // otherwise discard the stale localStorage copy and lose it)
      expect(await ctx.storage.load()).toBe("invalid json{");
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it("should not fail the app if migration fails", async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCharacter));

      // The browser aborts the write transaction
      abortWriteTransactions(new DOMException("write failed", "AbortError"));

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(ctx.storage.migrateFromLocalStorage()).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to migrate from localStorage:",
        expect.objectContaining({ name: "AbortError" })
      );

      consoleErrorSpy.mockRestore();
      vi.restoreAllMocks();
    });

    it("should handle migration when IndexedDB already has data", async () => {
      const existingCharacter = { ...mockCharacter, name: "Existing in IndexedDB" };
      await ctx.storage.save(existingCharacter);

      const localStorageCharacter = { ...mockCharacter, name: "From localStorage" };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localStorageCharacter));

      await ctx.storage.migrateFromLocalStorage();

      // IndexedDB is authoritative once populated: migration runs on every
      // page load, so a stale localStorage entry must not revert newer data.
      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded.name).toBe("Existing in IndexedDB");

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
