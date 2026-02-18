import { Page } from "@playwright/test";

// Type declaration for test storage API exposed by main.ts
declare global {
  interface Window {
    __testStorage?: {
      saveCharacterState: (character: any) => Promise<void>;
      loadCharacterState: () => Promise<any>;
      clearCharacterState: () => Promise<void>;
    };
    __testVersionHistory?: {
      createVersion: (character: any, description: string) => Promise<void>;
      getAllVersions: () => Promise<any[]>;
      clearVersions: () => Promise<void>;
    };
  }
}

/**
 * Test helper for character storage operations
 *
 * Abstracts away storage implementation details from E2E tests.
 * Tests use this helper instead of directly manipulating localStorage,
 * ensuring tests continue working regardless of storage backend
 * (localStorage, IndexedDB, remote server, etc.)
 *
 * Benefits:
 * - Tests describe behavior, not implementation
 * - Storage backend can be swapped without changing tests
 * - Single place to update if storage API changes
 */
export class TestStorageHelper {
  constructor(private page: Page) {}

  /**
   * Set character data in storage
   * Uses the app's current storage implementation
   *
   * @param character Character object to store
   */
  async setCharacter(character: any): Promise<void> {
    await this.page.evaluate(async (char) => {
      // Use storage API exposed on window by main.ts (works in dev and production)
      if (!window.__testStorage) {
        throw new Error("Test storage API not available. Make sure the app has loaded.");
      }
      await window.__testStorage.saveCharacterState(char);
    }, character);
  }

  /**
   * Get character data from storage
   *
   * @returns Stored character object or null
   */
  async getCharacter(): Promise<any> {
    return await this.page.evaluate(async () => {
      if (!window.__testStorage) {
        throw new Error("Test storage API not available. Make sure the app has loaded.");
      }
      return await window.__testStorage.loadCharacterState();
    });
  }

  /**
   * Clear all character storage
   */
  async clearStorage(): Promise<void> {
    await this.page.evaluate(async () => {
      if (!window.__testStorage) {
        throw new Error("Test storage API not available. Make sure the app has loaded.");
      }
      await window.__testStorage.clearCharacterState();
    });
  }

  /**
   * Direct localStorage access for legacy/migration scenarios
   *
   * @deprecated Use setCharacter() instead
   * @param key Storage key
   * @param value JSON string value
   */
  async setLocalStorageDirect(key: string, value: string): Promise<void> {
    await this.page.evaluate(({ k, v }) => localStorage.setItem(k, v), { k: key, v: value });
  }

  /**
   * Direct localStorage access for legacy/migration scenarios
   *
   * @deprecated Use getCharacter() instead
   * @param key Storage key
   * @returns Stored value or null
   */
  async getLocalStorageDirect(key: string): Promise<string | null> {
    return await this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  /**
   * Create a version in version history
   *
   * @param character Character data to save as a version
   * @param description Description of the changes
   */
  async createVersion(character: any, description: string): Promise<void> {
    await this.page.evaluate(
      async ({ char, desc }) => {
        if (!window.__testVersionHistory) {
          throw new Error("Test version history API not available. Make sure the app has loaded.");
        }
        await window.__testVersionHistory.createVersion(char, desc);
      },
      { char: character, desc: description }
    );
  }

  /**
   * Get all versions from version history
   *
   * @returns Array of version objects
   */
  async getAllVersions(): Promise<any[]> {
    return await this.page.evaluate(async () => {
      if (!window.__testVersionHistory) {
        throw new Error("Test version history API not available. Make sure the app has loaded.");
      }
      return await window.__testVersionHistory.getAllVersions();
    });
  }

  /**
   * Clear all versions from version history
   */
  async clearVersions(): Promise<void> {
    await this.page.evaluate(async () => {
      if (!window.__testVersionHistory) {
        throw new Error("Test version history API not available. Make sure the app has loaded.");
      }
      await window.__testVersionHistory.clearVersions();
    });
  }
}
