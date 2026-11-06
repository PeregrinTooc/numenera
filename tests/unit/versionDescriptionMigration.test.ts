import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VersionHistoryManager } from "@/storage/versionHistory";
import { migrateLegacyVersionDescriptions } from "@/services/versionDescriptionMigration";
import { restoredDescription } from "@/services/versionDescriptionText";
import type { Character } from "@/types/character";
import { createTestCharacter as createMockCharacter } from "../factories/character.js";

const KEY = "versionHistory.changes";

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

  async function migrateSecondVersionDescribedAs(description: string): Promise<string> {
    await manager.saveVersion(mockCharacter, "Initial state");
    await manager.saveVersion({ ...mockCharacter, name: "New Name" }, description);

    await migrateLegacyVersionDescriptions(manager, await manager.getAllVersions());

    return (await manager.getAllVersions())[1].description;
  }

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
    expect(migrated[1].description).toBe(`${KEY}.collections.cypher.added`);
  });

  it("fully replaces a compound description containing the legacy literal", async () => {
    await manager.saveVersion(mockCharacter, "Initial state");
    const changed = {
      ...mockCharacter,
      name: "New Name",
      abilities: [{ name: "Bash", cost: 1, description: "Attack" }],
    };
    // Real squashDescriptions() output: a field edit and a card op that still
    // had the old generic literal, combined into one compound description.
    await manager.saveVersion(changed, "Changed name, Updated character");

    const versions = await manager.getAllVersions();
    await migrateLegacyVersionDescriptions(manager, versions);

    // Recomputed from the snapshot diff, so the added ability, which never
    // appeared in the stored text, is rediscovered too.
    const migrated = await manager.getAllVersions();
    expect(migrated[1].description).toBe(`${KEY}.basicInfo.name, ${KEY}.collections.ability.added`);
  });

  it("falls back to the generic key when a legacy literal has no detectable diff", async () => {
    await manager.saveVersion(mockCharacter, "Initial state");
    await manager.saveVersion({ ...mockCharacter }, "Updated character");

    const versions = await manager.getAllVersions();
    await migrateLegacyVersionDescriptions(manager, versions);

    const migrated = await manager.getAllVersions();
    expect(migrated[1].description).toBe(`${KEY}.generic`);
  });

  it("rewrites stored English text as its key", async () => {
    expect(await migrateSecondVersionDescribedAs("Changed name, Added cypher")).toBe(
      `${KEY}.basicInfo.name, ${KEY}.collections.cypher.added`
    );
  });

  it("rewrites stored German text as its key", async () => {
    expect(await migrateSecondVersionDescribedAs("Stufe geändert, Cypher hinzugefügt")).toBe(
      `${KEY}.basicInfo.tier, ${KEY}.collections.cypher.added`
    );
  });

  it("rewrites an old field-edit label as the key of its group", async () => {
    expect(await migrateSecondVersionDescribedAs("Changed Might pool, Changed total XP")).toBe(
      `${KEY}.stats.might, ${KEY}.resources.xp`
    );
  });

  it("rewrites a restored description, however often it was restored", async () => {
    expect(await migrateSecondVersionDescribedAs("Restored: Restored: Imported character")).toBe(
      restoredDescription(restoredDescription(`${KEY}.imported`))
    );
  });

  it("keeps text it does not know as stored", async () => {
    expect(await migrateSecondVersionDescribedAs("Edit 4, Changed name")).toBe(
      `Edit 4, ${KEY}.basicInfo.name`
    );
  });

  it("leaves a description that is already keys unchanged", async () => {
    const stored = restoredDescription(`${KEY}.basicInfo.name, ${KEY}.stats.might`);

    expect(await migrateSecondVersionDescribedAs(stored)).toBe(stored);
  });

  it("rewrites the first version's text without recomputing it", async () => {
    await manager.saveVersion(mockCharacter, "Initial state");

    const versions = await manager.getAllVersions();
    await migrateLegacyVersionDescriptions(manager, versions);

    const migrated = await manager.getAllVersions();
    expect(migrated[0].description).toBe(`${KEY}.initialState`);
  });

  it("does not crash when a predecessor snapshot predates the current schema", async () => {
    // Only the old single `xp` field: a snapshot saved before the
    // currentXp/totalXp split, which sanitizeCharacter fills in.
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

    // Best effort: the schema gap may add fields that only "changed" through
    // sanitising, but the description is still more specific than generic.
    const migrated = await manager.getAllVersions();
    expect(migrated[1].description).not.toBe(`${KEY}.generic`);
  });
});
