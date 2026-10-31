import { Given, When, Then } from "@cucumber/cucumber";
import { expect, type Download } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { CustomWorld } from "../support/world.js";
import { STORAGE_KEY } from "@/storage/storageConstants";

const PROMPT = '[data-testid="unreadable-modal"]';
let lastDownload: Download | undefined;

Given(
  "the stored character data is the unreadable text {string}",
  async function (this: CustomWorld, text: string) {
    await this.storageHelper.setCharacter(text);
  }
);

Given(
  "the browser holds the unparseable character text {string}",
  async function (this: CustomWorld, text: string) {
    // With IndexedDB empty, the text is what the next load finds and adopts
    await this.storageHelper.clearStorage();
    await this.storageHelper.setLocalStorageDirect(STORAGE_KEY, text);
  }
);

Then(
  "I should be asked what to do with the unreadable character",
  async function (this: CustomWorld) {
    await expect(this.page.locator(PROMPT)).toBeVisible();
    await expect(this.page.locator(PROMPT)).toContainText("could not be read");
  }
);

Then("I should not be asked about an unreadable character", async function (this: CustomWorld) {
  await expect(this.page.locator(PROMPT)).toHaveCount(0);
});

When(
  "I choose {string} for the unreadable character",
  async function (this: CustomWorld, label: string) {
    await this.page.locator(PROMPT).getByRole("button", { name: label }).click();
  }
);

When("I download the unreadable character", async function (this: CustomWorld) {
  const downloadPromise = this.page.waitForEvent("download");
  await this.page.locator(PROMPT).getByRole("button", { name: "Download" }).click();
  lastDownload = await downloadPromise;
});

Then(
  "the downloaded file should be named like {string}",
  async function (this: CustomWorld, pattern: string) {
    const [prefix, suffix] = pattern.split("DATE");
    const filename = lastDownload?.suggestedFilename() ?? "";
    expect(filename.startsWith(prefix)).toBe(true);
    expect(filename.endsWith(suffix)).toBe(true);
    expect(filename.slice(prefix.length, filename.length - suffix.length)).toMatch(
      /^\d{4}-\d{2}-\d{2}$/
    );
  }
);

Then(
  "the downloaded file should contain exactly {string}",
  async function (this: CustomWorld, content: string) {
    const path = await lastDownload?.path();
    expect(path).toBeTruthy();
    expect(await readFile(path as string, "utf8")).toBe(content);
  }
);

Then(
  "the kept unreadable data should be {string}",
  async function (this: CustomWorld, content: string) {
    expect(await this.storageHelper.getUnreadableBackup()).toBe(content);
  }
);

Then("no unreadable data should be kept", async function (this: CustomWorld) {
  await expect.poll(() => this.storageHelper.getUnreadableBackup()).toBeNull();
});
