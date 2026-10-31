import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockCharacter,
  createMockVersion,
  setupVersionState,
} from "./helpers/versionStateFixture";

describe("VersionState restore and lookup", () => {
  const fx = setupVersionState();

  describe("restoreToLatest", () => {
    it("should restore to latest version", async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);
      await fx.versionState.init();

      await fx.versionState.navigateBackward();
      expect(fx.versionState.isViewingOldVersion()).toBe(true);

      fx.versionState.restoreToLatest();

      expect(fx.versionState.isViewingOldVersion()).toBe(false);
      expect(fx.versionState.getCurrentVersionIndex()).toBe(1);
    });
  });

  describe("restoreCurrentVersion", () => {
    it("should keep the current portrait on the new latest character", async () => {
      fx.versionState.setLatestCharacter({
        ...fx.mockCharacter,
        portrait: "data:image/png;base64,AAAA",
      });
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);
      await fx.versionState.init();
      await fx.versionState.navigateBackward();

      await fx.versionState.restoreCurrentVersion();

      expect(fx.versionState.getLatestCharacter().portrait).toBe("data:image/png;base64,AAAA");
      expect(fx.versionState.getLatestCharacter().name).toBe("Version 1");
    });
  });

  describe("setLatestCharacter", () => {
    it("should update latest character", () => {
      const newCharacter = createMockCharacter("Updated Character");

      fx.versionState.setLatestCharacter(newCharacter);

      expect(fx.versionState.getLatestCharacter()).toBe(newCharacter);
    });

    it("should update displayed character when viewing latest", () => {
      const newCharacter = createMockCharacter("Updated Character");

      fx.versionState.setLatestCharacter(newCharacter);

      expect(fx.versionState.getDisplayedCharacter()).toBe(newCharacter);
    });

    it("should not update displayed character when viewing old version", async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);
      await fx.versionState.init();
      await fx.versionState.navigateBackward();

      const newCharacter = createMockCharacter("Updated Character");
      fx.versionState.setLatestCharacter(newCharacter);

      expect(fx.versionState.getLatestCharacter()).toBe(newCharacter);
      expect(fx.versionState.getDisplayedCharacter()).not.toBe(newCharacter);
      expect(fx.versionState.getDisplayedCharacter().name).toBe("Version 1");
    });
  });

  describe("reload", () => {
    it("should reload versions from storage", async () => {
      const timestamp = Date.now();
      const mockVersions1 = [createMockVersion("Version 1", "Initial", timestamp)];
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValueOnce(mockVersions1);
      await fx.versionState.init();

      expect(fx.versionState.getVersionCount()).toBe(1);

      const mockVersions2 = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValueOnce(mockVersions2);
      await fx.versionState.reload();

      expect(fx.versionState.getVersionCount()).toBe(2);
      expect(fx.versionState.getCurrentVersionIndex()).toBe(1);
    });
  });

  describe("getCharacterAtVersion", () => {
    beforeEach(async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
        createMockVersion("Version 3", "Edit 2", timestamp),
      ];
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);
      await fx.versionState.init();
    });

    it("returns the character snapshot at the given index without mutating state", () => {
      const character = fx.versionState.getCharacterAtVersion(0);

      expect(character.name).toBe("Version 1");
      expect(fx.versionState.getCurrentVersionIndex()).toBe(2); // unchanged (still latest)
      expect(fx.versionState.getDisplayedCharacter().name).toBe("Test Character"); // unchanged
    });

    it("re-attaches the current portrait, since versions never store one", () => {
      fx.versionState.setLatestCharacter({
        ...fx.mockCharacter,
        portrait: "data:image/png;base64,AAAA",
      });

      const character = fx.versionState.getCharacterAtVersion(1);

      expect(character.portrait).toBe("data:image/png;base64,AAAA");
      expect(character.name).toBe("Version 2");
    });

    it("throws for an invalid index", () => {
      expect(() => fx.versionState.getCharacterAtVersion(-1)).toThrow("Invalid version index");
      expect(() => fx.versionState.getCharacterAtVersion(999)).toThrow("Invalid version index");
    });
  });

  describe("getVersionIdAtIndex / findVersionIndexById", () => {
    beforeEach(async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);
      await fx.versionState.init();
    });

    it("round-trips an index through its stable id", () => {
      const id = fx.versionState.getVersionIdAtIndex(0);

      expect(fx.versionState.findVersionIndexById(id)).toBe(0);
    });

    it("returns -1 for an id that no longer exists (e.g. evicted by FIFO cap)", () => {
      expect(fx.versionState.findVersionIndexById("some-evicted-id")).toBe(-1);
    });
  });

  describe("restoreVersionAtIndex", () => {
    it("saves the character at the given index as a new latest version", async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);
      await fx.versionState.init();

      await fx.versionState.restoreVersionAtIndex(0);

      expect(fx.mockVersionHistory.saveVersion).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Version 1" }),
        "Restored: Initial"
      );
      expect(fx.versionState.getLatestCharacter().name).toBe("Version 1");
    });

    it("is a no-op when the index already is the latest version", async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);
      await fx.versionState.init();

      await fx.versionState.restoreVersionAtIndex(1);

      expect(fx.mockVersionHistory.saveVersion).not.toHaveBeenCalled();
    });
  });

  describe("getCurrentVersionMetadata", () => {
    it("should return metadata for current version", async () => {
      const timestamp = Date.now();
      const mockVersions = [createMockVersion("Version 1", "Initial state", timestamp)];
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);
      await fx.versionState.init();

      const metadata = fx.versionState.getCurrentVersionMetadata();

      expect(metadata).not.toBeNull();
      expect(metadata!.description).toBe("Initial state");
      expect(metadata!.timestamp).toBeInstanceOf(Date);
    });

    it("should return null when no versions exist", () => {
      const metadata = fx.versionState.getCurrentVersionMetadata();

      expect(metadata).toBeNull();
    });
  });
});
