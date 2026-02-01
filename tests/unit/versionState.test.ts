import { describe, it, expect, beforeEach, vi } from "vitest";
import { VersionState } from "../../src/services/versionState";
import { VersionHistoryManager } from "../../src/storage/versionHistory";
import { Character } from "../../src/types/character";
import { CharacterVersion } from "../../src/types/versionHistory";

describe("VersionState", () => {
  let mockVersionHistory: VersionHistoryManager;
  let mockCharacter: Character;
  let versionState: VersionState;

  const createMockCharacter = (name: string): Character => ({
    name,
    tier: 1,
    type: "Glaive",
    descriptor: "Strong",
    focus: "Bears a Halo of Fire",
    xp: 0,
    shins: 0,
    armor: 0,
    effort: 1,
    maxCyphers: 2,
    stats: {
      might: { pool: 10, edge: 0, current: 10 },
      speed: { pool: 10, edge: 0, current: 10 },
      intellect: { pool: 10, edge: 0, current: 10 },
    },
    cyphers: [],
    artifacts: [],
    oddities: [],
    abilities: [],
    equipment: [],
    attacks: [],
    specialAbilities: [],
    recoveryRolls: {
      action: false,
      tenMinutes: false,
      oneHour: false,
      tenHours: false,
      modifier: 0,
    },
    damageTrack: {
      impairment: "healthy",
    },
    textFields: {
      background: "",
      notes: "",
    },
  });

  const createMockVersion = (
    name: string,
    description: string,
    timestamp: number
  ): CharacterVersion => {
    const character = createMockCharacter(name);
    const { portrait: _portrait, ...characterWithoutPortrait } = character as any;
    return {
      id: `version-${name}`,
      character: characterWithoutPortrait,
      timestamp,
      description,
      etag: `etag-${name}`,
    };
  };

  beforeEach(() => {
    mockCharacter = createMockCharacter("Test Character");
    mockVersionHistory = {
      getAllVersions: vi.fn(),
    } as any;

    versionState = new VersionState(mockCharacter, mockVersionHistory);
  });

  describe("initialization", () => {
    it("should start with latest character as displayed character", () => {
      expect(versionState.getDisplayedCharacter()).toBe(mockCharacter);
      expect(versionState.getLatestCharacter()).toBe(mockCharacter);
    });

    it("should load versions on init", async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);

      await versionState.init();

      expect(mockVersionHistory.getAllVersions).toHaveBeenCalled();
      expect(versionState.getVersionCount()).toBe(2);
      expect(versionState.getCurrentVersionIndex()).toBe(1); // Latest version
    });

    it("should handle no versions", async () => {
      vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValue([]);

      await versionState.init();

      expect(versionState.getVersionCount()).toBe(0);
      expect(versionState.getCurrentVersionIndex()).toBe(-1);
    });
  });

  describe("isViewingOldVersion", () => {
    it("should return false when at latest version", async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);

      await versionState.init();

      expect(versionState.isViewingOldVersion()).toBe(false);
    });

    it("should return true when viewing historical version", async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);

      await versionState.init();
      await versionState.navigateBackward();

      expect(versionState.isViewingOldVersion()).toBe(true);
    });

    it("should return false when no versions exist", () => {
      expect(versionState.isViewingOldVersion()).toBe(false);
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
      vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);
      await versionState.init();
    });

    it("should navigate backward", async () => {
      await versionState.navigateBackward();

      expect(versionState.getCurrentVersionIndex()).toBe(1);
      expect(versionState.getDisplayedCharacter().name).toBe("Version 2");
    });

    it("should navigate forward", async () => {
      await versionState.navigateBackward();
      await versionState.navigateForward();

      expect(versionState.getCurrentVersionIndex()).toBe(2);
      expect(versionState.getDisplayedCharacter().name).toBe("Version 3");
    });

    it("should not navigate backward past first version", async () => {
      await versionState.navigateBackward();
      await versionState.navigateBackward();
      await versionState.navigateBackward(); // Should not go below 0

      expect(versionState.getCurrentVersionIndex()).toBe(0);
    });

    it("should not navigate forward past last version", async () => {
      await versionState.navigateBackward();
      await versionState.navigateForward();
      await versionState.navigateForward(); // Should not go above last

      expect(versionState.getCurrentVersionIndex()).toBe(2);
    });

    it("should navigate to specific version", async () => {
      await versionState.navigateToVersion(0);

      expect(versionState.getCurrentVersionIndex()).toBe(0);
      expect(versionState.getDisplayedCharacter().name).toBe("Version 1");
    });

    it("should throw error for invalid version index", async () => {
      await expect(versionState.navigateToVersion(-1)).rejects.toThrow("Invalid version index");
      await expect(versionState.navigateToVersion(999)).rejects.toThrow("Invalid version index");
    });
  });

  describe("restoreToLatest", () => {
    it("should restore to latest version", async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);
      await versionState.init();

      await versionState.navigateBackward();
      expect(versionState.isViewingOldVersion()).toBe(true);

      versionState.restoreToLatest();

      expect(versionState.isViewingOldVersion()).toBe(false);
      expect(versionState.getCurrentVersionIndex()).toBe(1);
    });
  });

  describe("setLatestCharacter", () => {
    it("should update latest character", () => {
      const newCharacter = createMockCharacter("Updated Character");

      versionState.setLatestCharacter(newCharacter);

      expect(versionState.getLatestCharacter()).toBe(newCharacter);
    });

    it("should update displayed character when viewing latest", () => {
      const newCharacter = createMockCharacter("Updated Character");

      versionState.setLatestCharacter(newCharacter);

      expect(versionState.getDisplayedCharacter()).toBe(newCharacter);
    });

    it("should not update displayed character when viewing old version", async () => {
      const timestamp = Date.now();
      const mockVersions = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);
      await versionState.init();
      await versionState.navigateBackward();

      const newCharacter = createMockCharacter("Updated Character");
      versionState.setLatestCharacter(newCharacter);

      expect(versionState.getLatestCharacter()).toBe(newCharacter);
      expect(versionState.getDisplayedCharacter()).not.toBe(newCharacter);
      expect(versionState.getDisplayedCharacter().name).toBe("Version 1");
    });
  });

  describe("reload", () => {
    it("should reload versions from storage", async () => {
      const timestamp = Date.now();
      const mockVersions1 = [createMockVersion("Version 1", "Initial", timestamp)];
      vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValueOnce(mockVersions1);
      await versionState.init();

      expect(versionState.getVersionCount()).toBe(1);

      const mockVersions2 = [
        createMockVersion("Version 1", "Initial", timestamp),
        createMockVersion("Version 2", "Edit 1", timestamp),
      ];
      vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValueOnce(mockVersions2);
      await versionState.reload();

      expect(versionState.getVersionCount()).toBe(2);
      expect(versionState.getCurrentVersionIndex()).toBe(1);
    });
  });

  describe("getCurrentVersionMetadata", () => {
    it("should return metadata for current version", async () => {
      const timestamp = Date.now();
      const mockVersions = [createMockVersion("Version 1", "Initial state", timestamp)];
      vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValue(mockVersions);
      await versionState.init();

      const metadata = versionState.getCurrentVersionMetadata();

      expect(metadata).not.toBeNull();
      expect(metadata!.description).toBe("Initial state");
      expect(metadata!.timestamp).toBeInstanceOf(Date);
    });

    it("should return null when no versions exist", () => {
      const metadata = versionState.getCurrentVersionMetadata();

      expect(metadata).toBeNull();
    });
  });
});
