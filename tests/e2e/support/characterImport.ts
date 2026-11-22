import { expect } from "@playwright/test";
import type { CharacterDsl } from "./character.js";
import type { CharacterImportDriver } from "./characterImportDriver.js";
import { numeneraFile } from "./fileImport.js";
import { IMPORTABLE_CHARACTERS } from "./importableCharacters.js";

const OUT_OF_RANGE_FILE = "test-hero.numenera";

export class CharacterImportDsl {
  private alert?: string;

  constructor(
    private imports: CharacterImportDriver,
    private character: CharacterDsl
  ) {}

  async importsCharacterWithTier(tier: number): Promise<void> {
    await this.imports.importFile(
      OUT_OF_RANGE_FILE,
      numeneraFile({ ...IMPORTABLE_CHARACTERS[OUT_OF_RANGE_FILE], tier })
    );
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
}
