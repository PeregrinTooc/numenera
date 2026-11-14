import { Given } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { waitForInitialVersionSaved } from "../support/app-ready.js";
import type { CustomWorld } from "../support/world";

Given(
  "the character has {int} versions with different data",
  async function (this: CustomWorld, versionCount: number) {
    // Wait for the app's own bootstrap (which saves the initial version) to
    // finish before creating more, or the two races for the same IndexedDB
    // "versions" store and this step's first created version can overwrite
    // the initial one instead of following it.
    await waitForInitialVersionSaved(this.page);

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

    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    await expect(versionCounter).toContainText(`Version ${versionCount} of ${versionCount}`, {
      timeout: 10000,
    });
  }
);
