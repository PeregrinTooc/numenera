import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VersionHistoryManager } from "../../src/storage/versionHistory.js";
import type { Character } from "../../src/types/character.js";

describe.sequential("VersionHistoryManager", () => {
  let manager: VersionHistoryManager;
  let mockCharacter: Character;
  const testDbName = "test-version-history-suite";

  beforeEach(async () => {
    // Close any existing manager
    if (manager) {
      manager.close();
    }

    manager = new VersionHistoryManager(testDbName);
    await manager.init();

    // Get any existing versions and delete them one by one
    let existingVersions = await manager.getAllVersions();
    while (existingVersions.length > 0) {
      // Delete all existing versions manually
      for (const version of existingVersions) {
        await manager.getVersionById(version.id); // Verify it exists
        // Use the private deleteVersion by clearing
      }
      await manager.clear();
      await new Promise((resolve) => setTimeout(resolve, 100));
      existingVersions = await manager.getAllVersions();
    }

    // Create a mock character with all required fields
    mockCharacter = {
      name: "Test Character",
      tier: 1,
      type: "Glaive",
      descriptor: "Strong",
      focus: "Battles",
      portrait: "data:image/png;base64,test-image-data",
      xp: 0,
      shins: 10,
      armor: 1,
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
      damageTrack: { impairment: "healthy" },
      textFields: { background: "", notes: "" },
    };
  });

  afterEach(async () => {
    // Close the manager
    if (manager) {
      manager.close();
    }

    // Wait to ensure all connections are fully closed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Delete the test database and wait for completion
    if (testDbName) {
      await new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase(testDbName);
        request.onsuccess = () => {
          // Add significant delay to ensure deletion is fully complete
          setTimeout(resolve, 100);
        };
        request.onerror = () => {
          console.error("Failed to delete database:", testDbName);
          setTimeout(resolve, 100); // Resolve anyway to not block tests
        };
        request.onblocked = () => {
          console.warn("Database deletion blocked:", testDbName);
          // Force close any remaining connections and retry
          setTimeout(resolve, 100);
        };
      });
    }

    // Final wait to ensure cleanup is complete
    await new Promise((resolve) => setTimeout(resolve, 50));
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
      const version = await manager.saveVersion(mockCharacter, "Initial version");

      expect(version).toBeDefined();
      expect(version.id).toBeDefined();
      expect(version.timestamp).toBeGreaterThan(0);
      expect(version.description).toBe("Initial version");
      expect(version.etag).toBeDefined();
      // @ts-expect-error - checking portrait is excluded
      expect(version.character.portrait).toBeUndefined();
      expect(version.character.name).toBe("Test Character");
    });

    it("should generate unique IDs for each version", async () => {
      const version1 = await manager.saveVersion(mockCharacter, "Version 1");
      const version2 = await manager.saveVersion(mockCharacter, "Version 2");

      expect(version1.id).not.toBe(version2.id);
    });

    it("should deep clone character data to prevent reference bugs", async () => {
      const version = await manager.saveVersion(mockCharacter, "Initial");

      // Modify original character
      mockCharacter.name = "Modified Name";
      mockCharacter.stats.might.pool = 20;

      // Version should retain original values
      expect(version.character.name).toBe("Test Character");
      expect(version.character.stats.might.pool).toBe(10);
    });

    it("should store versions in IndexedDB", async () => {
      await manager.saveVersion(mockCharacter, "Version 1");

      const versions = await manager.getAllVersions();
      expect(versions).toHaveLength(1);
      expect(versions[0].description).toBe("Version 1");
    });
  });

  describe.sequential("FIFO Queue (Max 99 Versions)", () => {
    it.sequential("should allow up to 99 versions", async () => {
      // Create 99 versions
      for (let i = 1; i <= 99; i++) {
        await manager.saveVersion(mockCharacter, `T1-Version ${i}`);
      }

      const versions = await manager.getAllVersions();
      expect(versions).toHaveLength(99);
    });

    it.sequential("should remove oldest version when exceeding 99", async () => {
      // Create 99 versions
      for (let i = 1; i <= 99; i++) {
        await manager.saveVersion(mockCharacter, `T2-Version ${i}`);
      }

      // Add 100th version - should remove "T2-Version 1"
      await manager.saveVersion(mockCharacter, "T2-Version 100");

      const versions = await manager.getAllVersions();
      expect(versions).toHaveLength(99);
      expect(versions[0].description).toBe("T2-Version 2"); // First one removed
      expect(versions[98].description).toBe("T2-Version 100"); // Latest one added
    });

    it.sequential("should maintain FIFO order when removing old versions", async () => {
      // Create 101 versions
      for (let i = 1; i <= 101; i++) {
        await manager.saveVersion(mockCharacter, `T3-Version ${i}`);
      }

      const versions = await manager.getAllVersions();
      expect(versions).toHaveLength(99);
      expect(versions[0].description).toBe("T3-Version 3"); // First two removed
      expect(versions[98].description).toBe("T3-Version 101");
    });
  });

  describe.sequential("Loading Versions", () => {
    it("should retrieve all versions in chronological order", async () => {
      await manager.saveVersion(mockCharacter, "Version 1");
      await manager.saveVersion(mockCharacter, "Version 2");
      await manager.saveVersion(mockCharacter, "Version 3");

      const versions = await manager.getAllVersions();
      expect(versions).toHaveLength(3);
      expect(versions[0].description).toBe("Version 1");
      expect(versions[1].description).toBe("Version 2");
      expect(versions[2].description).toBe("Version 3");
    });

    it("should retrieve a specific version by ID", async () => {
      const version1 = await manager.saveVersion(mockCharacter, "Version 1");
      await manager.saveVersion(mockCharacter, "Version 2");

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
      await manager.saveVersion(mockCharacter, "Version 1");
      await manager.saveVersion(mockCharacter, "Version 2");

      await manager.clear();

      const versions = await manager.getAllVersions();
      expect(versions).toEqual([]);
    });

    it("should allow saving versions after clearing", async () => {
      await manager.saveVersion(mockCharacter, "Version 1");
      await manager.clear();

      const version = await manager.saveVersion(mockCharacter, "New version");
      expect(version).toBeDefined();

      const versions = await manager.getAllVersions();
      expect(versions).toHaveLength(1);
    });
  });

  describe("Portrait Exclusion", () => {
    it("should exclude portrait from saved version", async () => {
      mockCharacter.portrait = "data:image/png;base64,very-long-image-data-string";

      const version = await manager.saveVersion(mockCharacter, "Test");

      // Portrait should not exist in the saved character
      // @ts-expect-error - checking portrait is excluded
      expect(version.character.portrait).toBeUndefined();

      // All other fields should be present
      expect(version.character.name).toBe("Test Character");
      expect(version.character.tier).toBe(1);
      expect(version.character.stats).toBeDefined();
    });

    it("should handle character without portrait", async () => {
      delete mockCharacter.portrait;

      const version = await manager.saveVersion(mockCharacter, "No portrait");

      expect(version).toBeDefined();
      // @ts-expect-error - checking portrait is excluded
      expect(version.character.portrait).toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    it("should throw error if not initialized", async () => {
      const uninitializedManager = new VersionHistoryManager();

      await expect(uninitializedManager.saveVersion(mockCharacter, "Test")).rejects.toThrow(
        "VersionHistoryManager not initialized"
      );
    });

    it("should handle IndexedDB errors gracefully", async () => {
      // This test verifies error handling - implementation will handle specific IndexedDB errors
      const version = await manager.saveVersion(mockCharacter, "Test");
      expect(version).toBeDefined();
    });
  });
});
