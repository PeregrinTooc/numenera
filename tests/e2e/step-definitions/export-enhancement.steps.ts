import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";
import { waitForCharacterSheetReady } from "../support/app-ready.js";

Given("my browser supports File System Access API", async function (this: CustomWorld) {
  // Install the mock before the app boots, then reload: the header decides
  // once, at construction, whether to offer Quick Export / Save As
  // ("showSaveFilePicker" in window). WebKit has no native API, so a mock
  // added after load would never reach that check.
  await this.page.addInitScript(() => {
    const mockWindow = window;

    const createMockHandle = (name: string) => ({
      name,
      kind: "file" as const,
      createWritable: async () => ({
        write: async (data: string) => {
          mockWindow._lastWrittenData = data;
          mockWindow._exportedData = data;
          mockWindow._writeCount = (mockWindow._writeCount ?? 0) + 1;
        },
        close: async () => {},
      }),
      queryPermission: async () => "granted",
    });

    mockWindow.showSaveFilePicker = async (options?: { suggestedName?: string }) => {
      mockWindow._saveDialogCallCount = (mockWindow._saveDialogCallCount ?? 0) + 1;
      if (mockWindow._cancelFilePicker) {
        throw new window.DOMException("User cancelled", "AbortError");
      }
      mockWindow._saveDialogShown = true;
      mockWindow._suggestedFilename = options?.suggestedName || "character.json";
      const filename = options?.suggestedName || "character.json";
      // The mock implements only the handle members the app uses.
      return createMockHandle(filename) as unknown as FileSystemFileHandle;
    };
  });
  await this.page.reload();
  await waitForCharacterSheetReady(this.page);
});

Given("my browser does not support File System Access API", async function () {
  await this.page.evaluate(() => {
    delete window.showSaveFilePicker;

    const originalCreateElement = document.createElement.bind(document);
    document.createElement = function (tagName: string) {
      const element = originalCreateElement(tagName);
      if (tagName === "a") {
        element.click = function () {
          const anchor = element as HTMLAnchorElement;
          window._downloadFilename = anchor.download;

          if (anchor.href && anchor.href.startsWith("blob:")) {
            window
              .fetch(anchor.href)
              .then((res) => res.text())
              .then((data) => {
                window._downloadData = data;
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
  const nameElement = this.page.getByTestId("character-name");
  await nameElement.click();

  const input = this.page.locator('[data-testid="edit-modal-input"]');
  await input.fill(name);

  await this.page.click('[data-testid="modal-confirm-button"]');

  await expect(this.page.locator('[data-testid="edit-modal"]')).toBeHidden();

  await expect(nameElement).toHaveText(name, { timeout: 5000 });
});

When("I view the export buttons", async function () {
  await this.page.waitForSelector(".character-header", { state: "visible" });
});

When("I click the Export button", async function () {
  const button = this.page.locator('button[data-testid="export-button"]');
  await button.click();
});

When("I cancel the file save dialog", async function () {
  await this.page.evaluate(() => {
    window._cancelFilePicker = true;
  });
});

When("I click the Quick Export button", async function () {
  const button = this.page.locator('button[data-testid="quick-export-button"]');
  await expect(button).toBeVisible();
  const writesBefore = await this.page.evaluate(() => window._writeCount ?? 0);
  await button.click();
  await this.page.waitForFunction(
    (before: number) => (window._writeCount ?? 0) > before,
    writesBefore
  );
});

When("I click the Save As button", async function () {
  const button = this.page.locator('button[data-testid="save-as-button"]');
  await expect(button).toBeVisible();
  const dialogsBefore = await this.page.evaluate(() => window._saveDialogCallCount ?? 0);
  await button.click();
  await this.page.waitForFunction(
    (before: number) => (window._saveDialogCallCount ?? 0) > before,
    dialogsBefore
  );
});

Then("I should see an {string} button", async function (buttonText: string) {
  const button = this.page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeVisible();
});

Then("I should see a {string} button", async function (buttonText: string) {
  const button = this.page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeVisible();
});

Then("I should not see an {string} button", async function (buttonText: string) {
  // Use exact text match to avoid matching "Quick Export" when looking for "Export"
  const button = this.page.locator(`button:text-is("${buttonText}")`);
  await expect(button).not.toBeVisible();
});

Then(
  "the export dialog should be triggered with filename containing {string}",
  async function (expectedName: string) {
    await this.page.waitForFunction(() => Boolean(window._suggestedFilename));
    const filename = await this.page.evaluate(() => {
      return window._suggestedFilename;
    });
    expect(filename).toBeTruthy();
    expect(filename).toContain(expectedName);
    expect(filename).toMatch(/\.numenera$/);
  }
);

Then("the exported data should have correct structure", async function () {
  await this.page.waitForFunction(() => Boolean(window._lastWrittenData));
  const data = await this.page.evaluate(() => {
    return window._lastWrittenData;
  });
  expect(data).toBeTruthy();

  const parsed = JSON.parse(data);
  expect(parsed).toHaveProperty("version");
  expect(parsed).toHaveProperty("schemaVersion");
  expect(parsed).toHaveProperty("exportDate");
  expect(parsed).toHaveProperty("character");
});

Then("a file download should be triggered", async function () {
  await this.page.waitForFunction(() => Boolean(window._downloadFilename));

  const downloadFilename = await this.page.evaluate(() => {
    return window._downloadFilename;
  });
  expect(downloadFilename).toBeTruthy();
});

Then("the download filename should contain {string}", async function (expectedName: string) {
  const filename = await this.page.evaluate(() => {
    return window._downloadFilename;
  });
  expect(filename).toContain(expectedName);
  expect(filename).toMatch(/\.numenera$/);
});

Then("the download should have correct file structure", async function () {
  await this.page.waitForFunction(() => Boolean(window._downloadData));

  const data = await this.page.evaluate(() => {
    return window._downloadData;
  });

  const parsed = JSON.parse(data);
  expect(parsed).toHaveProperty("version");
  expect(parsed).toHaveProperty("schemaVersion");
  expect(parsed).toHaveProperty("exportDate");
  expect(parsed).toHaveProperty("character");
});

Then("the suggested filename should be {string}", async function (expectedFilename: string) {
  await this.page.waitForFunction(() => Boolean(window._suggestedFilename));
  const filename = await this.page.evaluate(() => {
    return window._suggestedFilename;
  });
  expect(filename).toBe(expectedFilename);
});

Then("no file should be saved", async function () {
  await this.page.waitForFunction(() => (window._saveDialogCallCount ?? 0) >= 1);
  const dataSaved = await this.page.evaluate(() => {
    return window._lastWrittenData !== undefined;
  });
  expect(dataSaved).toBe(false);
});

Then("the Export button should still be visible", async function () {
  const exportButton = this.page.locator('button[data-testid="export-button"]');
  await expect(exportButton).toBeVisible();
});

Then("the file should be saved without prompting", async function () {
  const dialogShownAgain = await this.page.evaluate(() => {
    const count = window._saveDialogCallCount || 0;
    return count > 1; // Should be exactly 1 from first export
  });
  expect(dialogShownAgain).toBe(false);

  const data = await this.page.evaluate(() => {
    return window._lastWrittenData;
  });
  expect(data).toBeTruthy();
});

Then("the export dialog should be triggered", async function () {
  const dialogShown = await this.page.evaluate(() => {
    return window._saveDialogShown;
  });
  expect(dialogShown).toBe(true);
});
