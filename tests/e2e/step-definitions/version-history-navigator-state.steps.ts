import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";

// Then steps

Then("the version navigator should not be visible", async function (this: CustomWorld) {
  // Check if version navigator element exists or is hidden
  const versionNavigator = await this.page.locator('[data-testid="version-navigator"]').count();
  expect(versionNavigator).toBe(0);
});

Then("all edit controls should be enabled", async function (this: CustomWorld) {
  // Verify edit controls are not disabled (read-only mode not active)
  const readOnlyIndicator = await this.page.locator('[data-readonly="true"]').count();
  expect(readOnlyIndicator).toBe(0);
});

Then("the version navigator should be visible", async function (this: CustomWorld) {
  const versionNavigator = this.page.locator('[data-testid="version-navigator"]');
  await expect(versionNavigator).toBeVisible();
});

Then(
  "the version counter should show {string}",
  async function (this: CustomWorld, counterText: string) {
    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    await expect(versionCounter).toHaveText(counterText);
  }
);

Then("no warning banner should be visible", async function (this: CustomWorld) {
  const warningBanner = await this.page.locator('[data-testid="version-warning-banner"]').count();
  expect(warningBanner).toBe(0);
});

Then("the backward arrow should be enabled", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await expect(backwardArrow).toBeEnabled();
});

Then("the forward arrow should be disabled", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await expect(forwardArrow).toBeDisabled();
});

Then(
  "the character data should match version {int}",
  async function (this: CustomWorld, versionNumber: number) {
    // Get all versions from storage
    const versions = await this.storageHelper.getAllVersions();

    // Version number is 1-based, array is 0-based
    const expectedVersion = versions[versionNumber - 1];

    // Get the displayed character name
    const nameField = this.page.locator('[data-testid="character-name"]');
    const displayedName = await nameField.textContent();

    // Compare with expected version's character name
    expect(displayedName?.trim()).toBe(expectedVersion.character.name);
  }
);

Then("the change description should be displayed", async function (this: CustomWorld) {
  // The change description should be visible within the warning banner
  const changeDescription = this.page.locator('[data-testid="version-change-description"]');
  await expect(changeDescription).toBeVisible();
  // It should contain some text (not be empty)
  const text = await changeDescription.textContent();
  expect(text?.trim().length).toBeGreaterThan(0);
});

Then("the timestamp should be displayed", async function (this: CustomWorld) {
  // The timestamp should be visible within the warning banner
  const timestamp = this.page.locator('[data-testid="version-timestamp"]');
  await expect(timestamp).toBeVisible();
  // It should contain some text (not be empty)
  const text = await timestamp.textContent();
  expect(text?.trim().length).toBeGreaterThan(0);
});

Then("both navigation arrows should be enabled", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await expect(backwardArrow).toBeEnabled();
  await expect(forwardArrow).toBeEnabled();
});

Then("the warning banner should be visible", async function (this: CustomWorld) {
  const warningBanner = this.page.locator('[data-testid="version-warning-banner"]');
  await expect(warningBanner).toBeVisible();
});

Then("the backward arrow should be disabled", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await expect(backwardArrow).toBeDisabled();
});

Then("the forward arrow should be enabled", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await expect(forwardArrow).toBeEnabled();
});

Then(
  "the warning banner should contain text {string}",
  async function (this: CustomWorld, text: string) {
    const warningBanner = this.page.locator('[data-testid="version-warning-banner"]');
    await expect(warningBanner).toContainText(text);
  }
);

Then("the warning banner should have a restore button", async function (this: CustomWorld) {
  const restoreButton = this.page.locator('[data-testid="version-restore-button"]');
  await expect(restoreButton).toBeVisible();
});
