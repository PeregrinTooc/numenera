import { When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";
import { waitForCharacterSheetReady } from "../support/app-ready.js";
import { clickAndAwaitNavigation, readVersionPosition } from "../support/versionHistoryHelpers.js";

When("I view the character sheet", async function (this: CustomWorld) {
  await this.page.reload();
  await waitForCharacterSheetReady(this.page);
});

When("I click the backward navigation arrow", async function (this: CustomWorld) {
  await clickAndAwaitNavigation(this.page, "version-nav-backward");
});

When("I click the backward navigation arrow again", async function (this: CustomWorld) {
  await clickAndAwaitNavigation(this.page, "version-nav-backward");
});

When("I click the return to latest button", async function (this: CustomWorld) {
  await clickAndAwaitNavigation(this.page, "version-return-button");
});

When("I click the forward navigation arrow", async function (this: CustomWorld) {
  await clickAndAwaitNavigation(this.page, "version-nav-forward");
});

When("I click the forward navigation arrow again", async function (this: CustomWorld) {
  await clickAndAwaitNavigation(this.page, "version-nav-forward");
});

When("I click the restore button in the warning banner", async function (this: CustomWorld) {
  await clickAndAwaitNavigation(this.page, "version-restore-button");
});

When("I navigate to version {int}", async function (this: CustomWorld, versionNumber: number) {
  const { current } = await readVersionPosition(this.page);
  const direction = versionNumber < current ? "backward" : "forward";
  const arrow = this.page.locator(`[data-testid="version-nav-${direction}"]`);

  for (let i = 0; i < Math.abs(versionNumber - current); i++) {
    await expect(arrow).toBeEnabled({ timeout: 5000 });
    await clickAndAwaitNavigation(this.page, `version-nav-${direction}`);
  }
});

When("I navigate backward", async function (this: CustomWorld) {
  await clickAndAwaitNavigation(this.page, "version-nav-backward");
});

When("I navigate forward twice", async function (this: CustomWorld) {
  await clickAndAwaitNavigation(this.page, "version-nav-forward");
  await clickAndAwaitNavigation(this.page, "version-nav-forward");
});

When(
  "I rapidly click the backward arrow {int} times",
  async function (this: CustomWorld, times: number) {
    const { current, total } = await readVersionPosition(this.page);
    const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
    for (let i = 0; i < times; i++) {
      await backwardArrow.click();
    }
    await expect(this.page.locator('[data-testid="version-counter"]')).toHaveText(
      `Version ${current - times} of ${total}`
    );
  }
);

When("I refresh the browser", async function (this: CustomWorld) {
  await this.page.reload();
  await waitForCharacterSheetReady(this.page);
});

When("I create a new version by editing the name", async function (this: CustomWorld) {
  const testId = "character-name";
  const field = this.page.locator(`[data-testid="${testId}"]`);

  await field.click();

  const modal = this.page.locator('[data-testid="edit-modal"]');
  await expect(modal).toBeVisible({ timeout: 5000 });

  const input = this.page.locator('[data-testid="edit-modal-input"]');
  await input.fill("New Version Name");

  const confirmButton = this.page.locator('[data-testid="modal-confirm-button"]');
  await confirmButton.click();

  await expect(modal).toHaveCount(0, { timeout: 2000 });
  await expect(field).toHaveText("New Version Name");
});
