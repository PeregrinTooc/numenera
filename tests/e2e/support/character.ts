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
