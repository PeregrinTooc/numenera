import { intCell } from "./tableRows.js";
import { CARD_CONFIGS, CARD_TYPE_TO_PROPERTY } from "./cardTestFixtures.js";
import type { SetupDsl } from "./setup.js";
import type { CardTheme, Screen, SheetDriver } from "./sheetDriver.js";

function nameOf(card: unknown): string {
  return typeof card === "string" ? card : (card as { name: string }).name;
}

function sampleCard(kind: string, name: string): unknown {
  const card = CARD_CONFIGS[kind].sampleCards.find((sample) => nameOf(sample) === name);
  if (card === undefined) throw new Error(`No sample ${kind} named "${name}"`);
  return card;
}

const NUMERIC_PROPERTIES = ["damage", "modifier"];

function cardWith(name: string, properties: Record<string, string>): Record<string, unknown> {
  const card: Record<string, unknown> = { name };
  for (const [property, value] of Object.entries(properties)) {
    card[property] = NUMERIC_PROPERTIES.includes(property) ? intCell(value, property) : value;
  }
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

  async hasEntry(kind: string, name: string, properties: Record<string, string>): Promise<void> {
    await this.setup.newCharacter({ [CARD_TYPE_TO_PROPERTY[kind]]: [cardWith(name, properties)] });
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

  async expectEntryField(kind: string, name: string, field: string, value: string): Promise<void> {
    await this.sheet.expectEntryField(kind, name, field, value);
  }

  async expectEntryWithoutField(kind: string, name: string, field: string): Promise<void> {
    await this.sheet.expectEntryWithoutField(kind, name, field);
  }

  async expectEntryThemed(kind: string, name: string, theme: CardTheme): Promise<void> {
    await this.sheet.expectEntryThemed(kind, name, theme);
  }

  async expectEmptySection(kind: string): Promise<void> {
    await this.sheet.expectEmptyState(kind);
  }

  async expectArmorBesideAttacks(armor: number): Promise<void> {
    await this.sheet.expectArmorInAttacksSection(armor);
  }

  async viewOn(screen: Screen): Promise<void> {
    await this.sheet.viewOn(screen);
  }

  async expectSectionLeftOf(kind: string, other: string): Promise<void> {
    await this.sheet.expectSectionLeftOf(kind, other);
  }

  async expectSectionAbove(kind: string, other: string): Promise<void> {
    await this.sheet.expectSectionAbove(kind, other);
  }

  async hasEntryWithUnbrokenName(kind: string, length: number): Promise<void> {
    await this.hasEntry(kind, "W".repeat(length), { damage: "4", modifier: "1", range: "Short" });
  }

  async expectBadgesAtRightEdge(kind: string): Promise<void> {
    await this.sheet.expectFirstEntryBadgesAtRightEdge(kind);
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
