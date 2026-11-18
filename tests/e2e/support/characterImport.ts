import { expect } from "@playwright/test";
import type { Character } from "@/types/character";
import type { AdditionalFieldsDsl } from "./additionalFields.js";
import type { CharacterDsl } from "./character.js";
import type { CharacterImportDriver } from "./characterImportDriver.js";
import { FULL_CHARACTER } from "./cardTestFixtures.js";
import { numeneraFile } from "./fileImport.js";
import { IMPORTABLE_CHARACTERS } from "./importableCharacters.js";

const IMPORTED_HERO: Character = {
  ...FULL_CHARACTER,
  name: "Imported Hero",
  tier: 2,
  type: "Nano",
  descriptor: "Clever",
  focus: "Controls Gravity",
  currentXp: 5,
  totalXp: 5,
  shins: 30,
  armor: 1,
  effort: 2,
  maxCyphers: 3,
  stats: {
    might: { pool: 10, edge: 0, current: 10 },
    speed: { pool: 12, edge: 1, current: 12 },
    intellect: { pool: 16, edge: 2, current: 16 },
  },
  cyphers: [{ name: "Test Cypher", level: "1d6", effect: "Test effect" }],
  artifacts: [],
  oddities: ["Glowing orb"],
  abilities: [],
  equipment: [],
  attacks: [],
  specialAbilities: [],
  textFields: {
    background: "Test background",
    notes: "Test notes",
  },
};

const FILENAME = "imported-hero.numenera";

export class CharacterImportDsl {
  private alert?: string;

  constructor(
    private imports: CharacterImportDriver,
    private character: CharacterDsl,
    private additionalFields: AdditionalFieldsDsl
  ) {}

  async importsValidCharacter(): Promise<void> {
    await this.imports.importFile(FILENAME, numeneraFile(IMPORTED_HERO));
  }

  async importsCharacterWithTier(tier: number): Promise<void> {
    await this.imports.importFile(FILENAME, numeneraFile({ ...IMPORTED_HERO, tier }));
  }

  async importsCharacterFile(filename: string): Promise<void> {
    const character = IMPORTABLE_CHARACTERS[filename];
    if (character === undefined) throw new Error(`No importable character for ${filename}`);
    await this.imports.importFile(filename, numeneraFile(character));
    this.character.hasImported(character);
    await this.character.expectBasicInfoShows("name", character.name);
  }

  async importsFileWithoutCharacterData(): Promise<void> {
    this.alert = await this.imports.importFileExpectingAlert("broken.numenera", {
      version: "1.0",
    });
  }

  expectAlertReads(message: string): void {
    expect(this.alert).toBe(message);
  }

  async expectCharacterNamed(name: string): Promise<void> {
    await this.character.expectBasicInfoShows("name", name);
  }

  async expectImportedCharacterNamed(): Promise<void> {
    await this.character.expectBasicInfoShows("name", IMPORTED_HERO.name);
  }

  async expectImportedCharacterDisplayed(): Promise<void> {
    await this.character.expectBasicInfoShows("name", IMPORTED_HERO.name);
    await this.character.expectBasicInfoShows("tier", IMPORTED_HERO.tier);
    await this.additionalFields.expectTypeShows(IMPORTED_HERO.type);
  }
}
