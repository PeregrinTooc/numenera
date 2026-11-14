import { CARD_CONFIGS, CARD_TYPE_TO_PROPERTY } from "./cardTestFixtures.js";
import type { SetupDsl } from "./setup.js";
import type { SheetDriver } from "./sheetDriver.js";

function nameOf(card: unknown): string {
  return typeof card === "string" ? card : (card as { name: string }).name;
}

function sampleCard(kind: string, name: string): unknown {
  const card = CARD_CONFIGS[kind].sampleCards.find((sample) => nameOf(sample) === name);
  if (card === undefined) throw new Error(`No sample ${kind} named "${name}"`);
  return card;
}

export class CharacterDsl {
  constructor(
    private sheet: SheetDriver,
    private setup: SetupDsl
  ) {}

  async has(kind: string, names: string[]): Promise<void> {
    await this.setup.newCharacter({
      [CARD_TYPE_TO_PROPERTY[kind]]: names.map((name) => sampleCard(kind, name)),
    });
  }

  async hasCount(kind: string, count: number): Promise<void> {
    const samples = CARD_CONFIGS[kind].sampleCards;
    if (count > samples.length) {
      throw new Error(
        `Only ${samples.length} sample ${kind} entries available, asked for ${count}`
      );
    }
    await this.setup.newCharacter({ [CARD_TYPE_TO_PROPERTY[kind]]: samples.slice(0, count) });
  }

  async reopen(): Promise<void> {
    await this.sheet.reopen();
  }

  async expectCount(kind: string, count: number): Promise<void> {
    await this.sheet.expectEntryCount(kind, count);
  }

  async expectEntry(kind: string, name: string): Promise<void> {
    await this.sheet.expectEntry(kind, name);
  }

  async expectEntryShows(kind: string, name: string, value: string): Promise<void> {
    await this.sheet.expectEntryShows(kind, name, value);
  }

  async expectAddControlThemed(kind: string): Promise<void> {
    await this.sheet.expectAddControlThemed(kind);
  }

  async discard(name: string): Promise<void> {
    await this.sheet.discard(name);
  }

  async carriesOnly(kind: string, names: string[]): Promise<void> {
    await this.sheet.expectEntries(kind, names);
  }

  async expectGoneAfterReopening(name: string): Promise<void> {
    await this.sheet.reopen();
    await this.sheet.expectNoEntry(name);
  }

  async expectDiscardedWithoutConfirmation(): Promise<void> {
    await this.sheet.expectNoConfirmationAsked();
  }

  async expectDiscardControlInTopLeftCorner(name: string): Promise<void> {
    await this.sheet.expectDiscardControlInTopLeftCorner(name);
  }
}
