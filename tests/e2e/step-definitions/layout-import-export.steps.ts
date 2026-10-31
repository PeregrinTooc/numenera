/**
 * Step definitions for exporting and importing the layout with a character file
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";

Then(
  "the exported file should contain the layout configuration",
  async function (this: CustomWorld) {
    const data = this.exportedFileData;
    if (!data) {
      throw new Error("No exported data available");
    }

    expect(data.layout).toBeDefined();
    expect(Array.isArray(data.layout)).toBe(true);
  }
);

Given("I have a character file with a different layout", async function (this: CustomWorld) {
  this.importedLayout = [
    { type: "single", id: "basicInfo" },
    { type: "single", id: "stats" },
    { type: "single", id: "recoveryDamage" },
    { type: "single", id: "items" }, // Different order
    { type: "single", id: "cyphers" },
    { type: "single", id: "abilities" },
    { type: "single", id: "specialAbilities" },
    { type: "single", id: "attacks" },
    { type: "single", id: "background" },
    { type: "single", id: "notes" },
  ];
});

Given("I have a character file with the default layout", async function (this: CustomWorld) {
  this.importedLayout = null; // No custom layout
});

When("I import the character file", async function (this: CustomWorld) {
  const page = this.page;

  const characterData = {
    name: "Imported Character",
    tier: 2,
    type: "Nano",
    descriptor: "Clever",
    focus: "Talks to Machines",
    might: { pool: 10, edge: 0, current: 10 },
    speed: { pool: 10, edge: 0, current: 10 },
    intellect: { pool: 14, edge: 1, current: 14 },
    layout: this.importedLayout,
  };

  // The import button is in the header, not in settings panel
  // Use file chooser to import
  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.click('[data-testid="import-button"]'),
  ]);

  // Create a temporary file with the character data
  const fileContent = JSON.stringify(characterData);
  const buffer = Buffer.from(fileContent, "utf-8");

  await fileChooser.setFiles({
    name: "character.json",
    mimeType: "application/json",
    buffer: buffer,
  });
});

Then("I should see a layout choice prompt", async function (this: CustomWorld) {
  const page = this.page;

  // Check for layout choice modal
  const prompt = page.locator('[data-testid="layout-choice-modal"]');
  await expect(prompt).toBeVisible({ timeout: 5000 });
});

Then("I should not see a layout choice prompt", async function (this: CustomWorld) {
  const page = this.page;

  // Wait a moment to ensure modal would have appeared
  await page.waitForTimeout(500);

  const prompt = page.locator('[data-testid="layout-choice-modal"]');
  await expect(prompt).not.toBeVisible();
});

Then(
  "I should see options to {string} or {string}",
  async function (this: CustomWorld, _option1: string, _option2: string) {
    const page = this.page;

    const keepButton = page.locator('[data-testid="keep-current-layout"]');
    const useButton = page.locator('[data-testid="use-imported-layout"]');

    await expect(keepButton).toBeVisible();
    await expect(useButton).toBeVisible();
  }
);

When("I choose to {string}", async function (this: CustomWorld, choice: string) {
  const page = this.page;

  if (choice === "Keep current layout") {
    await page.click('[data-testid="keep-current-layout"]');
  } else if (choice === "Use imported layout") {
    await page.click('[data-testid="use-imported-layout"]');
  } else {
    throw new Error(`Unknown choice: ${choice}`);
  }
});

Then("my current layout should be preserved", async function (this: CustomWorld) {
  const page = this.page;

  // Check that the layout in localStorage is still the custom one we set earlier
  const layoutData = await page.evaluate(() => {
    return localStorage.getItem("numenera-layout");
  });

  if (layoutData === null) throw new Error("numenera-layout was not saved");
  const layout: Array<{ type: string; id: string }> = JSON.parse(layoutData);

  // Should still have cyphers before abilities (our custom order)
  const cypherIndex = layout.findIndex((item) => item.type === "single" && item.id === "cyphers");
  const abilitiesIndex = layout.findIndex(
    (item) => item.type === "single" && item.id === "abilities"
  );

  expect(cypherIndex).toBeLessThan(abilitiesIndex);
});

Then("only the character data should be imported", async function (this: CustomWorld) {
  const page = this.page;

  // Check that the character name was updated
  const name = await page.locator('[data-testid="character-name"]').textContent();
  expect(name).toContain("Imported Character");
});

Then("the layout from the imported file should be applied", async function (this: CustomWorld) {
  const page = this.page;

  // Check that layout was updated from import
  const layoutData = await page.evaluate(() => {
    return localStorage.getItem("numenera-layout");
  });

  if (layoutData === null) throw new Error("numenera-layout was not saved");
  const layout: Array<{ type: string; id: string }> = JSON.parse(layoutData);

  // Should have items before cyphers (from imported layout)
  const itemsIndex = layout.findIndex((item) => item.type === "single" && item.id === "items");
  const cyphersIndex = layout.findIndex((item) => item.type === "single" && item.id === "cyphers");

  expect(itemsIndex).toBeLessThan(cyphersIndex);
});

Then("the character data should be imported", async function (this: CustomWorld) {
  const page = this.page;

  const name = await page.locator('[data-testid="character-name"]').textContent();
  expect(name).toContain("Imported Character");
});

Then("the character should be imported normally", async function (this: CustomWorld) {
  const page = this.page;

  const name = await page.locator('[data-testid="character-name"]').textContent();
  expect(name).toContain("Imported Character");
});
