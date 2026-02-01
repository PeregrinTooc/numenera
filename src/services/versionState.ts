/**
 * VersionState manages the state of version history navigation
 * Separates concerns: latest character (for editing) vs displayed character (for viewing)
 */

import { Character } from "../types/character.js";
import { VersionHistoryManager } from "../storage/versionHistory.js";
import { CharacterVersion } from "../types/versionHistory.js";

export class VersionState {
  private latestCharacter: Character;
  private displayedCharacter: Character;
  private currentVersionIndex: number;
  private versionHistory: VersionHistoryManager;
  private allVersions: CharacterVersion[] = [];

  constructor(latestCharacter: Character, versionHistory: VersionHistoryManager) {
    this.latestCharacter = latestCharacter;
    this.displayedCharacter = latestCharacter;
    this.versionHistory = versionHistory;
    this.currentVersionIndex = -1; // -1 means viewing latest (not a historical version)
  }

  /**
   * Initialize by loading all versions from storage
   */
  async init(): Promise<void> {
    this.allVersions = await this.versionHistory.getAllVersions();
    // If we have versions, set index to latest
    if (this.allVersions.length > 0) {
      this.currentVersionIndex = this.allVersions.length - 1;
    }
  }

  /**
   * Check if currently viewing an old version (not the latest)
   */
  isViewingOldVersion(): boolean {
    return this.allVersions.length > 0 && this.currentVersionIndex < this.allVersions.length - 1;
  }

  /**
   * Get the character that should be displayed to the user
   */
  getDisplayedCharacter(): Character {
    return this.displayedCharacter;
  }

  /**
   * Get the latest character (for editing)
   */
  getLatestCharacter(): Character {
    return this.latestCharacter;
  }

  /**
   * Update the latest character (e.g., after an edit)
   */
  setLatestCharacter(character: Character): void {
    this.latestCharacter = character;
    // If viewing latest, also update displayed
    if (!this.isViewingOldVersion()) {
      this.displayedCharacter = character;
    }
  }

  /**
   * Get current version index (0-based)
   */
  getCurrentVersionIndex(): number {
    return this.currentVersionIndex;
  }

  /**
   * Get total number of versions
   */
  getVersionCount(): number {
    return this.allVersions.length;
  }

  /**
   * Navigate to a specific version by index
   */
  async navigateToVersion(index: number): Promise<void> {
    if (index < 0 || index >= this.allVersions.length) {
      throw new Error(`Invalid version index: ${index}`);
    }

    this.currentVersionIndex = index;
    const version = this.allVersions[index];
    this.displayedCharacter = version.character as Character;
  }

  /**
   * Navigate backward to previous version
   */
  async navigateBackward(): Promise<void> {
    if (this.currentVersionIndex > 0) {
      await this.navigateToVersion(this.currentVersionIndex - 1);
    }
  }

  /**
   * Navigate forward to next version
   */
  async navigateForward(): Promise<void> {
    if (this.currentVersionIndex < this.allVersions.length - 1) {
      await this.navigateToVersion(this.currentVersionIndex + 1);
    }
  }

  /**
   * Restore to latest version (exit read-only mode)
   */
  restoreToLatest(): void {
    this.currentVersionIndex = this.allVersions.length - 1;
    this.displayedCharacter = this.latestCharacter;
  }

  /**
   * Reload versions from storage (e.g., after creating a new version)
   */
  async reload(): Promise<void> {
    this.allVersions = await this.versionHistory.getAllVersions();
    // Update index to latest
    if (this.allVersions.length > 0) {
      this.currentVersionIndex = this.allVersions.length - 1;
    }
    // If we were viewing latest, update displayed character
    if (!this.isViewingOldVersion()) {
      this.displayedCharacter = this.latestCharacter;
    }
  }

  /**
   * Get version metadata (description, timestamp) for current version
   */
  getCurrentVersionMetadata(): { description: string; timestamp: Date } | null {
    if (this.currentVersionIndex >= 0 && this.currentVersionIndex < this.allVersions.length) {
      const version = this.allVersions[this.currentVersionIndex];
      return {
        description: version.description,
        timestamp: new Date(version.timestamp),
      };
    }
    return null;
  }
}
