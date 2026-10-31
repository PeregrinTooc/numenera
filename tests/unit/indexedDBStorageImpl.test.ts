import { describe, it, expect, vi } from "vitest";
import { IndexedDBStorageImpl } from "@/storage/indexedDBStorageImpl";
import type { Character } from "@/types/character";
import { mockCharacter, setupIndexedDBStorage } from "./helpers/indexedDBStorageFixture";

describe("IndexedDBStorageImpl", () => {
  const ctx = setupIndexedDBStorage();

  describe("isAvailable", () => {
    it("should return true when IndexedDB is available", async () => {
      const result = await ctx.storage.isAvailable();
      expect(result).toBe(true);
    });

    it("should report unavailable when opening the probe database never completes", async () => {
      const openSpy = vi
        .spyOn(indexedDB, "open")
        .mockReturnValue({} as unknown as IDBOpenDBRequest);

      const result = await ctx.storage.isAvailable();

      expect(result).toBe(false);
      openSpy.mockRestore();
    });

    it("should handle environment without IndexedDB", async () => {
      const originalIndexedDB = global.indexedDB;
      // @ts-expect-error - Testing undefined scenario
      delete global.indexedDB;

      const result = await ctx.storage.isAvailable();
      expect(result).toBe(false);

      // Restore
      global.indexedDB = originalIndexedDB;
    });
  });

  describe("init", () => {
    it("should initialize IndexedDB successfully", async () => {
      await expect(ctx.storage.init()).resolves.toBeUndefined();
    });

    it("should create the object store on first initialization", async () => {
      await ctx.storage.init();
      // Verify by checking if we can perform operations
      await expect(ctx.storage.save(mockCharacter)).resolves.toBeUndefined();
    });
  });

  describe("save and load", () => {
    it("should save and load character data", async () => {
      await ctx.storage.save(mockCharacter);
      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded).toEqual(mockCharacter);
    });

    it("should request an explicit commit so a save issued during unload is not left pending", async () => {
      const commitSpy = vi.spyOn(globalThis.IDBTransaction.prototype, "commit");

      await ctx.storage.save(mockCharacter);

      expect(commitSpy).toHaveBeenCalled();
      commitSpy.mockRestore();
    });

    it("should return null when no data is stored", async () => {
      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded).toBeNull();
    });

    it("should overwrite existing data when saving", async () => {
      await ctx.storage.save(mockCharacter);
      const updatedCharacter = { ...mockCharacter, name: "Updated Character" };
      await ctx.storage.save(updatedCharacter);
      const loaded = (await ctx.storage.load()) as Character;
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
      await ctx.storage.save(mockCharacter);
      await ctx.storage.clear();
      const loaded = (await ctx.storage.load()) as Character;
      expect(loaded).toBeNull();
    });

    it("should handle clearing when no data exists", async () => {
      await expect(ctx.storage.clear()).resolves.toBeUndefined();
    });

    it("should throw error when clearing without initialization", async () => {
      const uninitializedStorage = new IndexedDBStorageImpl();
      await expect(uninitializedStorage.clear()).rejects.toThrow("IndexedDB not initialized");
    });
  });
});
