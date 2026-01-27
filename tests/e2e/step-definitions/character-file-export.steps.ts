import { When, Then, Given } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

// Store exported file data for verification
let exportedFileData: any = null;
let exportedFilename: string = "";

// Scenario: Export button creates downloadable file
Given("the character has name {string}", async function (name: string) {
  // Update the character name in localStorage
  await this.page.evaluate((characterName: string) => {
    const stateStr = localStorage.getItem("numenera-character-state");
    if (stateStr) {
      const character = JSON.parse(stateStr);
      character.name = characterName;
      localStorage.setItem("numenera-character-state", JSON.stringify(character));
    }
  }, name);

  // Reload to apply the change
  await this.page.reload({ waitUntil: "domcontentloaded" });

  // Wait for the name to be visible
  const nameElement = this.page.getByTestId("character-name");
  await expect(nameElement).toHaveText(name, { timeout: 5000 });
});

When("I click the export button", async function () {
  // Mock the file export functionality to capture the data
  await this.page.evaluate(() => {
    // Store original functions
    const originalCreateElement = document.createElement.bind(document);

    // Mock showSaveFilePicker (Chromium)
    (window as any).showSaveFilePicker = async (options: any) => {
      // Capture the filename
      (window as any).__exportedFilename = options.suggestedName;

      // Return a mock file handle
      return {
        createWritable: async () => ({
          write: async (data: string) => {
            // Capture the exported data
            (window as any).__exportedData = data;
          },
          close: async () => {},
        }),
      };
    };

    // Mock createElement for blob download (Safari/Firefox)
    document.createElement = function (tagName: string) {
      const element = originalCreateElement(tagName);
      if (tagName === "a") {
        // Override click to capture download info
        element.click = function () {
          (window as any).__exportedFilename = (element as any).download;
          // Extract data from blob URL
          (window as any)
            .fetch((element as any).href)
            .then((res: any) => res.text())
            .then((data: any) => {
              (window as any).__exportedData = data;
            });
        };
      }
      return element;
    };
  });

  // Click the export button
  const exportButton = this.page.getByTestId("export-button");
  await exportButton.click();

  // Wait a moment for the export to complete
  await this.page.waitForTimeout(500);

  // Retrieve the captured data
  const capturedData = await this.page.evaluate(() => {
    return {
      filename: (window as any).__exportedFilename,
      data: (window as any).__exportedData,
    };
  });

  exportedFilename = capturedData.filename;
  if (capturedData.data) {
    exportedFileData = JSON.parse(capturedData.data);
  }
});

Then("a file export should be triggered", async function () {
  expect(exportedFilename).toBeTruthy();
  expect(exportedFilename).toContain(".numenera");
});

Then("the exported filename should be {string}", async function (expectedFilename: string) {
  expect(exportedFilename).toBe(expectedFilename);
});

// Scenario: Exported file contains complete character data
Then("the exported file should contain all character properties", async function () {
  expect(exportedFileData).toBeTruthy();
  expect(exportedFileData.character).toBeTruthy();

  const character = exportedFileData.character;

  // Verify essential character properties exist
  expect(character).toHaveProperty("name");
  expect(character).toHaveProperty("tier");
  expect(character).toHaveProperty("type");
  expect(character).toHaveProperty("descriptor");
  expect(character).toHaveProperty("focus");
  expect(character).toHaveProperty("xp");
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
});

Then("the exported file should have version {string}", async function (expectedVersion: string) {
  expect(exportedFileData).toBeTruthy();
  expect(exportedFileData.version).toBe(expectedVersion);
});

Then(
  "the exported file should have schemaVersion {int}",
  async function (expectedSchemaVersion: number) {
    expect(exportedFileData).toBeTruthy();
    expect(exportedFileData.schemaVersion).toBe(expectedSchemaVersion);
  }
);

Then("the exported file should have an exportDate", async function () {
  expect(exportedFileData).toBeTruthy();
  expect(exportedFileData.exportDate).toBeTruthy();

  // Verify it's a valid ISO date string
  const date = new Date(exportedFileData.exportDate);
  expect(date.toISOString()).toBe(exportedFileData.exportDate);
});
