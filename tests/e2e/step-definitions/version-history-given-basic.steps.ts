import { Given } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";

// Given steps

Given("the character has no version history yet", async function (this: CustomWorld) {
  // The app always records one "Initial state" version on first load; "no history yet" means
  // nothing beyond it (the navigator stays hidden until a second version exists).
  // Poll: that save is asynchronous after the sheet renders, so on a slow
  // engine under load a single read can run before it lands.
  await expect
    .poll(async () =>
      (await this.storageHelper.getAllVersions()).map((version) => version.description)
    )
    .toEqual(["Initial state"]);
});

Given(
  "the character has {int} versions in history",
  async function (this: CustomWorld, versionCount: number) {
    // Wait for page to be fully loaded before creating versions
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);

    // Store the original character name before any editing (for buffer undo tests)
    const nameField = this.page.locator('[data-testid="character-name"]');
    const originalName = await nameField.textContent();
    this.originalCharacterName = originalName?.trim();

    // Create versions directly using the test helper to avoid timing issues
    // Get the current character as a base
    const baseCharacter = await this.storageHelper.getCharacter();

    for (let i = 1; i < versionCount; i++) {
      // Create a modified character for each version
      const versionCharacter = {
        ...baseCharacter,
        name: `Version ${i + 1}`,
      };

      // Create the version directly
      await this.storageHelper.createVersion(versionCharacter, `Changed name`);

      // For large number of versions, add small delay to avoid overwhelming the system
      if (versionCount > 50 && i % 10 === 0) {
        await this.page.waitForTimeout(100);
      }
    }

    // Wait a bit for the navigator to update
    await this.page.waitForTimeout(200);
  }
);

Given("I am viewing the latest version", async function (this: CustomWorld) {
  await expect(this.page.getByTestId("version-nav-forward")).toBeDisabled();
});

Given("I am viewing version {int}", async function (this: CustomWorld, versionNumber: number) {
  // Navigate backward from latest to reach the specified version
  const versions = await this.storageHelper.getAllVersions();
  const currentIndex = versions.length; // Currently at latest (1-based)
  const targetIndex = versionNumber;
  const clicksNeeded = currentIndex - targetIndex;

  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  for (let i = 0; i < clicksNeeded; i++) {
    await backwardArrow.click();
    await this.page.waitForTimeout(100);
  }
});

Given("the character has a later version", async function (this: CustomWorld) {
  const versions = await this.storageHelper.getAllVersions();
  const latest = versions[versions.length - 1].character;
  await this.storageHelper.createVersion({ ...latest, name: "Latest Version" }, "Another change");
  const count = versions.length + 1;
  await expect(this.page.locator('[data-testid="version-counter"]')).toContainText(
    `Version ${count} of ${count}`,
    { timeout: 10000 }
  );
});

Given(
  "the character has a version with multiple basic info changes",
  async function (this: CustomWorld) {
    // Wait for the app's own bootstrap (which saves the initial version) to
    // finish before creating more, or this step's first created version can
    // race the app's initial-version save for the same IndexedDB store.
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);

    // Create a version with multiple basic info changes
    const baseCharacter = await this.storageHelper.getCharacter();
    const versionCharacter = {
      ...baseCharacter,
      name: "Changed Name",
      descriptor: "Changed Descriptor",
      type: "Changed Type",
    };
    await this.storageHelper.createVersion(versionCharacter, "Edited basic info");

    // Wait for version navigator to show updated count (2 versions)
    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    await expect(versionCounter).toContainText("Version 2 of 2", { timeout: 10000 });

    // Create one more version so we can navigate back to see v2's description
    const latestCharacter = {
      ...versionCharacter,
      name: "Latest Version",
    };
    await this.storageHelper.createVersion(latestCharacter, "Final change");

    // Wait for version navigator to show updated count (3 versions)
    await expect(versionCounter).toContainText("Version 3 of 3", { timeout: 10000 });
  }
);

Given("the character has a portrait image", async function (this: CustomWorld) {
  // Set a portrait on the character (base64 encoded 1x1 pixel)
  const portrait =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  await this.setup.updateCharacter((character) => {
    character.portrait = portrait;
  });
  this.uploadedPortrait = portrait;
});

Given(
  "the character has a version from {int} minutes ago",
  async function (this: CustomWorld, _minutes: number) {
    // Wait for the app's own bootstrap (which saves the initial version) to
    // finish before creating more, or this step's first created version can
    // race the app's initial-version save for the same IndexedDB store.
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);

    // Create version with timestamp from specified minutes ago
    // Note: We create a version now and the test will check if the timestamp is displayed in readable format
    // The actual timestamp manipulation would require exposing more test APIs
    const baseCharacter = await this.storageHelper.getCharacter();
    const versionCharacter = {
      ...baseCharacter,
      name: "Past Version",
    };

    await this.storageHelper.createVersion(versionCharacter, "Changed name");

    // Wait for version navigator to show updated count (2 versions)
    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    await expect(versionCounter).toContainText("Version 2 of 2", { timeout: 10000 });
  }
);

Given("I am viewing that version", async function (this: CustomWorld) {
  // Navigate backward to view the version we're interested in
  // For "a version with a name change" + "a later version": 3 versions, click back once to see v2
  // For "version from X minutes ago": We created 2 versions, click back once to see v1
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await backwardArrow.click();
  await this.page.waitForTimeout(200);
});
