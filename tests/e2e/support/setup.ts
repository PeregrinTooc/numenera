import type { CustomWorld } from "./world.js";
import type { Character } from "@/types/character";
import type { Layout } from "@/types/layout";
import type { SectionColumns } from "@/types/sectionColumns";
import { LAYOUT_STORAGE_KEY, SECTION_COLUMNS_STORAGE_KEY } from "@/storage/storageConstants";
import { waitForCharacterSheetReady, waitForInitialVersionSaved } from "./app-ready.js";
import { FULL_CHARACTER, EMPTY_ARRAYS } from "./cardTestFixtures.js";

export class SetupDsl {
  constructor(private world: CustomWorld) {}

  async character(overrides: Record<string, unknown> = {}): Promise<void> {
    await this.replaceCharacter({ ...FULL_CHARACTER, ...EMPTY_ARRAYS, ...overrides });
  }

  /** Like `character`, but the history starts over: only the new character's initial version. */
  async newCharacter(overrides: Record<string, unknown> = {}): Promise<void> {
    await this.world.storageHelper.setCharacter({
      ...FULL_CHARACTER,
      ...EMPTY_ARRAYS,
      ...overrides,
    });
    await this.world.storageHelper.clearVersions();
    await this.world.page.reload();
    await waitForCharacterSheetReady(this.world.page);
    await waitForInitialVersionSaved(this.world.page);
  }

  /**
   * Stores `character` exactly as given — including legacy or deliberately
   * malformed shapes a migration scenario needs — reloads, and waits.
   */
  async replaceCharacter(character: unknown): Promise<void> {
    await this.world.storageHelper.setCharacter(character);
    await this.world.page.reload();
    await waitForCharacterSheetReady(this.world.page);
  }

  /**
   * Applies `mutate` to the character currently in storage, then reloads.
   * Throws rather than silently skipping when storage is still empty: a
   * step that no-ops here passes for the wrong reason.
   */
  async updateCharacter(mutate: (character: Character) => void): Promise<void> {
    const character = await this.world.storageHelper.getCharacter();
    mutate(character);
    await this.replaceCharacter(character);
  }

  /**
   * Seeds the saved section layout (null = none saved, so the app uses
   * DEFAULT_LAYOUT), reloads, and waits for the sheet to be ready.
   */
  async layout(layout: Layout | null): Promise<void> {
    await this.seedLocalStorage(
      LAYOUT_STORAGE_KEY,
      layout === null ? null : JSON.stringify(layout)
    );
  }

  /** Seeds the saved column choices, reloads, and waits for the sheet to be ready. */
  async sectionColumns(columns: SectionColumns): Promise<void> {
    await this.seedLocalStorage(SECTION_COLUMNS_STORAGE_KEY, JSON.stringify(columns));
  }

  private async seedLocalStorage(key: string, value: string | null): Promise<void> {
    await this.world.page.evaluate(
      ({ key, value }) => {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      },
      { key, value }
    );
    await this.world.page.reload();
    await waitForCharacterSheetReady(this.world.page);
  }
}
