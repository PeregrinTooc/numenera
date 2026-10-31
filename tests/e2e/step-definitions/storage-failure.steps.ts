import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { failStorageWrites, restoreStorageWrites } from "../support/storageFailure.js";

Given("the browser storage is full", async function (this: CustomWorld) {
  await failStorageWrites(this.page, "QuotaExceededError");
});

Given("writing to the browser storage fails", async function (this: CustomWorld) {
  await failStorageWrites(this.page, "UnknownError");
});

When("the browser storage works again", async function (this: CustomWorld) {
  await restoreStorageWrites(this.page);
});

Then("the save indicator should report that storage is full", async function (this: CustomWorld) {
  const alert = this.page.locator('[data-testid="save-indicator"][role="alert"]');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("Storage is full");
});

Then(
  "the save indicator should report that changes could not be saved",
  async function (this: CustomWorld) {
    const alert = this.page.locator('[data-testid="save-indicator"][role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Changes could not be saved");
  }
);

Then("the save indicator should not report a storage problem", async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="save-indicator"][role="alert"]')).toHaveCount(0);
});

Then(
  "the save indicator should not contain {string}",
  async function (this: CustomWorld, text: string) {
    await expect(this.page.locator('[data-testid="save-indicator"]')).not.toContainText(text);
  }
);

Then("the save indicator should be inside the viewport", async function (this: CustomWorld) {
  const box = await this.page.locator('[data-testid="save-indicator"]').boundingBox();
  const viewport = this.page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (box && viewport) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  }
});
