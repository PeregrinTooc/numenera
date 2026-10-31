import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";

// Buffer-based undo/redo step definitions

When(
  "I press {string} before the squash timer expires",
  async function (this: CustomWorld, keyCombo: string) {
    // Dispatch KeyboardEvent before squash timer expires (don't wait)
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

    // Wait for UI to update but NOT for squash to complete
    await this.page.waitForTimeout(200);
  }
);

When("I press {string} again", async function (this: CustomWorld, keyCombo: string) {
  // Dispatch KeyboardEvent (same as regular press)
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

  await this.page.waitForTimeout(200);
});

When(
  "I press {string} again before the squash timer expires",
  async function (this: CustomWorld, keyCombo: string) {
    // Dispatch KeyboardEvent before squash timer expires (same as "before the squash timer expires")
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

    // Wait for UI to update but NOT for squash to complete
    await this.page.waitForTimeout(200);
  }
);

Then(
  "the character name should be {string}",
  async function (this: CustomWorld, expectedName: string) {
    const nameField = this.page.locator('[data-testid="character-name"]');
    const actualName = await nameField.textContent();
    expect(actualName?.trim()).toBe(expectedName);
  }
);

Then("no new version should be created yet", async function (this: CustomWorld) {
  // Version count should remain the same (no squash has occurred)
  const versions = await this.storageHelper.getAllVersions();

  // We started with 3 versions in history, should still have 3
  // (The test context should have stored the initial count if needed)
  expect(versions.length).toBe(3);
});

Then("the character name should revert to the original value", async function (this: CustomWorld) {
  // Get the stored original name from test context
  const originalName = this.originalCharacterName;
  expect(originalName).toBeTruthy();

  const nameField = this.page.locator('[data-testid="character-name"]');
  const actualName = await nameField.textContent();
  expect(actualName?.trim()).toBe(originalName);
});

Then(
  "I should see {int} versions in history",
  async function (this: CustomWorld, expectedCount: number) {
    const versions = await this.storageHelper.getAllVersions();
    expect(versions.length).toBe(expectedCount);
  }
);

Then("the changes should be reapplied", async function (this: CustomWorld) {
  // After redo, the character name should be back to "First Edit" (the first redo)
  // The test will press Control+Y once, which should redo the first undone change
  const nameField = this.page.locator('[data-testid="character-name"]');
  const actualName = await nameField.textContent();

  // After first redo, we should see "First Edit"
  expect(actualName?.trim()).toBe("First Edit");
});
