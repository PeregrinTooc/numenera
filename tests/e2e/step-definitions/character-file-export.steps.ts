import { When, Then, Given } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld, ExportedCharacterFile } from "../support/world.js";
import { installExportCapture, waitForExportCapture } from "../support/exportCapture.js";

// Scenario: Export button creates downloadable file
Given("the character has name {string}", async function (this: CustomWorld, name: string) {
  // Click on the name field to open the modal
  const nameElement = this.page.getByTestId("character-name");
  await nameElement.click();

  // Fill in the new name
  const input = this.page.locator('[data-testid="edit-modal-input"]');
  await input.fill(name);

  // Click confirm
  await this.page.click('[data-testid="modal-confirm-button"]');

  // Wait for modal to close
  await this.page
    .waitForSelector('[data-testid="edit-modal"]', {
      state: "hidden",
      timeout: 2000,
    })
    .catch(() => {
      // Modal might already be hidden
    });

  // Wait for auto-save to complete (debounce is 300ms, wait a bit longer)
  await this.page.waitForTimeout(500);

  // Verify the name was updated
  await expect(nameElement).toHaveText(name, { timeout: 5000 });
});

When("I export the character", async function (this: CustomWorld) {
  await installExportCapture(this.page);
  await this.page.getByTestId("export-button").click();
  const captured = await waitForExportCapture(this.page);
  this.exportedFilename = captured.filename;
  this.exportedFileData = JSON.parse(captured.data) as ExportedCharacterFile;
});

Then("a file export should be triggered", async function (this: CustomWorld) {
  expect(this.exportedFilename).toBeTruthy();
  expect(this.exportedFilename).toContain(".numenera");
});

Then(
  "the exported filename should be {string}",
  async function (this: CustomWorld, expectedFilename: string) {
    expect(this.exportedFilename).toBe(expectedFilename);
  }
);

// Scenario: Exported file contains complete character data
Then(
  "the exported file should contain all character properties",
  async function (this: CustomWorld) {
    expect(this.exportedFileData).toBeTruthy();
    expect(this.exportedFileData?.character).toBeTruthy();

    const character = this.exportedFileData?.character;

    // Verify essential character properties exist
    expect(character).toHaveProperty("name");
    expect(character).toHaveProperty("tier");
    expect(character).toHaveProperty("type");
    expect(character).toHaveProperty("descriptor");
    expect(character).toHaveProperty("focus");
    expect(character).toHaveProperty("currentXp");
    expect(character).toHaveProperty("totalXp");
    expect(character).toHaveProperty("shins");
    expect(character).toHaveProperty("armor");
    expect(character).toHaveProperty("effort");
    expect(character).toHaveProperty("maxCyphers");
    expect(character).toHaveProperty("stats");
    expect(character).toHaveProperty("cyphers");
    expect(character).toHaveProperty("artifacts");
    expect(character).toHaveProperty("oddities");
    expect(character).toHaveProperty("abilities");
    expect(character).toHaveProperty("equipment");
    expect(character).toHaveProperty("attacks");
    expect(character).toHaveProperty("specialAbilities");
    expect(character).toHaveProperty("recoveryRolls");
    expect(character).toHaveProperty("damageTrack");
    expect(character).toHaveProperty("textFields");
  }
);

Then(
  "the exported file should have version {string}",
  async function (this: CustomWorld, expectedVersion: string) {
    expect(this.exportedFileData).toBeTruthy();
    expect(this.exportedFileData?.version).toBe(expectedVersion);
  }
);

Then(
  "the exported file should have schemaVersion {string}",
  async function (this: CustomWorld, expectedSchemaVersion: string) {
    expect(this.exportedFileData).toBeTruthy();
    expect(this.exportedFileData?.schemaVersion).toBe(expectedSchemaVersion);
  }
);

Then("the exported file should have an exportDate", async function (this: CustomWorld) {
  expect(this.exportedFileData).toBeTruthy();
  const exportDate = this.exportedFileData?.exportDate;
  expect(exportDate).toBeTruthy();

  // Verify it's a valid ISO date string
  const date = new Date(exportDate as string);
  expect(date.toISOString()).toBe(exportDate);
});
