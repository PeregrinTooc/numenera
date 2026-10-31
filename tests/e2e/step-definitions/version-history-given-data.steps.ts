import { Given } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";

Given(
  "the character has a legacy version with an {string} description for an added cypher",
  async function (this: CustomWorld, description: string) {
    // Reproduces pre-migration stored data: a version whose description is the
    // old hardcoded literal, created by bypassing the live detectChanges path
    // (same as the other legacy-description Given step below).
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);

    const baseCharacter = await this.storageHelper.getCharacter();
    const versionCharacter = {
      ...baseCharacter,
      cyphers: [
        ...baseCharacter.cyphers,
        { name: "Legacy Test Cypher", level: "3", effect: "Test effect" },
      ],
    };
    await this.storageHelper.createVersion(versionCharacter, description);

    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    await expect(versionCounter).toContainText("Version 2 of 2", { timeout: 10000 });

    // Create one more version so we can navigate back to see this legacy
    // version's (now migrated, after reload) description.
    await this.storageHelper.createVersion(
      { ...versionCharacter, name: "Latest Version" },
      "Another change"
    );
    await expect(versionCounter).toContainText("Version 3 of 3", { timeout: 10000 });
  }
);

Given(
  "the character has a legacy version with a {string} description for a name change and an added ability",
  async function (this: CustomWorld, description: string) {
    // Reproduces a real squashDescriptions() output: a compound description
    // with the legacy literal as one of its comma-separated segments.
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);

    const baseCharacter = await this.storageHelper.getCharacter();
    const versionCharacter = {
      ...baseCharacter,
      name: "Changed Name",
      abilities: [
        ...baseCharacter.abilities,
        { name: "Legacy Test Ability", cost: 1, description: "Test ability" },
      ],
    };
    await this.storageHelper.createVersion(versionCharacter, description);

    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    await expect(versionCounter).toContainText("Version 2 of 2", { timeout: 10000 });

    await this.storageHelper.createVersion(
      { ...versionCharacter, name: "Latest Version" },
      "Another change"
    );
    await expect(versionCounter).toContainText("Version 3 of 3", { timeout: 10000 });
  }
);

Given(
  "the character has {int} versions with different data",
  async function (this: CustomWorld, versionCount: number) {
    // Wait for the app's own bootstrap (which saves the initial version) to
    // finish before creating more, or the two races for the same IndexedDB
    // "versions" store and this step's first created version can overwrite
    // the initial one instead of following it.
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);

    // Create versions with different character data
    const baseCharacter = await this.storageHelper.getCharacter();

    for (let i = 1; i < versionCount; i++) {
      const versionCharacter = {
        ...baseCharacter,
        name: `Character V${i + 1}`,
        tier: i + 1,
        equipment: [{ name: `Item ${i + 1}`, description: `Description ${i + 1}` }],
        stats: {
          ...baseCharacter.stats,
          might: { ...baseCharacter.stats.might, pool: 10 + i },
        },
      };
      await this.storageHelper.createVersion(versionCharacter, `Modified data`);
    }

    // Wait for version navigator to show final count
    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    await expect(versionCounter).toContainText(`Version ${versionCount} of ${versionCount}`, {
      timeout: 10000,
    });
  }
);

Given(
  "the character has {int} versions with different names",
  async function (this: CustomWorld, versionCount: number) {
    // Wait for page to be fully loaded before creating versions
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);

    // Create versions with different names
    const baseCharacter = await this.storageHelper.getCharacter();

    for (let i = 1; i < versionCount; i++) {
      const versionCharacter = {
        ...baseCharacter,
        name: `Name ${i + 1}`,
      };
      await this.storageHelper.createVersion(versionCharacter, `Changed name`);
    }

    // Wait a bit for the navigator to update after last version
    await this.page.waitForTimeout(200);

    // Wait for version navigator to show final count
    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    await expect(versionCounter).toContainText(`Version ${versionCount} of ${versionCount}`, {
      timeout: 10000,
    });
  }
);

Given("I have made buffered edits that were undone", async function (this: CustomWorld) {
  // Make two edits to the character name
  const testId = "character-name";
  const field = this.page.locator(`[data-testid="${testId}"]`);

  // First edit
  await field.click();
  const modal = this.page.locator('[data-testid="edit-modal"]');
  await expect(modal).toBeVisible({ timeout: 5000 });
  const input = this.page.locator('[data-testid="edit-modal-input"]');
  await input.fill("First Edit");
  const confirmButton = this.page.locator('[data-testid="modal-confirm-button"]');
  await confirmButton.click();
  await expect(modal).toHaveCount(0, { timeout: 2000 });
  await this.page.waitForTimeout(100);

  // Second edit
  await field.click();
  await expect(modal).toBeVisible({ timeout: 5000 });
  await input.fill("Second Edit");
  await confirmButton.click();
  await expect(modal).toHaveCount(0, { timeout: 2000 });
  await this.page.waitForTimeout(100);

  // Undo both edits using Control+Z (before squash timer expires)
  await this.page.evaluate(() => {
    const event1 = new KeyboardEvent("keydown", {
      key: "z",
      code: "KeyZ",
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    document.body.dispatchEvent(event1);
  });
  await this.page.waitForTimeout(200);

  // Undo again to go back to original
  await this.page.evaluate(() => {
    const event2 = new KeyboardEvent("keydown", {
      key: "z",
      code: "KeyZ",
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    document.body.dispatchEvent(event2);
  });
  await this.page.waitForTimeout(200);

  // Now we're at the original state, and redo stack has the two undone changes
});
