import { intCell } from "./tableRows.js";
import { CARD_CONFIGS, CARD_TYPE_TO_PROPERTY, EMPTY_ARRAYS } from "./cardTestFixtures.js";
import { FULL_CHARACTER } from "@/data/mockCharacters";
import type { SetupDsl } from "./setup.js";
import { statLabel } from "./valueEditor.js";
import type { ValueEditorDriver } from "./valueEditorDriver.js";
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

const RESOURCE_PROPERTIES: Record<string, string> = {
  "Current XP": "currentXp",
  "Total XP": "totalXp",
  Shins: "shins",
  Armor: "armor",
  "Max Cyphers": "maxCyphers",
  Effort: "effort",
};

function basicInfoLabel(field: string): string {
  return field === "name" ? "character name" : field;
}

export class CharacterDsl {
  constructor(
    private sheet: SheetDriver,
    private setup: SetupDsl,
    private valueEditor: ValueEditorDriver
  ) {}

  async hasStat(stat: string, field: string, value: number): Promise<void> {
    const current = FULL_CHARACTER.stats[stat.toLowerCase() as keyof typeof FULL_CHARACTER.stats];
    await this.setup.newCharacter({
      stats: {
        ...FULL_CHARACTER.stats,
        [stat.toLowerCase()]: { ...current, [field.toLowerCase()]: value },
      },
    });
  }

  async hasBasicInfo(field: string, value: string | number): Promise<void> {
    await this.setup.newCharacter({ [field]: value });
  }

  async hasResource(resource: string, value: number): Promise<void> {
    await this.setup.newCharacter({ [RESOURCE_PROPERTIES[resource]]: value });
  }

  async hasXp(current: number, total: number): Promise<void> {
    await this.setup.newCharacter({ currentXp: current, totalXp: total });
  }

  async hasLegacyXp(xp: number): Promise<void> {
    const {
      currentXp: _currentXp,
      totalXp: _totalXp,
      ...rest
    } = { ...FULL_CHARACTER, ...EMPTY_ARRAYS };
    await this.setup.replaceCharacter({ ...rest, xp });
  }

  async change(valueName: string, value: string): Promise<void> {
    await this.valueEditor.open(valueName);
    await this.valueEditor.setValue(value);
    await this.valueEditor.confirm();
  }

  async changeStat(stat: string, field: string, value: number): Promise<void> {
    await this.change(statLabel(stat, field), String(value));
  }

  async changeBasicInfo(field: string, value: string): Promise<void> {
    await this.change(basicInfoLabel(field), value);
  }

  async tryToChange(valueName: string, value: string): Promise<void> {
    await this.valueEditor.open(valueName);
    await this.valueEditor.setValue(value);
  }

  async tryToChangeBasicInfoToNothing(field: string): Promise<void> {
    await this.tryToChange(basicInfoLabel(field), "");
  }

  async expectRefusalExplained(): Promise<void> {
    await this.valueEditor.expectExplanation();
  }

  async expectResourceShows(resource: string, value: number): Promise<void> {
    await this.sheet.expectValueShows(resource, String(value));
  }

  async expectChangeRefused(): Promise<void> {
    await this.valueEditor.expectCannotConfirm();
    await this.valueEditor.expectStillOpen();
  }

  async expectBasicInfoShows(field: string, value: string | number): Promise<void> {
    await this.sheet.expectValueShows(basicInfoLabel(field), String(value));
  }

  async expectStatShows(stat: string, field: string, value: number): Promise<void> {
    await this.sheet.expectValueShows(statLabel(stat, field), String(value));
  }

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
