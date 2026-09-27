import type { CustomWorld } from "./world.js";
import type { Character } from "../../../src/types/character.js";
import type { Layout } from "../../../src/types/layout.js";
import { LAYOUT_STORAGE_KEY } from "../../../src/storage/storageConstants.js";
import { waitForCharacterSheetReady } from "./app-ready.js";
import { FULL_CHARACTER, EMPTY_ARRAYS } from "./cardTestFixtures.js";

export class SetupDsl {
  constructor(private world: CustomWorld) {}

  /**
   * Replaces the character in storage with FULL_CHARACTER plus the given
   * overrides, reloads, and waits for the sheet to be ready. This is the
   * same "Kael the Wanderer" template every card fixture already builds on.
   */
  async character(overrides: Record<string, unknown> = {}): Promise<void> {
    await this.replaceCharacter({ ...FULL_CHARACTER, ...EMPTY_ARRAYS, ...overrides });
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
    const character = (await this.world.storageHelper.getCharacter()) as Character | null;
    if (!character) {
      throw new Error(
        "setup.updateCharacter: no character in storage yet — navigate with waitForCharacterSheetReady first"
      );
    }
    mutate(character);
    await this.replaceCharacter(character);
  }

  /**
   * Seeds the saved section layout (null = none saved, so the app uses
   * DEFAULT_LAYOUT), reloads, and waits for the sheet to be ready.
   */
  async layout(layout: Layout | null): Promise<void> {
    await this.world.page.evaluate(
      ({ key, value }) => {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      },
      { key: LAYOUT_STORAGE_KEY, value: layout === null ? null : JSON.stringify(layout) }
    );
    await this.world.page.reload();
    await waitForCharacterSheetReady(this.world.page);
  }
}
