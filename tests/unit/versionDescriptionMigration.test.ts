import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VersionHistoryManager } from "../../src/storage/versionHistory.js";
import { migrateLegacyVersionDescriptions } from "../../src/services/versionDescriptionMigration.js";
import type { Character } from "../../src/types/character.js";
import { createTestCharacter as createMockCharacter } from "../factories/character.js";

// Helper for async delays
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe.sequential("migrateLegacyVersionDescriptions", () => {
  let manager: VersionHistoryManager;
  let mockCharacter: Character;
  const testDbName = "test-version-description-migration-suite";

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

  it("rewrites a bare legacy literal using the diff against the previous version", async () => {
    await manager.saveVersion(mockCharacter, "Initial state");
    const withCypher = {
      ...mockCharacter,
      cyphers: [{ name: "Detonation", level: "3", effect: "Explodes" }],
    };
    await manager.saveVersion(withCypher, "Updated character");

    const versions = await manager.getAllVersions();
    await migrateLegacyVersionDescriptions(manager, versions);

    const migrated = await manager.getAllVersions();
    expect(migrated[1].description).toBe("Added cypher");
  });

  it("fully replaces a compound description containing the legacy literal", async () => {
    await manager.saveVersion(mockCharacter, "Initial state");
    const changed = {
      ...mockCharacter,
      name: "New Name",
      abilities: [{ name: "Bash", cost: 1, description: "Attack" }],
    };
    // Reproduces real squashDescriptions() output: two buffered changes
    // (one field edit, one card op that still had the old generic literal)
    // combined into one compound description.
    await manager.saveVersion(changed, "Changed name, Updated character");

    const versions = await manager.getAllVersions();
    await migrateLegacyVersionDescriptions(manager, versions);

    const migrated = await manager.getAllVersions();
    // Recomputed from the actual snapshot diff, not patched — so both real
    // changes are rediscovered independently, including "Added ability",
    // which never appeared in the original stored text at all.
    expect(migrated[1].description).toBe("Changed name, Added ability");
  });

  it("leaves a legacy description alone when there's no actual detectable diff", async () => {
    await manager.saveVersion(mockCharacter, "Initial state");
    // Identical character - detectChanges will find nothing, so the
    // recomputed description is the same generic fallback text.
    await manager.saveVersion({ ...mockCharacter }, "Updated character");

    const versions = await manager.getAllVersions();
    await expect(migrateLegacyVersionDescriptions(manager, versions)).resolves.not.toThrow();

    const migrated = await manager.getAllVersions();
    expect(migrated[1].description).toBe("Updated character");
  });

  it("does not touch a non-legacy description", async () => {
    await manager.saveVersion(mockCharacter, "Initial state");
    const renamed = { ...mockCharacter, name: "New Name" };
    await manager.saveVersion(renamed, "Changed name");

    const versions = await manager.getAllVersions();
    await migrateLegacyVersionDescriptions(manager, versions);

    const migrated = await manager.getAllVersions();
    expect(migrated[1].description).toBe("Changed name");
  });

  it("never touches index 0, even if it were somehow the legacy literal", async () => {
    await manager.saveVersion(mockCharacter, "Updated character");

    const versions = await manager.getAllVersions();
    await migrateLegacyVersionDescriptions(manager, versions);

    const migrated = await manager.getAllVersions();
    expect(migrated[0].description).toBe("Updated character");
  });

  it("does not crash when a predecessor snapshot predates the current schema", async () => {
    // Legacy shape: only the old single `xp` field, missing currentXp/totalXp
    // entirely - reproduces a version snapshot saved before that schema
    // split, which sanitizeCharacter fills in from defaults/legacy fields.
    const legacySnapshot = {
      ...mockCharacter,
      currentXp: undefined,
      totalXp: undefined,
      xp: 15,
    } as unknown as Character;
    await manager.saveVersion(legacySnapshot, "Initial state");
    const withCypher = {
      ...mockCharacter,
      cyphers: [{ name: "Detonation", level: "3", effect: "Explodes" }],
    };
    await manager.saveVersion(withCypher, "Updated character");

    const versions = await manager.getAllVersions();
    await expect(migrateLegacyVersionDescriptions(manager, versions)).resolves.not.toThrow();

    // Best-effort backfill: some specific description is produced instead of
    // the uninformative generic literal, even if the schema gap means it may
    // also report fields that only "changed" because sanitizeCharacter
    // filled in a default on the older side. Still strictly more useful than
    // "Updated character" for every such version.
    const migrated = await manager.getAllVersions();
    expect(migrated[1].description).not.toBe("Updated character");
  });
});
