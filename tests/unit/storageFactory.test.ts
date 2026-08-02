import { describe, it, expect, vi, afterEach } from "vitest";
import { getVersionHistory, loadCharacterState } from "../../src/storage/storageFactory.js";
import { VersionHistoryManager } from "../../src/storage/versionHistory.js";
import { IndexedDBStorageImpl } from "../../src/storage/indexedDBStorageImpl.js";

describe("storageFactory", () => {
  describe("loadCharacterState", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("migrates a legacy xp-only character to currentXp/totalXp on load", async () => {
      const legacyCharacter = { xp: 12 } as any;
      vi.spyOn(IndexedDBStorageImpl.prototype, "load").mockResolvedValue(legacyCharacter);

      const result = await loadCharacterState();

      expect(result.currentXp).toBe(12);
      expect(result.totalXp).toBe(12);
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
