import { expect } from "@playwright/test";
import { AUTO_SAVE_DEBOUNCE_MS } from "@/services/autoSaveService";
import type { CharacterDsl } from "./character.js";
import type { ClockDriver } from "./clockDriver.js";
import type { SaveIndicatorDriver } from "./saveIndicatorDriver.js";

const RAPID_EDITS = 5;

export class SaveIndicatorDsl {
  private notedTime?: string;
  private updates = 0;

  constructor(
    private indicator: SaveIndicatorDriver,
    private character: CharacterDsl,
    private clock: ClockDriver
  ) {}

  async notesTheSaveTime(): Promise<void> {
    this.notedTime = await this.indicator.text();
  }

  async letsTimePass(seconds: number): Promise<void> {
    await this.clock.advance(seconds * 1000);
  }

  async renamesCharacterRapidly(): Promise<void> {
    await this.indicator.startCountingUpdates();
    for (let edit = 1; edit <= RAPID_EDITS; edit++) {
      await this.character.changeBasicInfoWithoutWaitingForSave("name", `Hero ${edit}`);
    }
    await this.clock.advance(2 * AUTO_SAVE_DEBOUNCE_MS);
    this.updates = await this.indicator.stopCountingUpdates();
  }

  async expectVisible(): Promise<void> {
    await this.indicator.expectVisible();
  }

  async expectShowsTime(): Promise<void> {
    await this.indicator.expectShowsTime();
  }

  async expectShows(text: string): Promise<void> {
    await this.indicator.expectShowsText(text);
  }

  async expectTimeChanged(): Promise<void> {
    expect(await this.indicator.text()).not.toBe(this.notedTime);
  }

  expectEditsWereBatched(): void {
    expect(this.updates).toBeGreaterThanOrEqual(1);
    expect(this.updates).toBeLessThanOrEqual(RAPID_EDITS);
  }

  async expectInLowerRightCorner(): Promise<void> {
    await this.indicator.expectInLowerRightCorner();
  }

  async expectSubtleStyling(): Promise<void> {
    await this.indicator.expectSubtleStyling();
  }
}
