import { expect } from "@playwright/test";
import type { DownloadedFile, UnreadableCharacterDriver } from "./unreadableCharacterDriver.js";

export class UnreadableCharacterDsl {
  private downloaded?: DownloadedFile;

  constructor(private unreadable: UnreadableCharacterDriver) {}

  async hasStoredUnreadableText(text: string): Promise<void> {
    await this.unreadable.storeText(text);
  }

  async browserHoldsUnparseableText(text: string): Promise<void> {
    await this.unreadable.storeUnparseableBrowserText(text);
  }

  async expectAsked(): Promise<void> {
    await this.unreadable.expectPrompt();
  }

  async expectNotAsked(): Promise<void> {
    await this.unreadable.expectNoPrompt();
  }

  async chooses(label: string): Promise<void> {
    await this.unreadable.choose(label);
  }

  async downloads(): Promise<void> {
    this.downloaded = await this.unreadable.download();
  }

  expectDownloadNamedLike(pattern: string): void {
    const [prefix, suffix] = pattern.split("DATE");
    const filename = this.downloadedFile().filename;
    expect(filename.startsWith(prefix)).toBe(true);
    expect(filename.endsWith(suffix)).toBe(true);
    expect(filename.slice(prefix.length, filename.length - suffix.length)).toMatch(
      /^\d{4}-\d{2}-\d{2}$/
    );
  }

  expectDownloadContains(content: string): void {
    expect(this.downloadedFile().content).toBe(content);
  }

  async expectKeptData(content: string): Promise<void> {
    expect(await this.unreadable.keptBackup()).toBe(content);
  }

  async expectNoDataKept(): Promise<void> {
    await this.unreadable.expectNoBackupKept();
  }

  private downloadedFile(): DownloadedFile {
    if (this.downloaded === undefined) throw new Error("No unreadable character was downloaded");
    return this.downloaded;
  }
}
