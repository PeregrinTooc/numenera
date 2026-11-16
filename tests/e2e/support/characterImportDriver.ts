import type { Page } from "@playwright/test";
import type { ClockDriver } from "./clockDriver.js";
import { importFile } from "./fileImport.js";

export interface CharacterImportDriver {
  importFile(filename: string, content: unknown): Promise<void>;
}

export class PlaywrightCharacterImportDriver implements CharacterImportDriver {
  constructor(
    private page: Page,
    private clock: ClockDriver
  ) {}

  async importFile(filename: string, content: unknown): Promise<void> {
    await importFile(this.page, this.clock, filename, content);
  }
}
