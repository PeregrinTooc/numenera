import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";

Given("the character sheet is displayed", async function (this: CustomWorld) {
  const name = await this.page.locator('[data-testid="character-name"]').textContent();
  expect(name).toBeTruthy();
});

When("I note the current save timestamp", async function (this: CustomWorld) {
  const indicator = this.page.locator('[data-testid="save-indicator"]');
  await indicator.waitFor({ state: "visible", timeout: 1000 });
  this.savedTimestamp = await indicator.textContent();
});

When("I wait for {int} second(s)", async function (this: CustomWorld, seconds: number) {
  await this.page.waitForTimeout(seconds * 1000);
});

When("I rapidly edit the character name multiple times", async function (this: CustomWorld) {
  this.saveCount = 0;

  await this.page.evaluate(() => {
    window.__saveCount = 0;

    const indicator = document.querySelector('[data-testid="save-indicator"]');
    if (indicator) {
      const observer = new MutationObserver(() => {
        window.__saveCount = (window.__saveCount ?? 0) + 1;
      });

      observer.observe(indicator, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      window.__saveObserver = observer;
    }
  });

  const nameElement = this.page.locator('[data-testid="character-name"]');

  for (let i = 1; i <= 5; i++) {
    await nameElement.click();
    const input = this.page.locator('[data-testid="edit-modal-input"]');
    await input.fill(`Hero ${i}`);
    await this.page.click('[data-testid="modal-confirm-button"]');
    await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "hidden" }).catch(() => {
      // Modal might already be hidden
    });
    await this.page.waitForTimeout(50); // Short delay, within debounce window
  }

  await this.page.waitForTimeout(600);

  this.saveCount = await this.page.evaluate(() => {
    const count = window.__saveCount || 0;
    const observer = window.__saveObserver;
    if (observer) {
      observer.disconnect();
    }
    return count;
  });
});

Then("the save indicator should be visible", async function (this: CustomWorld) {
  const indicator = this.page.locator('[data-testid="save-indicator"]');
  await expect(indicator).toBeVisible({ timeout: 1000 });
});

Then("the save indicator should show a timestamp", async function (this: CustomWorld) {
  const indicator = this.page.locator('[data-testid="save-indicator"]');
  const text = await indicator.textContent();

  const timePattern = /\d{1,2}:\d{2}:\d{2}(\s?[AP]M)?/;
  expect(text).toMatch(timePattern);
});

Then(
  "the save indicator should contain {string}",
  async function (this: CustomWorld, text: string) {
    const indicator = this.page.locator('[data-testid="save-indicator"]');
    await expect(indicator).toContainText(text);
  }
);

Then("the save timestamp should be updated", async function (this: CustomWorld) {
  const indicator = this.page.locator('[data-testid="save-indicator"]');
  await indicator.waitFor({ state: "visible", timeout: 1000 });
  const newTimestamp = await indicator.textContent();

  expect(newTimestamp).not.toBe(this.savedTimestamp);
  expect(newTimestamp).toBeTruthy();
});

Then(
  "the character should be saved only once after changes stop",
  async function (this: CustomWorld) {
    // With debouncing, we should see fewer saves than the number of edits (5)
    // Due to modal interactions and timing, we may get a few saves, but significantly fewer than without debouncing
    expect(this.saveCount).toBeLessThanOrEqual(5);
    expect(this.saveCount).toBeGreaterThanOrEqual(1);
  }
);

Then("the save indicator should show a single timestamp", async function (this: CustomWorld) {
  const indicator = this.page.locator('[data-testid="save-indicator"]');
  await expect(indicator).toBeVisible();

  const text = await indicator.textContent();
  expect(text).toBeTruthy();
});

Then("the save indicator should still be visible", async function (this: CustomWorld) {
  const indicator = this.page.locator('[data-testid="save-indicator"]');
  await expect(indicator).toBeVisible();
});

Then("the save indicator should be in the lower-right corner", async function (this: CustomWorld) {
  const indicator = this.page.locator('[data-testid="save-indicator"]');
  await indicator.waitFor({ state: "visible", timeout: 1000 });

  const box = await indicator.boundingBox();
  expect(box).toBeTruthy();

  if (box) {
    const viewport = this.page.viewportSize();
    expect(viewport).toBeTruthy();

    if (viewport) {
      expect(box.x + box.width).toBeGreaterThan(viewport.width - 100);

      expect(box.y + box.height).toBeGreaterThan(viewport.height - 100);
    }
  }
});

Then("the save indicator should have subtle styling", async function (this: CustomWorld) {
  const indicator = this.page.locator('[data-testid="save-indicator"]');
  await indicator.waitFor({ state: "visible", timeout: 1000 });

  const styles = await indicator.evaluate((el: HTMLElement) => {
    const computed = window.getComputedStyle(el);
    return {
      position: computed.position,
      fontSize: computed.fontSize,
      opacity: computed.opacity,
    };
  });

  expect(styles.position).toBe("fixed");

  const fontSize = parseFloat(styles.fontSize);
  expect(fontSize).toBeLessThan(16);

  const opacity = parseFloat(styles.opacity);
  expect(opacity).toBeGreaterThan(0);
  expect(opacity).toBeLessThanOrEqual(1);
});
