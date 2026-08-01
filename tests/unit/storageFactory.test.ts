import { describe, it, expect, vi } from "vitest";
import { getVersionHistory } from "../../src/storage/storageFactory.js";
import { VersionHistoryManager } from "../../src/storage/versionHistory.js";

describe("storageFactory", () => {
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
