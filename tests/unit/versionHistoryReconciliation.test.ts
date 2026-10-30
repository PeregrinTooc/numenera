import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VersionHistoryManager } from "@/storage/versionHistory";
import { reconcileVersionHistory } from "@/services/versionHistoryReconciliation";
import type { Character } from "@/types/character";
import { createTestCharacter as createMockCharacter } from "../factories/character";

// Helper for async delays
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe.sequential("reconcileVersionHistory", () => {
  let manager: VersionHistoryManager;
  let mockCharacter: Character;
  const testDbName = "test-version-history-reconciliation-suite";

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

  it("saves the stored character as a new version when it differs from the latest version", async () => {
    await manager.saveVersion(mockCharacter, "Initial state");
    const stored = { ...mockCharacter, name: "Unsquashed Hero" };

    await reconcileVersionHistory(manager, stored);

    const versions = await manager.getAllVersions();
    expect(versions).toHaveLength(2);
    expect(versions[1].character.name).toBe("Unsquashed Hero");
  });

  it("does nothing when the stored character matches the latest version", async () => {
    await manager.saveVersion(mockCharacter, "Initial state");

    await reconcileVersionHistory(manager, mockCharacter);

    expect(await manager.getAllVersions()).toHaveLength(1);
  });

  it("leaves an empty history to the initial-state path", async () => {
    await reconcileVersionHistory(manager, mockCharacter);

    expect(await manager.getAllVersions()).toHaveLength(0);
  });

  it("describes the rebuilt version by its diff against the latest version", async () => {
    await manager.saveVersion(mockCharacter, "Initial state");
    const stored = { ...mockCharacter, name: "Unsquashed Hero" };

    await reconcileVersionHistory(manager, stored);

    const versions = await manager.getAllVersions();
    expect(versions[1].description).toBe("Changed name");
  });

  it("ignores a portrait-only difference, since versions never store the portrait", async () => {
    await manager.saveVersion(mockCharacter, "Initial state");
    const stored = { ...mockCharacter, portrait: "data:image/png;base64,AAAA" };

    await reconcileVersionHistory(manager, stored);

    expect(await manager.getAllVersions()).toHaveLength(1);
  });
});
