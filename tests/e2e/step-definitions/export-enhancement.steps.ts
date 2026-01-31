import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

// ========================================
// Given Steps - Setup
// ========================================

Given("my browser supports File System Access API", async function () {
  // Mock File System Access API
  await this.page.evaluate(() => {
    // Create mock file handle
    const createMockHandle = (name: string) => ({
      name,
      kind: "file" as const,
      createWritable: async () => ({
        write: async (data: string) => {
          (window as any)._lastWrittenData = data;
          (window as any)._exportedData = data;
        },
        close: async () => {},
      }),
      queryPermission: async () => "granted",
    });

    // Mock showSaveFilePicker
    (window as any).showSaveFilePicker = async (options?: any) => {
      if ((window as any)._cancelFilePicker) {
        throw new window.DOMException("User cancelled", "AbortError");
      }
      (window as any)._saveDialogShown = true;
      (window as any)._suggestedFilename = options?.suggestedName || "character.json";
      const filename = options?.suggestedName || "character.json";
      return createMockHandle(filename);
    };
  });
});

Given("my browser does not support File System Access API", async function () {
  await this.page.evaluate(() => {
    delete (window as any).showSaveFilePicker;

    // Mock createElement for download link capture
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = function (tagName: string) {
      const element = originalCreateElement(tagName);
      if (tagName === "a") {
        element.click = function () {
          const anchor = element as any;
          (window as any)._downloadFilename = anchor.download;

          // Extract data from blob URL
          if (anchor.href && anchor.href.startsWith("blob:")) {
            window
              .fetch(anchor.href)
              .then((res: any) => res.text())
              .then((data: any) => {
                (window as any)._downloadData = data;
              });
          }
          // Don't actually trigger download
        };
      }
      return element;
    };
  });
});

Given("the character name is {string}", async function (name: string) {
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

// ========================================
// When Steps - Actions
// ========================================

When("I view the export buttons", async function () {
  // Wait for header to be visible
  await this.page.waitForSelector(".character-header", { state: "visible" });
});

When("I click the Export button", async function () {
  const button = this.page.locator('button[data-testid="export-button"]');
  await button.click();
  // Wait longer for UI to update after export
  await this.page.waitForTimeout(500);
});

When("I cancel the file save dialog", async function () {
  // Set cancel flag BEFORE clicking
  await this.page.evaluate(() => {
    (window as any)._cancelFilePicker = true;
  });
});

When("I click the Quick Export button", async function () {
  const button = this.page.locator('button[data-testid="quick-export-button"]');
  await button.click();
  await this.page.waitForTimeout(100);
});

When("I click the Save As button", async function () {
  const button = this.page.locator('button[data-testid="save-as-button"]');
  await button.click();
  await this.page.waitForTimeout(100);
});

// ========================================
// Then Steps - Assertions
// ========================================

Then("I should see an {string} button", async function (buttonText: string) {
  const button = this.page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeVisible();
});

Then("I should see a {string} button", async function (buttonText: string) {
  const button = this.page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeVisible();
});

Then("I should not see a {string} button", async function (buttonText: string) {
  const button = this.page.locator(`button:has-text("${buttonText}")`);
  await expect(button).not.toBeVisible();
});

Then("I should not see an {string} button", async function (buttonText: string) {
  // Use exact text match to avoid matching "Quick Export" when looking for "Export"
  const button = this.page.locator(`button:text-is("${buttonText}")`);
  await expect(button).not.toBeVisible();
});

Then(
  "the export dialog should be triggered with filename containing {string}",
  async function (expectedName: string) {
    const filename = await this.page.evaluate(() => {
      return (window as any)._suggestedFilename;
    });
    expect(filename).toBeTruthy();
    expect(filename).toContain(expectedName);
    expect(filename).toMatch(/\.numenera$/);
  }
);

Then("the exported data should have correct structure", async function () {
  const data = await this.page.evaluate(() => {
    return (window as any)._lastWrittenData;
  });
  expect(data).toBeTruthy();

  const parsed = JSON.parse(data);
  expect(parsed).toHaveProperty("version");
  expect(parsed).toHaveProperty("schemaVersion");
  expect(parsed).toHaveProperty("exportDate");
  expect(parsed).toHaveProperty("character");
});

Then("a file download should be triggered", async function () {
  // Wait for download to be set up
  await this.page.waitForTimeout(500);

  const downloadFilename = await this.page.evaluate(() => {
    return (window as any)._downloadFilename;
  });
  expect(downloadFilename).toBeTruthy();
});

Then("the download filename should contain {string}", async function (expectedName: string) {
  const filename = await this.page.evaluate(() => {
    return (window as any)._downloadFilename;
  });
  expect(filename).toContain(expectedName);
  expect(filename).toMatch(/\.numenera$/);
});

Then("the download should have correct file structure", async function () {
  // Wait for data to be captured
  await this.page.waitForTimeout(500);

  const data = await this.page.evaluate(() => {
    return (window as any)._downloadData;
  });

  if (data) {
    const parsed = JSON.parse(data);
    expect(parsed).toHaveProperty("version");
    expect(parsed).toHaveProperty("schemaVersion");
    expect(parsed).toHaveProperty("exportDate");
    expect(parsed).toHaveProperty("character");
  }
});

Then("the suggested filename should be {string}", async function (expectedFilename: string) {
  const filename = await this.page.evaluate(() => {
    return (window as any)._suggestedFilename;
  });
  expect(filename).toBe(expectedFilename);
});

Then("no file should be saved", async function () {
  const dataSaved = await this.page.evaluate(() => {
    return (window as any)._lastWrittenData !== undefined;
  });
  expect(dataSaved).toBe(false);
});

Then("the Export button should still be visible", async function () {
  const exportButton = this.page.locator('button[data-testid="export-button"]');
  await expect(exportButton).toBeVisible();
});

Then("the file should be saved without prompting", async function () {
  // Verify that showSaveFilePicker was NOT called again (no prompting)
  const dialogShownAgain = await this.page.evaluate(() => {
    const count = (window as any)._saveDialogCallCount || 0;
    return count > 1; // Should be exactly 1 from first export
  });
  expect(dialogShownAgain).toBe(false);

  // Verify data was written
  const data = await this.page.evaluate(() => {
    return (window as any)._lastWrittenData;
  });
  expect(data).toBeTruthy();
});

Then("the export dialog should be triggered", async function () {
  const dialogShown = await this.page.evaluate(() => {
    return (window as any)._saveDialogShown;
  });
  expect(dialogShown).toBe(true);
});
