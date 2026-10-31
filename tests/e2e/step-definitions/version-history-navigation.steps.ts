import { When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";
import { waitForCharacterSheetReady } from "../support/app-ready.js";

// When steps

When("I view the character sheet", async function (this: CustomWorld) {
  await this.page.reload();
  await waitForCharacterSheetReady(this.page);
});

// Note: "I edit the character name to {string}" already exists in auto-save-indicator.steps.ts
// and it already clicks the confirm button

When("I click the backward navigation arrow", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await backwardArrow.click();
  // Wait a bit for navigation to complete
  await this.page.waitForTimeout(100);
});

When("I click the backward navigation arrow again", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await backwardArrow.click();
  await this.page.waitForTimeout(100);
});

When("I click the return to latest button", async function (this: CustomWorld) {
  const returnButton = this.page.locator('[data-testid="version-return-button"]');
  await returnButton.click();
  await this.page.waitForTimeout(100);
});

When("I click the forward navigation arrow", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await forwardArrow.click();
  await this.page.waitForTimeout(100);
});

When("I click the forward navigation arrow again", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await forwardArrow.click();
  await this.page.waitForTimeout(100);
});

When("I click the restore button in the warning banner", async function (this: CustomWorld) {
  const restoreButton = this.page.locator('[data-testid="version-restore-button"]');
  await restoreButton.click();
  await this.page.waitForTimeout(100);
});

When("I navigate to version {int}", async function (this: CustomWorld, versionNumber: number) {
  // Navigate to specific version from current position
  const versions = await this.storageHelper.getAllVersions();

  // Get current version from the counter display
  const versionCounter = this.page.locator('[data-testid="version-counter"]');
  const counterText = await versionCounter.textContent();
  const currentMatch = counterText?.match(/Version (\d+) of/);
  const currentIndex = currentMatch ? parseInt(currentMatch[1]) : versions.length;

  const targetIndex = versionNumber;

  if (targetIndex < currentIndex) {
    // Navigate backward
    const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
    const clicksNeeded = currentIndex - targetIndex;

    for (let i = 0; i < clicksNeeded; i++) {
      await expect(backwardArrow).toBeEnabled({ timeout: 5000 });
      await backwardArrow.click();
      await this.page.waitForTimeout(300);
      await this.page.waitForLoadState("networkidle");
    }
    await this.page.waitForTimeout(500);
  } else if (targetIndex > currentIndex) {
    // Navigate forward
    const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
    const clicksNeeded = targetIndex - currentIndex;

    for (let i = 0; i < clicksNeeded; i++) {
      await expect(forwardArrow).toBeEnabled({ timeout: 5000 });
      await forwardArrow.click();
      await this.page.waitForTimeout(300);
      await this.page.waitForLoadState("networkidle");
    }
    await this.page.waitForTimeout(500);
  }
  // else: already at target version, no navigation needed
});

When("I navigate backward", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await backwardArrow.click();
  await this.page.waitForTimeout(100);
});

When("I navigate forward twice", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await forwardArrow.click();
  await this.page.waitForTimeout(100);
  await forwardArrow.click();
  await this.page.waitForTimeout(100);
});

When(
  "I rapidly click the backward arrow {int} times",
  async function (this: CustomWorld, times: number) {
    const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
    for (let i = 0; i < times; i++) {
      await backwardArrow.click();
      // Very short wait for rapid clicking
      await this.page.waitForTimeout(10);
    }
    // Wait a bit longer at the end for UI to catch up
    await this.page.waitForTimeout(200);
  }
);

When("I refresh the browser", async function (this: CustomWorld) {
  await this.page.reload();
  await waitForCharacterSheetReady(this.page);
});

// Note: "I edit the character tier to {int}" is now handled by the unified
// "I edit the {string} field to {string}" step in common-steps.ts

When("I create a new version by editing the name", async function (this: CustomWorld) {
  // Use the unified edit step
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
  await this.page.waitForTimeout(200);
});

// Note: "I export the character" is defined in character-file-export.steps.ts
// Note: "I edit the character name" can use the existing step with parameter
