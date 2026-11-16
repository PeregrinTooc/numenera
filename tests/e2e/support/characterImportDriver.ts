import type { Page } from "@playwright/test";
import type { ClockDriver } from "./clockDriver.js";
import { importFile } from "./fileImport.js";

export interface CharacterImportDriver {
  importFile(filename: string, content: unknown): Promise<void>;
  importFileExpectingAlert(filename: string, content: unknown): Promise<string>;
}

export class PlaywrightCharacterImportDriver implements CharacterImportDriver {
  constructor(
    private page: Page,
    private clock: ClockDriver
  ) {}

  async importFile(filename: string, content: unknown): Promise<void> {
    await importFile(this.page, this.clock, filename, content);
  }

  async importFileExpectingAlert(filename: string, content: unknown): Promise<string> {
    const dialogPromise = this.page.waitForEvent("dialog");
    await importFile(this.page, this.clock, filename, content);
    const dialog = await dialogPromise;
    const message = dialog.message();
    await dialog.dismiss();
    return message;
  }
}
