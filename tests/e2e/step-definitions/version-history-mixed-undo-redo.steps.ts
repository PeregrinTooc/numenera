import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";
import { forceSquash } from "../support/versionHistoryHelpers.js";

When(
  "I make {int} rapid edits that are buffered",
  async function (this: CustomWorld, editCount: number) {
    const testId = "character-name";
    const field = this.page.locator(`[data-testid="${testId}"]`);

    for (let i = 1; i <= editCount; i++) {
      await field.click();
      const modal = this.page.locator('[data-testid="edit-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
      const input = this.page.locator('[data-testid="edit-modal-input"]');
      await input.fill(`Rapid Edit ${i}`);
      const confirmButton = this.page.locator('[data-testid="modal-confirm-button"]');
      await confirmButton.click();
      await expect(modal).toHaveCount(0, { timeout: 2000 });
      await this.page.waitForTimeout(100);
    }
  }
);

When(
  "I press {string} to undo buffered changes",
  async function (this: CustomWorld, keyCombo: string) {
    if (keyCombo === "Control+Z") {
      const undoCompletedPromise = this.page.evaluate(() => {
        return new Promise<void>((resolve) => {
          const handler = () => {
            window.removeEventListener("undo-completed", handler);
            resolve();
          };
          window.addEventListener("undo-completed", handler);
        });
      });

      await this.page.evaluate(() => {
        const event = new KeyboardEvent("keydown", {
          key: "z",
          code: "KeyZ",
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        document.body.dispatchEvent(event);
      });

      await undoCompletedPromise;
    }

    await this.page.waitForTimeout(100);
  }
);

When("I wait for squash timer to complete", async function (this: CustomWorld) {
  await forceSquash(this.page);
});

When(
  "I press {string} to navigate to previous version",
  async function (this: CustomWorld, keyCombo: string) {
    if (keyCombo === "Control+Z") {
      await this.page.evaluate(() => {
        const event = new KeyboardEvent("keydown", {
          key: "z",
          code: "KeyZ",
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        document.body.dispatchEvent(event);
      });
    } else if (keyCombo === "Control+Y") {
      await this.page.evaluate(() => {
        const event = new KeyboardEvent("keydown", {
          key: "y",
          code: "KeyY",
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        document.body.dispatchEvent(event);
      });
    }

    await this.page.waitForTimeout(800);
  }
);

Then(
  "I should be viewing version {int}",
  async function (this: CustomWorld, versionNumber: number) {
    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    const versions = await this.storageHelper.getAllVersions();
    await expect(versionCounter).toHaveText(`Version ${versionNumber} of ${versions.length}`);

    const expectedVersion = versions[versionNumber - 1];
    const nameField = this.page.locator('[data-testid="character-name"]');
    const displayedName = await nameField.textContent();
    expect(displayedName?.trim()).toBe(expectedVersion.character.name);
  }
);
