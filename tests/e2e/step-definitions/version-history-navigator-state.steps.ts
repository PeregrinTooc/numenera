import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";

Then("the version navigator should not be visible", async function (this: CustomWorld) {
  const versionNavigator = await this.page.locator('[data-testid="version-navigator"]').count();
  expect(versionNavigator).toBe(0);
});

Then("all edit controls should be enabled", async function (this: CustomWorld) {
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

Then("the warning banner should be visible", async function (this: CustomWorld) {
  const warningBanner = this.page.locator('[data-testid="version-warning-banner"]');
  await expect(warningBanner).toBeVisible();
});
