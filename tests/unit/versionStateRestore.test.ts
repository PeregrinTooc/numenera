import { beforeEach, describe, expect, it } from "vitest";
import { seedVersions } from "./helpers/realVersionHistory";
import { createMockCharacter, setupVersionState } from "./helpers/versionStateFixture";

describe("VersionState restore and lookup", () => {
  const fx = setupVersionState();

  describe("restoreToLatest", () => {
    it("should restore to latest version", async () => {
      await seedVersions(fx.versionHistory, [
        { name: "Version 1", description: "Initial" },
        { name: "Version 2", description: "Edit 1" },
      ]);
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
      await seedVersions(fx.versionHistory, [
        { name: "Version 1", description: "Initial" },
        { name: "Version 2", description: "Edit 1" },
      ]);
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
      await seedVersions(fx.versionHistory, [
        { name: "Version 1", description: "Initial" },
        { name: "Version 2", description: "Edit 1" },
      ]);
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
      await seedVersions(fx.versionHistory, [{ name: "Version 1", description: "Initial" }]);
      await fx.versionState.init();

      expect(fx.versionState.getVersionCount()).toBe(1);

      await seedVersions(fx.versionHistory, [{ name: "Version 2", description: "Edit 1" }]);
      await fx.versionState.reload();

      expect(fx.versionState.getVersionCount()).toBe(2);
      expect(fx.versionState.getCurrentVersionIndex()).toBe(1);
    });
  });

  describe("getCharacterAtVersion", () => {
    beforeEach(async () => {
      await seedVersions(fx.versionHistory, [
        { name: "Version 1", description: "Initial" },
        { name: "Version 2", description: "Edit 1" },
        { name: "Version 3", description: "Edit 2" },
      ]);
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
      await seedVersions(fx.versionHistory, [
        { name: "Version 1", description: "Initial" },
        { name: "Version 2", description: "Edit 1" },
      ]);
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
      await seedVersions(fx.versionHistory, [
        { name: "Version 1", description: "Initial" },
        { name: "Version 2", description: "Edit 1" },
      ]);
      await fx.versionState.init();

      await fx.versionState.restoreVersionAtIndex(0);

      const stored = await fx.versionHistory.getAllVersions();
      expect(stored).toHaveLength(3);
      expect(stored[2].character.name).toBe("Version 1");
      expect(stored[2].description).toBe("Restored: Initial");
      expect(fx.versionState.getLatestCharacter().name).toBe("Version 1");
    });

    it("is a no-op when the index already is the latest version", async () => {
      await seedVersions(fx.versionHistory, [
        { name: "Version 1", description: "Initial" },
        { name: "Version 2", description: "Edit 1" },
      ]);
      await fx.versionState.init();

      await fx.versionState.restoreVersionAtIndex(1);

      expect(await fx.versionHistory.getAllVersions()).toHaveLength(2);
    });
  });

  describe("getCurrentVersionMetadata", () => {
    it("should return metadata for current version", async () => {
      await seedVersions(fx.versionHistory, [{ name: "Version 1", description: "Initial state" }]);
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
