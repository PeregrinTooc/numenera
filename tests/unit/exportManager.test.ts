import { describe, it, expect, vi, afterEach } from "vitest";
import { changeLanguage } from "@/i18n/index";
import { ExportManager } from "@/storage/exportManager";
import { saveSectionColumns } from "@/storage/layoutStorage";
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
      await ctx.seedPersistedHandle(mockHandle);

      ctx.exportManager = new ExportManager();

      await vi.waitFor(() => expect(ctx.exportManager.hasRememberedLocation()).toBe(true));
    });

    it("should detect no remembered location on first use", () => {
      expect(ctx.exportManager.hasRememberedLocation()).toBe(false);
    });
  });

  describe("export() - First Time Export", () => {
    afterEach(async () => {
      await changeLanguage("en");
    });

    it("labels the file type in the current language", async () => {
      await changeLanguage("de");
      setupExportTest();

      await ctx.exportManager.export(mockCharacter);

      expect(window.showSaveFilePicker).toHaveBeenCalledWith(
        expect.objectContaining({
          types: [expect.objectContaining({ description: "Numenera-Charakterdateien" })],
        })
      );
    });

    it("should prompt for location on first export in Chromium", async () => {
      setupExportTest();

      await ctx.exportManager.export(mockCharacter);

      expect(window.showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: "glaive-warrior.numenera",
        types: [
          {
            description: "Numenera character files",
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

      const writtenData = vi.mocked(writableMock.write).mock.calls[0][0] as string;
      const parsed = expectValidFileStructure(writtenData);
      expect(parsed.character.name).toBe("Glaive Warrior");

      expect(writableMock.close).toHaveBeenCalled();
    });

    it("writes the stored column choices into the file", async () => {
      saveSectionColumns({ cyphers: 1 });
      const { mockHandle } = setupExportTest();
      const writableMock = await mockHandle.createWritable();

      await ctx.exportManager.export(mockCharacter);

      const writtenData = vi.mocked(writableMock.write).mock.calls[0][0] as string;
      const parsed = expectValidFileStructure(writtenData);
      expect(parsed.sectionColumns).toEqual({ cyphers: 1 });
      localStorage.clear();
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

      await ctx.exportManager.export(mockCharacter);

      expect(ctx.exportManager.hasRememberedLocation()).toBe(false);
    });

    it("should use fallback download in non-Chromium browsers", async () => {
      const { downloads, contentOf } = setupDownloadTest();

      await ctx.exportManager.export(mockCharacter);

      expect(downloads).toHaveLength(1);
      expect(downloads[0].filename).toBe("glaive-warrior.numenera");
      const parsed = expectValidFileStructure(await contentOf(downloads[0]));
      expect(parsed.character.name).toBe("Glaive Warrior");
    });

    it("has the download link in the document when clicking and removes it after, for the Firefox fallback", async () => {
      const { downloads } = setupDownloadTest();

      await ctx.exportManager.export(mockCharacter);

      expect(downloads[0].connected).toBe(true);
      expect(document.querySelector("a[download]")).toBeNull();
    });

    it("revokes the object URL asynchronously, so Firefox has time to start the download", async () => {
      vi.useFakeTimers({ toFake: ["setTimeout"] });
      try {
        const { downloads, revokeSpy } = setupDownloadTest();

        await ctx.exportManager.export(mockCharacter);

        expect(revokeSpy).not.toHaveBeenCalledWith(downloads[0].href);
        vi.runAllTimers();
        expect(revokeSpy).toHaveBeenCalledWith(downloads[0].href);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
