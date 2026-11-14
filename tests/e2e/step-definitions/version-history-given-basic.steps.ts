import { Given } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { waitForInitialVersionSaved } from "../support/app-ready.js";
import type { CustomWorld } from "../support/world";

Given("the character has no version history yet", async function (this: CustomWorld) {
  // The app always records one initial-state version on first load; "no history yet" means
  // nothing beyond it (the navigator stays hidden until a second version exists).
  // Poll: that save is asynchronous after the sheet renders, so on a slow
  // engine under load a single read can run before it lands.
  await expect
    .poll(async () =>
      (await this.storageHelper.getAllVersions()).map((version) => version.description)
    )
    .toEqual(["versionHistory.changes.initialState"]);
});

Given(
  "the character has {int} versions in history",
  async function (this: CustomWorld, versionCount: number) {
    await waitForInitialVersionSaved(this.page);

    const baseCharacter = await this.storageHelper.getCharacter();

    for (let i = 1; i < versionCount; i++) {
      const versionCharacter = {
        ...baseCharacter,
        name: `Version ${i + 1}`,
      };

      await this.storageHelper.createVersion(versionCharacter, `Changed name`);
    }

    if (versionCount > 1) {
      await expect(this.page.locator('[data-testid="version-counter"]')).toHaveText(
        `Version ${versionCount} of ${versionCount}`,
        { timeout: 10000 }
      );
    }
  }
);

Given(
  "the character has a version with multiple basic info changes",
  async function (this: CustomWorld) {
    // Wait for the app's own bootstrap (which saves the initial version) to
    // finish before creating more, or this step's first created version can
    // race the app's initial-version save for the same IndexedDB store.
    await waitForInitialVersionSaved(this.page);

    const baseCharacter = await this.storageHelper.getCharacter();
    const versionCharacter = {
      ...baseCharacter,
      name: "Changed Name",
      descriptor: "Changed Descriptor",
      type: "Changed Type",
    };
    await this.storageHelper.createVersion(versionCharacter, "Edited basic info");

    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    await expect(versionCounter).toContainText("Version 2 of 2", { timeout: 10000 });

    const latestCharacter = {
      ...versionCharacter,
      name: "Latest Version",
    };
    await this.storageHelper.createVersion(latestCharacter, "Final change");

    await expect(versionCounter).toContainText("Version 3 of 3", { timeout: 10000 });
  }
);
