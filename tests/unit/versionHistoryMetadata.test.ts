import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VersionHistoryManager } from "@/storage/versionHistory";
import { createTestCharacter } from "../factories/character.js";

describe("VersionHistoryManager.updateVersionMetadata", () => {
  const testDbName = "test-version-history-metadata";
  let manager: VersionHistoryManager;

  beforeEach(async () => {
    manager = new VersionHistoryManager(testDbName);
    await manager.init();
    await manager.clear();
  });

  afterEach(() => {
    manager.close();
  });

  it("stores the squash metadata on the version and keeps the rest", async () => {
    const saved = await manager.saveVersion(createTestCharacter(), "Combined change");

    await manager.updateVersionMetadata(saved.id, { isSquashed: true, squashedCount: 3 });

    const updated = await manager.getVersionById(saved.id);
    expect(updated).toMatchObject({
      id: saved.id,
      description: "Combined change",
      isSquashed: true,
      squashedCount: 3,
    });
  });

  it("rejects when the version does not exist", async () => {
    await expect(manager.updateVersionMetadata("missing", { isSquashed: true })).rejects.toThrow(
      "Version missing not found"
    );
  });
});
