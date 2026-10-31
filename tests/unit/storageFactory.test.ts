import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getVersionHistory,
  loadCharacterState,
  persistCharacterState,
} from "@/storage/storageFactory";
import { STORAGE_WRITE_FAILED_EVENT } from "@/storage/storageWriteFailure";
import { NEW_CHARACTER } from "@/data/mockCharacters";
import { VersionHistoryManager } from "@/storage/versionHistory";
import { IndexedDBStorageImpl } from "@/storage/indexedDBStorageImpl";

describe("storageFactory", () => {
  describe("loadCharacterState", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("migrates a legacy xp-only character to currentXp/totalXp on load", async () => {
      const legacyCharacter: unknown = { xp: 12 };
      vi.spyOn(IndexedDBStorageImpl.prototype, "load").mockResolvedValue(legacyCharacter);

      const result = await loadCharacterState();

      expect(result).not.toBeNull();
      expect(result?.currentXp).toBe(12);
      expect(result?.totalXp).toBe(12);
    });

    it("returns null without sanitizing when nothing is stored", async () => {
      vi.spyOn(IndexedDBStorageImpl.prototype, "load").mockResolvedValue(null);

      const result = await loadCharacterState();

      expect(result).toBeNull();
    });
  });

  describe("persistCharacterState", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("dispatches storage-write-failed when the write is rejected", async () => {
      vi.spyOn(IndexedDBStorageImpl.prototype, "save").mockRejectedValue(
        new DOMException("full", "QuotaExceededError")
      );
      vi.spyOn(console, "error").mockImplementation(() => {});
      const received = new Promise<CustomEvent>((resolve) => {
        window.addEventListener(STORAGE_WRITE_FAILED_EVENT, (e) => resolve(e as CustomEvent), {
          once: true,
        });
      });

      persistCharacterState(NEW_CHARACTER);

      expect((await received).detail).toEqual({ reason: "quota" });
    });
  });

  describe("getVersionHistory", () => {
    it("does not hand a concurrent caller a manager before init() resolves", async () => {
      let resolveInit!: () => void;
      const initGate = new Promise<void>((resolve) => {
        resolveInit = resolve;
      });
      const initSpy = vi.spyOn(VersionHistoryManager.prototype, "init").mockReturnValue(initGate);

      const first = getVersionHistory();
      const second = getVersionHistory();

      let secondSettled = false;
      second.then(() => {
        secondSettled = true;
      });

      // Let any pending microtasks run. With the old code, the second caller
      // returns the instance synchronously once it exists — before init()
      // resolves — so it would already be settled here.
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      expect(secondSettled).toBe(false);

      resolveInit();
      const [managerA, managerB] = await Promise.all([first, second]);

      expect(managerA).toBe(managerB);
      expect(initSpy).toHaveBeenCalledTimes(1);

      initSpy.mockRestore();
    });
  });
});
