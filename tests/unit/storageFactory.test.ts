import { describe, it, expect, vi, afterEach } from "vitest";
import { getVersionHistory, loadCharacterState } from "@/storage/storageFactory";
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
