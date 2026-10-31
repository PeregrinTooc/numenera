import { describe, it, expect } from "vitest";
import { ExportManager } from "@/storage/exportManager";
import {
  mockCharacter,
  setupExportTest,
  setupDownloadTest,
  setupExportManager,
} from "./helpers/exportManagerFixture";

describe("ExportManager", () => {
  const ctx = setupExportManager();

  describe("clearRememberedLocation()", () => {
    it("should clear stored file handle", async () => {
      setupExportTest();

      await ctx.exportManager.export(mockCharacter);
      expect(ctx.exportManager.hasRememberedLocation()).toBe(true);

      ctx.exportManager.clearRememberedLocation();

      expect(ctx.exportManager.hasRememberedLocation()).toBe(false);
    });

    it("should dispatch handle-updated event", () => {
      const eventSpy = vi.fn();
      window.addEventListener("export-handle-updated", eventSpy);

      ctx.exportManager.clearRememberedLocation();

      expect(eventSpy).toHaveBeenCalled();
    });

    it("should remove the persisted handle from IndexedDB, not just localStorage", async () => {
      setupExportTest();

      await ctx.exportManager.export(mockCharacter);
      expect(ctx.idbStore.has("lastExportFileHandle")).toBe(true);

      ctx.exportManager.clearRememberedLocation();
      await Promise.resolve();
      await Promise.resolve();

      expect(ctx.idbStore.has("lastExportFileHandle")).toBe(false);

      // A fresh manager reloading from IndexedDB should no longer see it.
      const reloaded = new ExportManager();
      await Promise.resolve();
      await Promise.resolve();
      expect(reloaded.hasRememberedLocation()).toBe(false);
    });
  });

  describe("Filename Generation", () => {
    it("should generate filename from character name", async () => {
      const { mockLink } = setupDownloadTest();

      await ctx.exportManager.export(mockCharacter);

      expect(mockLink.download).toBe("glaive-warrior.numenera");
    });

    it("should sanitize special characters in filename", async () => {
      const specialCharacter = { ...mockCharacter };
      specialCharacter.name = "Test@Character #1";

      const { mockLink } = setupDownloadTest();

      await ctx.exportManager.export(specialCharacter);

      expect(mockLink.download).toBe("testcharacter-1.numenera");
    });

    it("should use .numenera extension", async () => {
      const { mockLink } = setupDownloadTest();

      await ctx.exportManager.export(mockCharacter);

      expect(mockLink.download).toMatch(/\.numenera$/);
    });
  });
});
