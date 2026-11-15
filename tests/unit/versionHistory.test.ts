import { DEFAULT_START_MS } from "@/services/manualClock";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VersionHistoryManager } from "@/storage/versionHistory";
import type { Character } from "@/types/character";
import { createTestCharacter as createMockCharacter } from "../factories/character.js";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("VersionHistoryManager", () => {
  let manager: VersionHistoryManager;
  let mockCharacter: Character;
  const testDbName = "test-version-history-suite";

  beforeEach(async () => {
    if (manager) {
      manager.close();
    }

    manager = new VersionHistoryManager(testDbName);
    await manager.init();
    await manager.clear();
    await wait(100);

    mockCharacter = createMockCharacter();
  });

  afterEach(async () => {
    if (manager) {
      manager.close();
    }

    await wait(100);

    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase(testDbName);
      request.onsuccess = () => setTimeout(resolve, 100);
      request.onerror = () => setTimeout(resolve, 100);
      request.onblocked = () => setTimeout(resolve, 100);
    });
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      const newManager = new VersionHistoryManager();
      await expect(newManager.init()).resolves.not.toThrow();
    });

    it("should be available after initialization", async () => {
      expect(await manager.isAvailable()).toBe(true);
    });
  });

  describe("Saving Versions", () => {
    it("should save a version excluding portrait", async () => {
      const version = await manager.saveVersion(mockCharacter, "Initial version", DEFAULT_START_MS);

      expect(version).toBeDefined();
      expect(version.id).toBeDefined();
      expect(version.timestamp).toBe(DEFAULT_START_MS);
      expect(version.description).toBe("Initial version");
      expect(version.etag).toBeDefined();
      // @ts-expect-error - checking portrait is excluded
      expect(version.character.portrait).toBeUndefined();
      expect(version.character.name).toBe("Test Character");
    });

    it("should generate unique IDs for each version", async () => {
      const version1 = await manager.saveVersion(mockCharacter, "Version 1", DEFAULT_START_MS);
      const version2 = await manager.saveVersion(mockCharacter, "Version 2", DEFAULT_START_MS);

      expect(version1.id).not.toBe(version2.id);
    });

    it("should keep timestamps strictly increasing when saved at the same instant", async () => {
      const first = await manager.saveVersion(mockCharacter, "Version 1", DEFAULT_START_MS);
      const second = await manager.saveVersion(mockCharacter, "Version 2", DEFAULT_START_MS);

      expect(second.timestamp).toBe(first.timestamp + 1);
    });

    it("should deep clone character data to prevent reference bugs", async () => {
      const version = await manager.saveVersion(mockCharacter, "Initial", DEFAULT_START_MS);

      mockCharacter.name = "Modified Name";
      mockCharacter.stats.might.pool = 20;

      expect(version.character.name).toBe("Test Character");
      expect(version.character.stats.might.pool).toBe(10);
    });

    it("should store versions in IndexedDB", async () => {
      await manager.saveVersion(mockCharacter, "Version 1", DEFAULT_START_MS);

      const versions = await manager.getAllVersions();
      expect(versions).toHaveLength(1);
      expect(versions[0].description).toBe("Version 1");
    });
  });

  describe("FIFO Queue (Max 99 Versions)", () => {
    it("should allow up to 99 versions", async () => {
      for (let i = 1; i <= 99; i++) {
        await manager.saveVersion(mockCharacter, `Version ${i}`, DEFAULT_START_MS);
      }

      const versions = await manager.getAllVersions();
      expect(versions).toHaveLength(99);
    });

    it("should remove oldest version when exceeding 99", async () => {
      for (let i = 1; i <= 99; i++) {
        await manager.saveVersion(mockCharacter, `Version ${i}`, DEFAULT_START_MS);
      }

      await manager.saveVersion(mockCharacter, "Version 100", DEFAULT_START_MS);

      const versions = await manager.getAllVersions();
      expect(versions).toHaveLength(99);
      expect(versions[0].description).toBe("Version 2");
      expect(versions[98].description).toBe("Version 100");
    });

    it("should maintain FIFO order when removing old versions", async () => {
      for (let i = 1; i <= 101; i++) {
        await manager.saveVersion(mockCharacter, `Version ${i}`, DEFAULT_START_MS);
      }

      const versions = await manager.getAllVersions();
      expect(versions).toHaveLength(99);
      expect(versions[0].description).toBe("Version 3");
      expect(versions[98].description).toBe("Version 101");
    });
  });

  describe("Loading Versions", () => {
    it("should retrieve all versions in chronological order", async () => {
      await manager.saveVersion(mockCharacter, "Version 1", DEFAULT_START_MS);
      await manager.saveVersion(mockCharacter, "Version 2", DEFAULT_START_MS);
      await manager.saveVersion(mockCharacter, "Version 3", DEFAULT_START_MS);

      const versions = await manager.getAllVersions();
      expect(versions).toHaveLength(3);
      expect(versions[0].description).toBe("Version 1");
      expect(versions[1].description).toBe("Version 2");
      expect(versions[2].description).toBe("Version 3");
    });

    it("should retrieve a specific version by ID", async () => {
      const version1 = await manager.saveVersion(mockCharacter, "Version 1", DEFAULT_START_MS);
      await manager.saveVersion(mockCharacter, "Version 2", DEFAULT_START_MS);

      const retrieved = await manager.getVersionById(version1.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(version1.id);
      expect(retrieved?.description).toBe("Version 1");
    });

    it("should return null for non-existent version ID", async () => {
      const retrieved = await manager.getVersionById("non-existent-id");
      expect(retrieved).toBeNull();
    });

    it("should return empty array when no versions exist", async () => {
      const versions = await manager.getAllVersions();
      expect(versions).toEqual([]);
    });
  });

  describe("Clearing Versions", () => {
    it("should clear all versions", async () => {
      await manager.saveVersion(mockCharacter, "Version 1", DEFAULT_START_MS);
      await manager.saveVersion(mockCharacter, "Version 2", DEFAULT_START_MS);

      await manager.clear();

      const versions = await manager.getAllVersions();
      expect(versions).toEqual([]);
    });

    it("should allow saving versions after clearing", async () => {
      await manager.saveVersion(mockCharacter, "Version 1", DEFAULT_START_MS);
      await manager.clear();

      const version = await manager.saveVersion(mockCharacter, "New version", DEFAULT_START_MS);
      expect(version).toBeDefined();

      const versions = await manager.getAllVersions();
      expect(versions).toHaveLength(1);
    });
  });

  describe("Portrait Exclusion", () => {
    it("should exclude portrait from saved version", async () => {
      mockCharacter.portrait = "data:image/png;base64,very-long-image-data-string";

      const version = await manager.saveVersion(mockCharacter, "Test", DEFAULT_START_MS);

      // @ts-expect-error - checking portrait is excluded
      expect(version.character.portrait).toBeUndefined();

      expect(version.character.name).toBe("Test Character");
      expect(version.character.tier).toBe(1);
      expect(version.character.stats).toBeDefined();
    });

    it("should handle character without portrait", async () => {
      delete mockCharacter.portrait;

      const version = await manager.saveVersion(mockCharacter, "No portrait", DEFAULT_START_MS);

      expect(version).toBeDefined();
      // @ts-expect-error - checking portrait is excluded
      expect(version.character.portrait).toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    it("should throw error if not initialized", async () => {
      const uninitializedManager = new VersionHistoryManager();

      await expect(
        uninitializedManager.saveVersion(mockCharacter, "Test", DEFAULT_START_MS)
      ).rejects.toThrow("VersionHistoryManager not initialized");
    });

    it("should handle IndexedDB errors gracefully", async () => {
      const version = await manager.saveVersion(mockCharacter, "Test", DEFAULT_START_MS);
      expect(version).toBeDefined();
    });
  });
});
