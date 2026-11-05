import { Page } from "@playwright/test";
import type { Character } from "@/types/character";
import type { CharacterVersion } from "@/types/versionHistory";

export class TestStorageHelper {
  constructor(private page: Page) {}

  async setCharacter(character: unknown): Promise<void> {
    await this.page.evaluate(async (char) => {
      if (!window.__testStorage) {
        throw new Error("Test storage API not available. Make sure the app has loaded.");
      }
      await window.__testStorage.saveCharacterState(char as Character);
    }, character);
  }

  /**
   * Throws when storage is still empty: a step reading the character before
   * the app has persisted one would otherwise pass for the wrong reason.
   */
  async getCharacter(): Promise<Character> {
    const character = await this.page.evaluate(async () => {
      if (!window.__testStorage) {
        throw new Error("Test storage API not available. Make sure the app has loaded.");
      }
      return await window.__testStorage.loadCharacterState();
    });
    if (!character) {
      throw new Error(
        "getCharacter: no character in storage yet - navigate with waitForCharacterSheetReady first"
      );
    }
    return character;
  }

  async getUnreadableBackup(): Promise<unknown> {
    return await this.page.evaluate(async () => {
      if (!window.__testStorage) {
        throw new Error("Test storage API not available. Make sure the app has loaded.");
      }
      return await window.__testStorage.loadCorruptedCharacterBackup();
    });
  }

  async clearStorage(): Promise<void> {
    await this.page.evaluate(async () => {
      if (!window.__testStorage) {
        throw new Error("Test storage API not available. Make sure the app has loaded.");
      }
      await window.__testStorage.clearCharacterState();
    });
  }

  /** @deprecated Use setCharacter() instead */
  async setLocalStorageDirect(key: string, value: string): Promise<void> {
    await this.page.evaluate(({ k, v }) => localStorage.setItem(k, v), { k: key, v: value });
  }

  /** @deprecated Use getCharacter() instead */
  async getLocalStorageDirect(key: string): Promise<string | null> {
    return await this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  /**
   * Also stores the character, as the app does: its latest version always
   * matches the stored character, and on boot reconcileVersionHistory would
   * otherwise rebuild a phantom version from the mismatch.
   */
  async createVersion(character: Character, description: string): Promise<void> {
    await this.page.evaluate(
      async ({ char, desc }) => {
        if (!window.__testVersionHistory) {
          throw new Error("Test version history API not available. Make sure the app has loaded.");
        }
        await window.__testVersionHistory.createVersion(char, desc);
      },
      { char: character, desc: description }
    );
    await this.setCharacter(character);
  }

  async getAllVersions(): Promise<CharacterVersion[]> {
    return await this.page.evaluate(async () => {
      if (!window.__testVersionHistory) {
        throw new Error("Test version history API not available. Make sure the app has loaded.");
      }
      return await window.__testVersionHistory.getAllVersions();
    });
  }

  async clearVersions(): Promise<void> {
    await this.page.evaluate(async () => {
      if (!window.__testVersionHistory) {
        throw new Error("Test version history API not available. Make sure the app has loaded.");
      }
      await window.__testVersionHistory.clearVersions();
    });
  }
}
