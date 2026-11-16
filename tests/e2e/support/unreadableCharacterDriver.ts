import { expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { STORAGE_KEY } from "@/storage/storageConstants";
import type { TestStorageHelper } from "./testStorageHelper.js";

const PROMPT = '[data-testid="unreadable-modal"]';

export interface DownloadedFile {
  filename: string;
  content: string;
}

/** The prompt the app shows for a saved character it cannot read, and the data it keeps. */
export interface UnreadableCharacterDriver {
  storeText(text: string): Promise<void>;
  storeUnparseableBrowserText(text: string): Promise<void>;
  expectPrompt(): Promise<void>;
  expectNoPrompt(): Promise<void>;
  choose(label: string): Promise<void>;
  download(): Promise<DownloadedFile>;
  keptBackup(): Promise<unknown>;
  expectNoBackupKept(): Promise<void>;
}

export class PlaywrightUnreadableCharacterDriver implements UnreadableCharacterDriver {
  constructor(
    private page: Page,
    private storage: TestStorageHelper
  ) {}

  async storeText(text: string): Promise<void> {
    await this.storage.setCharacter(text);
  }

  // With IndexedDB empty, the text is what the next load finds and adopts
  async storeUnparseableBrowserText(text: string): Promise<void> {
    await this.storage.clearStorage();
    await this.storage.setLocalStorageDirect(STORAGE_KEY, text);
  }

  async expectPrompt(): Promise<void> {
    await expect(this.page.locator(PROMPT)).toBeVisible();
    await expect(this.page.locator(PROMPT)).toContainText("could not be read");
  }

  async expectNoPrompt(): Promise<void> {
    await expect(this.page.locator(PROMPT)).toHaveCount(0);
  }

  async choose(label: string): Promise<void> {
    await this.page.locator(PROMPT).getByRole("button", { name: label }).click();
  }

  async download(): Promise<DownloadedFile> {
    const downloadPromise = this.page.waitForEvent("download");
    await this.page.locator(PROMPT).getByRole("button", { name: "Download" }).click();
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).toBeTruthy();
    return {
      filename: download.suggestedFilename(),
      content: await readFile(path, "utf8"),
    };
  }

  async keptBackup(): Promise<unknown> {
    return await this.storage.getUnreadableBackup();
  }

  async expectNoBackupKept(): Promise<void> {
    await expect.poll(() => this.storage.getUnreadableBackup()).toBeNull();
  }
}
