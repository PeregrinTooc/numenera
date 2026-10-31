import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CharacterVersion } from "@/types/versionHistory";
import {
  createMockCharacter,
  createMockVersion,
  setupVersionState,
} from "./helpers/versionStateFixture";

describe("VersionState", () => {
  const fx = setupVersionState();

  describe("initialization", () => {
    it("should start with latest character as displayed character", () => {
      expect(fx.versionState.getDisplayedCharacter()).toBe(fx.mockCharacter);
      expect(fx.versionState.getLatestCharacter()).toBe(fx.mockCharacter);
    });

    it("should load versions on init", async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);

      await fx.versionState.init();

      expect(fx.mockVersionHistory.getAllVersions).toHaveBeenCalled();
      expect(fx.versionState.getVersionCount()).toBe(2);
      expect(fx.versionState.getCurrentVersionIndex()).toBe(1); // Latest version
    });

    it("should handle no versions", async () => {
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValue([]);

      await fx.versionState.init();

      expect(fx.versionState.getVersionCount()).toBe(0);
      expect(fx.versionState.getCurrentVersionIndex()).toBe(-1);
    });
  });

  describe("isViewingOldVersion", () => {
    it("should return false when at latest version", async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);

      await fx.versionState.init();

      expect(fx.versionState.isViewingOldVersion()).toBe(false);
    });

    it("should return true when viewing historical version", async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);

      await fx.versionState.init();
      await fx.versionState.navigateBackward();

      expect(fx.versionState.isViewingOldVersion()).toBe(true);
    });

    it("should return false when no versions exist", () => {
      expect(fx.versionState.isViewingOldVersion()).toBe(false);
    });
  });

  describe("navigation", () => {
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

    it("should navigate backward", async () => {
      await fx.versionState.navigateBackward();

      expect(fx.versionState.getCurrentVersionIndex()).toBe(1);
      expect(fx.versionState.getDisplayedCharacter().name).toBe("Version 2");
    });

    it("should navigate forward", async () => {
      await fx.versionState.navigateBackward();
      await fx.versionState.navigateForward();

      expect(fx.versionState.getCurrentVersionIndex()).toBe(2);
      expect(fx.versionState.getDisplayedCharacter().name).toBe("Version 3");
    });

    it("should not navigate backward past first version", async () => {
      await fx.versionState.navigateBackward();
      await fx.versionState.navigateBackward();
      await fx.versionState.navigateBackward(); // Should not go below 0

      expect(fx.versionState.getCurrentVersionIndex()).toBe(0);
    });

    it("should not navigate forward past last version", async () => {
      await fx.versionState.navigateBackward();
      await fx.versionState.navigateForward();
      await fx.versionState.navigateForward(); // Should not go above last

      expect(fx.versionState.getCurrentVersionIndex()).toBe(2);
    });

    it("should navigate to specific version", async () => {
      await fx.versionState.navigateToVersion(0);

      expect(fx.versionState.getCurrentVersionIndex()).toBe(0);
      expect(fx.versionState.getDisplayedCharacter().name).toBe("Version 1");
    });

    describe("legacy version migration", () => {
      it("should migrate a version snapshot saved before the currentXp/totalXp split", async () => {
        const {
          currentXp: _currentXp,
          totalXp: _totalXp,
          ...modernFields
        } = createMockCharacter("Legacy Character");
        // Deliberately not a valid Character: the pre-split shape had only `xp`.
        const legacyCharacter = {
          ...modernFields,
          xp: 12,
        } as unknown as CharacterVersion["character"];

        const legacyVersion = {
          id: "version-legacy",
          character: legacyCharacter,
          timestamp: Date.now(),
          description: "Old save",
          etag: "etag-legacy",
        };
        vi.mocked(fx.mockVersionHistory.getAllVersions).mockResolvedValue([legacyVersion]);

        await fx.versionState.init();
        await fx.versionState.navigateToVersion(0);

        const displayed = fx.versionState.getDisplayedCharacter();
        expect(displayed.currentXp).toBe(12);
        expect(displayed.totalXp).toBe(12);
      });
    });

    it("should throw error for invalid version index", async () => {
      await expect(fx.versionState.navigateToVersion(-1)).rejects.toThrow("Invalid version index");
      await expect(fx.versionState.navigateToVersion(999)).rejects.toThrow("Invalid version index");
    });

    it("should keep the current portrait when navigating to a version (versions never store one)", async () => {
      fx.versionState.setLatestCharacter({
        ...fx.mockCharacter,
        portrait: "data:image/png;base64,AAAA",
      });

      await fx.versionState.navigateToVersion(0);

      expect(fx.versionState.getDisplayedCharacter().portrait).toBe("data:image/png;base64,AAAA");
      expect(fx.versionState.getDisplayedCharacter().name).toBe("Version 1");
    });
  });
});
