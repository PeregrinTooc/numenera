import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { VersionHistoryManager } from "@/storage/versionHistory";
import { VersionHistoryService } from "@/services/versionHistoryService";
import { TestTimer } from "@/services/testTimer";
import type { Character } from "@/types/character";
import { createTestCharacter as createMockCharacter } from "../factories/character";

// Helper for async delays
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe.sequential("VersionHistoryService - edits during an in-flight squash", () => {
  let manager: VersionHistoryManager;
  let service: VersionHistoryService;
  let timer: TestTimer;
  let mockCharacter: Character;
  const testDbName = "test-version-history-squash-race-suite";

  beforeEach(async () => {
    manager = new VersionHistoryManager(testDbName);
    await manager.init();
    await manager.clear();
    await wait(100);

    // Squash timers fire only when a test triggers them.
    timer = new TestTimer();
    service = new VersionHistoryService(manager, 1000, timer);
    mockCharacter = createMockCharacter();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    manager.close();
    await wait(100);

    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase(testDbName);
      request.onsuccess = () => setTimeout(resolve, 100);
      request.onerror = () => setTimeout(resolve, 100);
      request.onblocked = () => setTimeout(resolve, 100);
    });
  });

  function holdNextSave(): () => void {
    let releaseSave: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      releaseSave = resolve;
    });
    const save = manager.saveVersion.bind(manager);
    vi.spyOn(manager, "saveVersion").mockImplementationOnce(async (character, description) => {
      await gate;
      return save(character, description);
    });
    return releaseSave;
  }

  it("keeps an edit buffered while the squash is saving for the next squash", async () => {
    const releaseSave = holdNextSave();

    service.bufferChange({ ...mockCharacter, name: "Squashing Hero" }, "Changed name");
    const inFlight = service.forceSquash();
    service.bufferChange({ ...mockCharacter, name: "Late Hero" }, "Changed name");
    releaseSave();
    await inFlight;
    await service.forceSquash();

    const versions = await manager.getAllVersions();
    expect(versions.map((version) => version.character.name)).toEqual([
      "Squashing Hero",
      "Late Hero",
    ]);
  });

  it("squashes a late edit whose timer fired during the in-flight squash", async () => {
    const releaseSave = holdNextSave();

    service.bufferChange({ ...mockCharacter, name: "Squashing Hero" }, "Changed name");
    const inFlight = service.forceSquash();
    service.bufferChange({ ...mockCharacter, name: "Late Hero" }, "Changed name");
    // The late edit's timer fires while the first save is still pending.
    timer.triggerAll();
    releaseSave();
    await inFlight;
    timer.triggerAll();

    await vi.waitFor(async () => {
      const versions = await manager.getAllVersions();
      expect(versions.map((version) => version.character.name)).toEqual([
        "Squashing Hero",
        "Late Hero",
      ]);
    });
  });
});
