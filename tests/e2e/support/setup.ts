import type { CustomWorld } from "./world.js";
import { waitForCharacterSheetReady } from "./app-ready.js";
import { BASE_CHARACTER, EMPTY_ARRAYS } from "./cardTestFixtures.js";

export class SetupDsl {
  constructor(private world: CustomWorld) {}

  /**
   * Replaces the character in storage with BASE_CHARACTER plus the given
   * overrides, reloads, and waits for the sheet to be ready. FULL_CHARACTER
   * (Phase 5) will replace BASE_CHARACTER as the default here once the two
   * are unified; until then this is the same "Kael the Wanderer" template
   * every card fixture already builds on.
   */
  async character(overrides: Record<string, unknown> = {}): Promise<void> {
    await this.world.storageHelper.setCharacter({
      ...BASE_CHARACTER,
      ...EMPTY_ARRAYS,
      ...overrides,
    });
    await this.world.page.reload();
    await waitForCharacterSheetReady(this.world.page);
  }
}
