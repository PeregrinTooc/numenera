import type { Character } from "@/types/character";
import type { AdditionalFieldsDsl } from "./additionalFields.js";
import type { CharacterDsl } from "./character.js";
import type { CharacterImportDriver } from "./characterImportDriver.js";
import { FULL_CHARACTER } from "./cardTestFixtures.js";
import { numeneraFile } from "./fileImport.js";

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

  async expectImportedCharacterNamed(): Promise<void> {
    await this.character.expectBasicInfoShows("name", IMPORTED_HERO.name);
  }

  async expectImportedCharacterDisplayed(): Promise<void> {
    await this.character.expectBasicInfoShows("name", IMPORTED_HERO.name);
    await this.character.expectBasicInfoShows("tier", IMPORTED_HERO.tier);
    await this.additionalFields.expectTypeShows(IMPORTED_HERO.type);
  }
}
