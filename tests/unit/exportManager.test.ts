import { describe, it, expect, vi } from "vitest";
import { ExportManager } from "@/storage/exportManager";
import {
  mockCharacter,
  createMockHandle,
  setupExportTest,
  setupDownloadTest,
  expectValidFileStructure,
  setupExportManager,
} from "./helpers/exportManagerFixture";

describe("ExportManager", () => {
  const ctx = setupExportManager();

  describe("Feature Detection", () => {
    it("should detect File System Access API support", () => {
      window.showSaveFilePicker = vi.fn();

      expect(ctx.exportManager.supportsFileSystemAccess()).toBe(true);
    });

    it("should return false when API not available", () => {
      delete window.showSaveFilePicker;

      expect(ctx.exportManager.supportsFileSystemAccess()).toBe(false);
    });

    it("should detect remembered location exists", async () => {
      const mockHandle = createMockHandle();
      ctx.idbStore.set("lastExportFileHandle", mockHandle);

      // Recreate manager to load from IDB
      ctx.exportManager = new ExportManager();

      // Wait for all microtasks to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(ctx.exportManager.hasRememberedLocation()).toBe(true);
    });

    it("should detect no remembered location on first use", () => {
      expect(ctx.exportManager.hasRememberedLocation()).toBe(false);
    });
  });

  describe("export() - First Time Export", () => {
    it("should prompt for location on first export in Chromium", async () => {
      setupExportTest();

      await ctx.exportManager.export(mockCharacter);

      expect(window.showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: "glaive-warrior.numenera",
        types: [
          {
            description: "Numenera Character Files",
            accept: { "application/json": [".numenera"] },
          },
        ],
      });
    });

    it("should save file to selected location", async () => {
      const { mockHandle } = setupExportTest();
      const writableMock = await mockHandle.createWritable();

      await ctx.exportManager.export(mockCharacter);

      expect(mockHandle.createWritable).toHaveBeenCalled();

      // Verify the written data has valid structure
      const writtenData = vi.mocked(writableMock.write).mock.calls[0][0] as string;
      const parsed = expectValidFileStructure(writtenData);
      expect(parsed.character.name).toBe("Glaive Warrior");

      expect(writableMock.close).toHaveBeenCalled();
    });

    it("should remember file handle after first export", async () => {
      setupExportTest();

      await ctx.exportManager.export(mockCharacter);

      expect(ctx.exportManager.hasRememberedLocation()).toBe(true);
    });

    it("should dispatch handle-updated event after first export", async () => {
      setupExportTest();

      const eventSpy = vi.fn();
      window.addEventListener("export-handle-updated", eventSpy);

      await ctx.exportManager.export(mockCharacter);

      expect(eventSpy).toHaveBeenCalled();
    });

    it("should handle user cancellation gracefully", async () => {
      window.showSaveFilePicker = vi
        .fn()
        .mockRejectedValue(new DOMException("User cancelled", "AbortError"));

      // Should not throw
      await ctx.exportManager.export(mockCharacter);

      expect(ctx.exportManager.hasRememberedLocation()).toBe(false);
    });

    it("should use fallback download in non-Chromium browsers", async () => {
      const { mockLink } = setupDownloadTest();

      await ctx.exportManager.export(mockCharacter);

      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toBe("glaive-warrior.numenera");
    });

    it("appends the download link to the document before clicking and removes it after, for the Firefox fallback", async () => {
      const { mockLink, appendChildSpy, removeChildSpy } = setupDownloadTest();

      await ctx.exportManager.export(mockCharacter);

      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);

      const appendOrder = appendChildSpy.mock.invocationCallOrder[0];
      const clickOrder = mockLink.click.mock.invocationCallOrder[0];
      const removeOrder = removeChildSpy.mock.invocationCallOrder[0];
      expect(appendOrder).toBeLessThan(clickOrder);
      expect(clickOrder).toBeLessThan(removeOrder);
    });

    it("revokes the object URL asynchronously, so Firefox has time to start the download", async () => {
      vi.useFakeTimers();
      try {
        const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
        setupDownloadTest();

        await ctx.exportManager.export(mockCharacter);

        expect(revokeSpy).not.toHaveBeenCalled();
        vi.runAllTimers();
        expect(revokeSpy).toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
