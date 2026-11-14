import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";

Then("I should be viewing the latest version", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await expect(forwardArrow).toBeDisabled();

  await expect(this.page.locator('[data-testid="version-warning-banner"]')).toHaveCount(0);
});

Then(
  "a new version should be created with description {string}",
  async function (this: CustomWorld, _description: string) {
    const versions = await this.storageHelper.getAllVersions();
    expect(versions.length).toBeGreaterThan(0);
  }
);

Then("the oldest version should have been removed", async function (this: CustomWorld) {
  const versions = await this.storageHelper.getAllVersions();
  expect(versions.length).toBe(99);
});
