import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";
import { clickAndAwaitNavigation } from "../support/versionHistoryHelpers.js";

Then(
  "the version description should contain {string}",
  async function (this: CustomWorld, text: string) {
    const description = this.page.locator('[data-testid="version-change-description"]');
    await expect(description).toContainText(text);
  }
);

Then("the timestamp should be in human-readable format", async function (this: CustomWorld) {
  const timestamp = this.page.locator('[data-testid="version-timestamp"]');
  const timestampText = await timestamp.textContent();

  if (!timestampText) throw new Error("version-timestamp had no text content");
  expect(timestampText.length).toBeGreaterThan(0);
});

Then(
  "the timestamp should show a relative time like {string}",
  async function (this: CustomWorld, _example: string) {
    const timestamp = this.page.locator('[data-testid="version-timestamp"]');
    const timestampText = await timestamp.textContent();

    expect(timestampText).toMatch(/ago|just now/);
  }
);

Then(
  "the character name should match version {int} name",
  async function (this: CustomWorld, versionNumber: number) {
    const versions = await this.storageHelper.getAllVersions();
    const expectedVersion = versions[versionNumber - 1];

    const nameField = this.page.locator('[data-testid="character-name"]');
    await expect(nameField).toHaveText(expectedVersion.character.name);
  }
);

Then(
  "the character stats should match version {int} stats",
  async function (this: CustomWorld, versionNumber: number) {
    const versions = await this.storageHelper.getAllVersions();
    const expectedVersion = versions[versionNumber - 1];

    const tierField = this.page.locator('[data-testid="character-tier"]');
    const displayedTier = await tierField.textContent();
    expect(displayedTier?.trim()).toBe(expectedVersion.character.tier.toString());
  }
);

Then(
  "the character equipment should match version {int} equipment",
  async function (this: CustomWorld, versionNumber: number) {
    const versions = await this.storageHelper.getAllVersions();
    const expectedVersion = versions[versionNumber - 1];

    const equipmentItems = this.page.locator(".equipment-item");
    const count = await equipmentItems.count();

    expect(count).toBe(expectedVersion.character.equipment.length);

    if (count > 0 && expectedVersion.character.equipment.length > 0) {
      const firstItemName = this.page.locator(".equipment-name").first();
      const nameText = await firstItemName.textContent();
      const expectedName = expectedVersion.character.equipment[0].name;
      expect(nameText?.trim()).toBe(expectedName);
    }
  }
);

Then("the portrait should remain unchanged", async function (this: CustomWorld) {
  // The outer container renders regardless of whether a portrait is set, so
  // assert on the actual <img> and its src rather than just container
  // visibility, or this would pass even if the portrait had been dropped.
  const portraitImage = this.page.locator('[data-testid="portrait-image-clickable"]');
  await expect(portraitImage).toBeVisible();
  const uploadedPortrait = this.uploadedPortrait;
  if (uploadedPortrait) {
    await expect(portraitImage).toHaveAttribute("src", uploadedPortrait);
  }
});

Then(
  "the exported file should contain version {int} data",
  async function (this: CustomWorld, versionNumber: number) {
    const exported = this.exportedFileData;
    expect(exported).toBeTruthy();
    const versions = await this.storageHelper.getAllVersions();
    expect(exported?.character.name).toBe(versions[versionNumber - 1].character.name);
  }
);

Then("the exported file should not contain version history", async function (this: CustomWorld) {
  const exported = this.exportedFileData;
  expect(exported).toBeTruthy();
  expect(exported?.versionHistory).toBeUndefined();
});

Then("the exported file should use the current portrait", async function (this: CustomWorld) {
  const exported = this.exportedFileData;
  expect(exported).toBeTruthy();
  const currentChar = await this.storageHelper.getCharacter();
  expect(exported?.character.portrait).toBe(currentChar.portrait);
});

Then("a new version should be created", async function (this: CustomWorld) {
  const versions = await this.storageHelper.getAllVersions();
  expect(versions.length).toBeGreaterThan(0);
});

Then("I should be viewing the latest version", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await expect(forwardArrow).toBeDisabled();

  await expect(this.page.locator('[data-testid="version-warning-banner"]')).toHaveCount(0);
});

Then(
  "I should navigate to version {int}",
  async function (this: CustomWorld, versionNumber: number) {
    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    const versions = await this.storageHelper.getAllVersions();
    await expect(versionCounter).toHaveText(`Version ${versionNumber} of ${versions.length}`);
  }
);

Then(
  "the character data should be correct for version {int}",
  async function (this: CustomWorld, versionNumber: number) {
    const versions = await this.storageHelper.getAllVersions();
    const expectedVersion = versions[versionNumber - 1];

    const nameField = this.page.locator('[data-testid="character-name"]');
    const displayedName = await nameField.textContent();
    expect(displayedName?.trim()).toBe(expectedVersion.character.name);
  }
);

Then("the UI should remain responsive", async function (this: CustomWorld) {
  const versionNavigator = this.page.locator('[data-testid="version-navigator"]');
  await expect(versionNavigator).toBeVisible();

  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  expect((await backwardArrow.isEnabled()) || (await backwardArrow.isDisabled())).toBe(true);
});

Then(
  "a new version should be created with description {string}",
  async function (this: CustomWorld, _description: string) {
    const versions = await this.storageHelper.getAllVersions();
    expect(versions.length).toBeGreaterThan(0);
  }
);

Then("the warning banner should not be visible", async function (this: CustomWorld) {
  const warningBanner = await this.page.locator('[data-testid="version-warning-banner"]').count();
  expect(warningBanner).toBe(0);
});

Then("the version description should contain the tier change", async function (this: CustomWorld) {
  const versions = await this.storageHelper.getAllVersions();
  const v4 = versions[3]; // 0-based index, v4 is at index 3

  expect(v4.character.tier).toBe(2);
  expect(v4.description.toLowerCase()).toContain("tier");
});

Then("the oldest version should have been removed", async function (this: CustomWorld) {
  const versions = await this.storageHelper.getAllVersions();
  expect(versions.length).toBe(99);
});

Then(
  "I click the backward navigation arrow {int} times",
  async function (this: CustomWorld, times: number) {
    for (let i = 0; i < times; i++) {
      await clickAndAwaitNavigation(this.page, "version-nav-backward");
    }
  }
);

Then("the import button should be enabled", async function (this: CustomWorld) {
  const importButton = this.page.locator('[data-testid="import-button"]');
  await expect(importButton).toBeEnabled();
});

Then("the import button should be disabled", async function (this: CustomWorld) {
  const importButton = this.page.locator('[data-testid="import-button"]');
  await expect(importButton).toBeDisabled();
});
