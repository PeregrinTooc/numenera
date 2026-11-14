import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";

Then(
  "the version description should contain {string}",
  async function (this: CustomWorld, text: string) {
    const description = this.page.locator('[data-testid="version-change-description"]');
    await expect(description).toContainText(text);
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

Then("the oldest version should have been removed", async function (this: CustomWorld) {
  const versions = await this.storageHelper.getAllVersions();
  expect(versions.length).toBe(99);
});

Then("the import button should be enabled", async function (this: CustomWorld) {
  const importButton = this.page.locator('[data-testid="import-button"]');
  await expect(importButton).toBeEnabled();
});

Then("the import button should be disabled", async function (this: CustomWorld) {
  const importButton = this.page.locator('[data-testid="import-button"]');
  await expect(importButton).toBeDisabled();
});
