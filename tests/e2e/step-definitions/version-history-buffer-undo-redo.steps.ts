import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";

When(
  "I press {string} before the squash timer expires",
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
  }
);

When("I press {string} again", async function (this: CustomWorld, keyCombo: string) {
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
});

When(
  "I press {string} again before the squash timer expires",
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
  }
);

Then(
  "the character name should be {string}",
  async function (this: CustomWorld, expectedName: string) {
    const nameField = this.page.locator('[data-testid="character-name"]');
    await expect(nameField).toHaveText(expectedName);
  }
);

Then("no new version should be created yet", async function (this: CustomWorld) {
  const versions = await this.storageHelper.getAllVersions();

  expect(versions.length).toBe(3);
});

Then("the character name should revert to the original value", async function (this: CustomWorld) {
  const originalName = this.originalCharacterName;
  if (!originalName) throw new Error("originalCharacterName was not recorded");

  const nameField = this.page.locator('[data-testid="character-name"]');
  await expect(nameField).toHaveText(originalName);
});

Then(
  "I should see {int} versions in history",
  async function (this: CustomWorld, expectedCount: number) {
    const versions = await this.storageHelper.getAllVersions();
    expect(versions.length).toBe(expectedCount);
  }
);

Then("the changes should be reapplied", async function (this: CustomWorld) {
  const nameField = this.page.locator('[data-testid="character-name"]');
  await expect(nameField).toHaveText("First Edit");
});
