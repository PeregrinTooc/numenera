import { intCell } from "./tableRows.js";
import {
  CARD_CONFIGS,
  CARD_TYPE_TO_PROPERTY,
  EMPTY_ARRAYS,
  nameOf,
  sampleCard,
} from "./cardTestFixtures.js";
import { FULL_CHARACTER } from "@/data/mockCharacters";
import type { Character } from "@/types/character";
import type { InlineFieldsDriver } from "./inlineFieldsDriver.js";
import type { SetupDsl } from "./setup.js";
import { englishText } from "./i18nKeys.js";
import { statLabel } from "./valueEditor.js";
import type { ValueEditorDriver } from "./valueEditorDriver.js";
import type { CardTheme, SheetDriver } from "./sheetDriver.js";

const NUMERIC_PROPERTIES = ["damage", "modifier", "cost"];

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

export interface StatRow {
  stat: string;
  pool: string;
  edge: string;
  current: string;
}

const SECTIONS_WITH_DATA = ["cypher", "artifact", "oddity", "equipment", "ability"];

export class CharacterDsl {
  private shown?: Character;

  constructor(
    private sheet: SheetDriver,
    private setup: SetupDsl,
    private valueEditor: ValueEditorDriver,
    private fields: InlineFieldsDriver
  ) {}

  async startsWithEmptySheet(): Promise<void> {
    await this.sheet.startNewCharacter();
  }

  async loadsSampleCharacter(): Promise<void> {
    await this.sheet.load();
    this.shown = FULL_CHARACTER;
  }

  hasImported(character: Character): void {
    this.shown = character;
  }

  async expectSomeCharacterDisplayed(): Promise<void> {
    await this.sheet.expectCharacterDisplayed();
  }

  async expectSampleCharacterDisplayed(): Promise<void> {
    await this.expectBasicInfoShows("name", FULL_CHARACTER.name);
  }

  async expectNoCyphersArtifactsOrOddities(): Promise<void> {
    for (const kind of ["cypher", "artifact", "oddity"]) await this.sheet.expectEmptyState(kind);
  }

  async expectNoEquipmentAbilitiesOrNotes(): Promise<void> {
    await this.sheet.expectEmptyState("equipment");
    await this.sheet.expectEmptyState("ability");
    await this.fields.expectReads("background", "");
    await this.fields.expectReads("notes", "");
  }

  async expectNoEntryOfSampleCharacter(): Promise<void> {
    await this.expectBasicInfoDoesNotShow("name", FULL_CHARACTER.name);
    for (const kind of Object.keys(CARD_TYPE_TO_PROPERTY)) {
      const cards = FULL_CHARACTER[CARD_TYPE_TO_PROPERTY[kind] as keyof Character] as unknown[];
      for (const name of cards.map(nameOf)) await this.sheet.expectNoEntry(name);
    }
  }

  async expectEverySectionShowsItsData(): Promise<void> {
    const character = this.shown;
    if (character === undefined) throw new Error("No character was loaded or imported");
    for (const kind of SECTIONS_WITH_DATA) {
      const cards = character[CARD_TYPE_TO_PROPERTY[kind] as keyof Character] as unknown[];
      await this.sheet.expectEntries(kind, cards.map(nameOf));
    }
    await this.fields.expectReads("background", character.textFields.background);
    await this.fields.expectReads("notes", character.textFields.notes);
  }

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

  async openSheet(): Promise<void> {
    await this.sheet.open();
  }

  async hasBasicInformation(fields: Record<string, string>): Promise<void> {
    const { tier, ...rest } = fields;
    await this.setup.newCharacter({
      ...rest,
      ...(tier === undefined ? {} : { tier: intCell(tier, "Tier") }),
    });
  }

  async hasEveryKindOfEntry(): Promise<void> {
    await this.setup.newCharacter(
      Object.fromEntries(
        Object.keys(EMPTY_ARRAYS).map((collection) => [
          collection,
          FULL_CHARACTER[collection as keyof typeof EMPTY_ARRAYS],
        ])
      )
    );
  }

  async hasNameWithoutSpaces(length: number): Promise<void> {
    await this.hasBasicInfo("name", "W".repeat(length));
  }

  async hasStats(rows: StatRow[]): Promise<void> {
    const stats = { ...FULL_CHARACTER.stats } as Record<string, unknown>;
    for (const { stat, pool, edge, current } of rows) {
      stats[stat.toLowerCase()] = {
        pool: intCell(pool, `${stat} pool`),
        edge: intCell(edge, `${stat} edge`),
        current: intCell(current, `${stat} current`),
      };
    }
    await this.setup.newCharacter({ stats });
  }

  async expectStatsShow(rows: StatRow[]): Promise<void> {
    for (const { stat, pool, edge, current } of rows) {
      await this.expectStatShows(stat, "Pool", intCell(pool, `${stat} pool`));
      await this.expectStatShows(stat, "Edge", intCell(edge, `${stat} edge`));
      await this.expectStatShows(stat, "Current", intCell(current, `${stat} current`));
    }
  }

  async expectBasicInfoIsPlainText(field: string): Promise<void> {
    await this.sheet.expectValueIsPlainText(basicInfoLabel(field));
  }

  async expectNoUntranslatedText(): Promise<void> {
    await this.sheet.expectNoUntranslatedText();
  }

  async expectControlsAccessiblyLabelled(): Promise<void> {
    await this.sheet.expectControlsLabelled();
  }

  async expectSectionsInOrder(names: string[]): Promise<void> {
    await this.sheet.expectSectionsInOrder(names);
  }

  async hasText(field: string, text: string): Promise<void> {
    await this.setup.newCharacter({ textFields: { ...FULL_CHARACTER.textFields, [field]: text } });
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

  async changeBasicInfoWithoutWaitingForSave(field: string, value: string): Promise<void> {
    await this.valueEditor.open(basicInfoLabel(field));
    await this.valueEditor.setValue(value);
    await this.valueEditor.confirmWithoutWaitingForSave();
  }

  async changeStat(stat: string, field: string, value: number): Promise<void> {
    await this.change(statLabel(stat, field), String(value));
  }

  async changeBasicInfo(field: string, value: string): Promise<void> {
    await this.change(basicInfoLabel(field), value);
  }

  async isNamed(name: string): Promise<void> {
    await this.changeBasicInfo("name", name);
    await this.expectBasicInfoShows("name", name);
  }

  async expectBasicInfoLooksClickable(field: string): Promise<void> {
    await this.valueEditor.expectValueLooksClickable(basicInfoLabel(field));
  }

  async expectBasicInfoPlaceholder(field: string): Promise<void> {
    await this.sheet.expectValueShows(basicInfoLabel(field), englishText(`character.${field}`));
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

  async expectBasicInfoDoesNotShow(field: string, value: string): Promise<void> {
    await this.sheet.expectValueDoesNotShow(basicInfoLabel(field), value);
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

  async reopenImmediately(): Promise<void> {
    await this.sheet.reopenImmediately();
  }

  async createsNewCharacter(): Promise<void> {
    await this.sheet.createNewCharacter();
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
