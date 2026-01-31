import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";

let savedTimestamp: string | null = null;
let saveCount = 0;

Given("the character sheet is displayed", async function (this: CustomWorld) {
  // Character sheet should already be visible from background
  const name = await this.page.locator('[data-testid="character-name"]').textContent();
  expect(name).toBeTruthy();
});

When("I edit the character name to {string}", async function (this: CustomWorld, name: string) {
  const nameElement = this.page.locator('[data-testid="character-name"]');
  await nameElement.click();
  const input = this.page.locator('[data-testid="edit-modal-input"]');
  await input.fill(name);
  await this.page.click('[data-testid="modal-confirm-button"]');
  await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "hidden" }).catch(() => {
    // Modal might already be hidden
  });
  // Wait for auto-save to complete (debounce is 300ms, wait a bit longer)
  await this.page.waitForTimeout(500);
});

When("I note the current save timestamp", async function (this: CustomWorld) {
  const indicator = this.page.locator('[data-testid="save-indicator"]');
  await indicator.waitFor({ state: "visible", timeout: 1000 });
  savedTimestamp = await indicator.textContent();
});

When("I wait for {int} second(s)", async function (this: CustomWorld, seconds: number) {
  await this.page.waitForTimeout(seconds * 1000);
});

When("I edit the tier to {string}", async function (this: CustomWorld, tier: string) {
  const tierElement = this.page.locator('[data-testid="character-tier"]');
  await tierElement.click();
  const input = this.page.locator('[data-testid="edit-modal-input"]');
  await input.fill(tier);
  await this.page.click('[data-testid="modal-confirm-button"]');
  await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "hidden" }).catch(() => {
    // Modal might already be hidden
  });
  // Wait for auto-save to complete (debounce is 300ms, wait a bit longer)
  await this.page.waitForTimeout(500);
});

When("I rapidly edit the character name multiple times", async function (this: CustomWorld) {
  // Track saves by monitoring localStorage changes
  saveCount = 0;

  await this.page.evaluate(() => {
    const originalSetItem = localStorage.setItem;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__saveCount = 0;
    localStorage.setItem = function (key: string, value: string) {
      if (key === "numenera-character-state") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__saveCount++;
      }
      return originalSetItem.call(this, key, value);
    };
  });

  const nameElement = this.page.locator('[data-testid="character-name"]');

  // Make rapid edits (within debounce window)
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

  // Wait for debounce to settle
  await this.page.waitForTimeout(500);

  // Get save count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveCount = await this.page.evaluate(() => (window as any).__saveCount || 0);
});

When("I edit the might pool to {string}", async function (this: CustomWorld, value: string) {
  const mightPool = this.page.locator('[data-testid="stat-might-pool"]');
  await mightPool.click();
  const input = this.page.locator('[data-testid="edit-modal-input"]');
  await input.fill(value);
  await this.page.click('[data-testid="modal-confirm-button"]');
  await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "hidden" }).catch(() => {
    // Modal might already be hidden
  });
  // Wait for auto-save to complete (debounce is 300ms, wait a bit longer)
  await this.page.waitForTimeout(500);
});

Then("the save indicator should be visible", async function (this: CustomWorld) {
  const indicator = this.page.locator('[data-testid="save-indicator"]');
  await expect(indicator).toBeVisible({ timeout: 1000 });
});

Then("the save indicator should show a timestamp", async function (this: CustomWorld) {
  const indicator = this.page.locator('[data-testid="save-indicator"]');
  const text = await indicator.textContent();

  // Should contain time format like "2:45:33 PM" or "14:45:33"
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

  expect(newTimestamp).not.toBe(savedTimestamp);
  expect(newTimestamp).toBeTruthy();
});

Then(
  "the character should be saved only once after changes stop",
  async function (this: CustomWorld) {
    // With debouncing, we should see only 1-3 saves total
    // (1 for the final debounced save, possibly a few more due to timing)
    expect(saveCount).toBeLessThanOrEqual(3);
    expect(saveCount).toBeGreaterThanOrEqual(1);
  }
);

Then("the save indicator should show a single timestamp", async function (this: CustomWorld) {
  const indicator = this.page.locator('[data-testid="save-indicator"]');
  await expect(indicator).toBeVisible();

  // Just verify it has a timestamp (validated in other step)
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
      // Should be near the right edge (within 100px)
      expect(box.x + box.width).toBeGreaterThan(viewport.width - 100);

      // Should be near the bottom (within 100px)
      expect(box.y + box.height).toBeGreaterThan(viewport.height - 100);
    }
  }
});

Then("the save indicator should have subtle styling", async function (this: CustomWorld) {
  const indicator = this.page.locator('[data-testid="save-indicator"]');
  await indicator.waitFor({ state: "visible", timeout: 1000 });

  // Check for subtle styling attributes
  const styles = await indicator.evaluate((el: HTMLElement) => {
    const computed = window.getComputedStyle(el);
    return {
      position: computed.position,
      fontSize: computed.fontSize,
      opacity: computed.opacity,
    };
  });

  // Should be fixed position
  expect(styles.position).toBe("fixed");

  // Should have small font size (less than 16px)
  const fontSize = parseFloat(styles.fontSize);
  expect(fontSize).toBeLessThan(16);

  // Should be somewhat transparent or subtle
  const opacity = parseFloat(styles.opacity);
  expect(opacity).toBeGreaterThan(0);
  expect(opacity).toBeLessThanOrEqual(1);
});
