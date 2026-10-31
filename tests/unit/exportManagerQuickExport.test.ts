import { describe, it, expect, vi } from "vitest";
import {
  mockCharacter,
  createMockHandle,
  createMockWritable,
  setupExportTest,
  setupExportManager,
} from "./helpers/exportManagerFixture";

describe("ExportManager", () => {
  const ctx = setupExportManager();

  describe("quickExport()", () => {
    it("should throw error if no remembered location", async () => {
      await expect(ctx.exportManager.quickExport(mockCharacter)).rejects.toMatchObject({
        messageKey: "errors.noRememberedLocation",
      });
    });

    it("should save to remembered location without prompting", async () => {
      const { mockHandle } = setupExportTest();

      // First export to set handle
      await ctx.exportManager.export(mockCharacter);

      // Wait for IndexedDB operations to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify the handle is stored
      expect(ctx.exportManager.hasRememberedLocation()).toBe(true);

      // Clear showSaveFilePicker mock to verify it's not called again
      vi.mocked(window.showSaveFilePicker!).mockClear();

      // Quick export should not prompt and should use the remembered handle
      await ctx.exportManager.quickExport(mockCharacter);

      expect(window.showSaveFilePicker).not.toHaveBeenCalled();
      // Verify createWritable was called (will be called twice total: once in export, once in quickExport)
      expect(mockHandle.createWritable).toHaveBeenCalledTimes(2);
    });

    it("should dispatch success event after quick export", async () => {
      const _mockHandle = createMockHandle("test.json");
      window.showSaveFilePicker = vi.fn().mockResolvedValue(_mockHandle);

      await ctx.exportManager.export(mockCharacter);
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Reset the event spy after export
      const eventSpy = vi.fn();
      window.addEventListener("export-success", eventSpy);

      await ctx.exportManager.quickExport(mockCharacter);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { filename: "test.json" },
        })
      );
    });

    it("should handle write permission denied", async () => {
      const mockHandle = createMockHandle();
      // Set up the write mock to fail on the second call
      const writableMock = createMockWritable(
        vi
          .fn()
          .mockResolvedValueOnce(undefined) // First call succeeds (export)
          .mockRejectedValueOnce(new DOMException("Permission denied", "NotAllowedError")) // Second call fails (quickExport)
      );
      vi.mocked(mockHandle.createWritable).mockResolvedValue(writableMock);
      window.showSaveFilePicker = vi.fn().mockResolvedValue(mockHandle);

      await ctx.exportManager.export(mockCharacter);
      await new Promise((resolve) => setTimeout(resolve, 10));

      await expect(ctx.exportManager.quickExport(mockCharacter)).rejects.toMatchObject({
        messageKey: "errors.permissionDenied",
      });
    });

    it("should handle disk full error", async () => {
      const mockHandle = createMockHandle();
      // Set up the write mock to fail on the second call
      const writableMock = createMockWritable(
        vi
          .fn()
          .mockResolvedValueOnce(undefined) // First call succeeds (export)
          .mockRejectedValueOnce(new DOMException("Disk full", "QuotaExceededError")) // Second call fails (quickExport)
      );
      vi.mocked(mockHandle.createWritable).mockResolvedValue(writableMock);
      window.showSaveFilePicker = vi.fn().mockResolvedValue(mockHandle);

      await ctx.exportManager.export(mockCharacter);
      await new Promise((resolve) => setTimeout(resolve, 10));

      await expect(ctx.exportManager.quickExport(mockCharacter)).rejects.toMatchObject({
        messageKey: "errors.diskFull",
      });
    });
  });

  describe("saveAs()", () => {
    it("should always prompt for new location", async () => {
      const mockHandle1 = createMockHandle("file1.json");
      const mockHandle2 = createMockHandle("file2.json");

      window.showSaveFilePicker = vi
        .fn()
        .mockResolvedValueOnce(mockHandle1)
        .mockResolvedValueOnce(mockHandle2);

      await ctx.exportManager.export(mockCharacter);

      // Save As should prompt again
      await ctx.exportManager.saveAs(mockCharacter);

      expect(window.showSaveFilePicker).toHaveBeenCalledTimes(2);
    });

    it("should update remembered handle after Save As", async () => {
      const mockHandle1 = createMockHandle("file1.json");
      const mockHandle2 = createMockHandle("file2.json");
      const writable2 = await mockHandle2.createWritable();

      window.showSaveFilePicker = vi
        .fn()
        .mockResolvedValueOnce(mockHandle1)
        .mockResolvedValueOnce(mockHandle2);

      await ctx.exportManager.export(mockCharacter);
      await ctx.exportManager.saveAs(mockCharacter);

      // Clear mocks
      vi.mocked(window.showSaveFilePicker!).mockClear();
      vi.mocked(writable2.write).mockClear();

      // Quick export should now use handle2
      await ctx.exportManager.quickExport(mockCharacter);

      expect(window.showSaveFilePicker).not.toHaveBeenCalled();
      expect(mockHandle2.createWritable).toHaveBeenCalled();
    });

    it("should dispatch handle-updated event", async () => {
      const mockHandle = createMockHandle();
      window.showSaveFilePicker = vi.fn().mockResolvedValue(mockHandle);

      const eventSpy = vi.fn();
      window.addEventListener("export-handle-updated", eventSpy);

      await ctx.exportManager.saveAs(mockCharacter);

      expect(eventSpy).toHaveBeenCalled();
    });
  });
});
