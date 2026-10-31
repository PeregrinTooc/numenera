import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world.js";

// ============================================================================
// COMPARISON VIEW STEP DEFINITIONS
// ============================================================================

// ----------------------------------------------------------------------------
// Settings toggle
// ----------------------------------------------------------------------------

async function setComparisonViewEnabled(world: CustomWorld, enabled: boolean): Promise<void> {
  await world.dom.getByTestId("settings-gear-button").click();
  await expect(world.dom.getByTestId("settings-panel")).toBeVisible();
  await world.page.waitForTimeout(50);

  const toggle = world.dom.getByTestId("settings-comparison-view-toggle");
  const isChecked = await toggle.isChecked();
  if (isChecked !== enabled) {
    await toggle.click();
  }

  await world.dom.getByTestId("settings-gear-button").click();
  await expect(world.dom.getByTestId("settings-panel")).not.toBeVisible();
}

Given("comparison view is enabled in settings", async function (this: CustomWorld) {
  await setComparisonViewEnabled(this, true);
});

When("I enable comparison view in settings", async function (this: CustomWorld) {
  const toggle = this.dom.getByTestId("settings-comparison-view-toggle");
  if (!(await toggle.isChecked())) {
    await toggle.click();
  }
});

When("I close the settings panel", async function (this: CustomWorld) {
  await this.dom.getByTestId("settings-gear-button").click();
  await expect(this.dom.getByTestId("settings-panel")).not.toBeVisible();
});

Then("comparison view should show as enabled in settings", async function (this: CustomWorld) {
  await expect(this.dom.getByTestId("settings-comparison-view-toggle")).toBeChecked();
});

// ----------------------------------------------------------------------------
// Opening / visibility
// ----------------------------------------------------------------------------

Given("I am viewing the comparison view", async function (this: CustomWorld) {
  await this.page.locator('[data-testid="version-nav-backward"]').click();
  await expect(this.page.locator('[data-testid="comparison-view"]')).toBeVisible();
});

Then("the comparison view should be visible", async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="comparison-view"]')).toBeVisible();
});

Then("the comparison view should not be visible", async function (this: CustomWorld) {
  const count = await this.page.locator('[data-testid="comparison-view"]').count();
  expect(count).toBe(0);
});

// ----------------------------------------------------------------------------
// Data setup - small paired versions for highlighting scenarios
// ----------------------------------------------------------------------------

async function waitForBootstrap(world: CustomWorld): Promise<void> {
  await world.page.waitForLoadState("networkidle");
  await world.page.waitForTimeout(500);
}

Given("the character has a version with a name change", async function (this: CustomWorld) {
  await waitForBootstrap(this);
  const base = await this.storageHelper.getCharacter();
  await this.storageHelper.createVersion({ ...base, name: "New Name" }, "Changed name");
  await expect(this.page.locator('[data-testid="version-counter"]')).toContainText(
    "Version 2 of 2",
    { timeout: 10000 }
  );
});

Given("the character has a version with an added cypher", async function (this: CustomWorld) {
  await waitForBootstrap(this);
  const base = await this.storageHelper.getCharacter();
  const withAdded = {
    ...base,
    cyphers: [...base.cyphers, { name: "New Cypher", level: "1d6", effect: "Something new" }],
  };
  await this.storageHelper.createVersion(withAdded, "Added cypher");
  await expect(this.page.locator('[data-testid="version-counter"]')).toContainText(
    "Version 2 of 2",
    { timeout: 10000 }
  );
});

Given("the character has a version with a removed cypher", async function (this: CustomWorld) {
  await waitForBootstrap(this);
  const base = await this.storageHelper.getCharacter();
  const withRemoved = { ...base, cyphers: base.cyphers.slice(1) };
  await this.storageHelper.createVersion(withRemoved, "Removed cypher");
  await expect(this.page.locator('[data-testid="version-counter"]')).toContainText(
    "Version 2 of 2",
    { timeout: 10000 }
  );
});

Given(
  "the character has a version with a modified cypher effect",
  async function (this: CustomWorld) {
    await waitForBootstrap(this);
    const base = await this.storageHelper.getCharacter();
    const modified = {
      ...base,
      cyphers: base.cyphers.map((c: { name: string; level: string; effect: string }, i: number) =>
        i === 0 ? { ...c, effect: "A completely different effect" } : c
      ),
    };
    await this.storageHelper.createVersion(modified, "Modified cypher");
    await expect(this.page.locator('[data-testid="version-counter"]')).toContainText(
      "Version 2 of 2",
      { timeout: 10000 }
    );
  }
);

Given("the character has a version where a cypher was renamed", async function (this: CustomWorld) {
  await waitForBootstrap(this);
  const base = await this.storageHelper.getCharacter();
  const renamed = {
    ...base,
    cyphers: base.cyphers.map((c: { name: string; level: string; effect: string }, i: number) =>
      i === 0 ? { ...c, name: "Renamed Cypher" } : c
    ),
  };
  await this.storageHelper.createVersion(renamed, "Renamed cypher");
  await expect(this.page.locator('[data-testid="version-counter"]')).toContainText(
    "Version 2 of 2",
    { timeout: 10000 }
  );
});
