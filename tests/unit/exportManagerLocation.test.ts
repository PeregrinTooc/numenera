import { describe, it, expect, vi } from "vitest";
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
      expect(await ctx.hasPersistedHandle()).toBe(true);

      ctx.exportManager.clearRememberedLocation();

      await vi.waitFor(async () => expect(await ctx.hasPersistedHandle()).toBe(false));

      // A fresh manager reloading from IndexedDB should no longer see it.
      const reloaded = new ExportManager(ctx.clock);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(reloaded.hasRememberedLocation()).toBe(false);
    });
  });

  describe("Filename Generation", () => {
    it("should generate filename from character name", async () => {
      const { downloads } = setupDownloadTest();

      await ctx.exportManager.export(mockCharacter);

      expect(downloads[0].filename).toBe("glaive-warrior.numenera");
    });

    it("should sanitize special characters in filename", async () => {
      const specialCharacter = { ...mockCharacter };
      specialCharacter.name = "Test@Character #1";

      const { downloads } = setupDownloadTest();

      await ctx.exportManager.export(specialCharacter);

      expect(downloads[0].filename).toBe("testcharacter-1.numenera");
    });

    it("should use .numenera extension", async () => {
      const { downloads } = setupDownloadTest();

      await ctx.exportManager.export(mockCharacter);

      expect(downloads[0].filename).toMatch(/\.numenera$/);
    });
  });
});
