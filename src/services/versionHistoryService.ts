/**
 * VersionHistoryService manages smart squashing of version history
 * - Saves versions immediately to IndexedDB (backward compatible)
 * - Tracks unsquashed version IDs in memory
 * - On timer expiry: deletes unsquashed versions, creates one squashed version
 * - Timer resets on any user interaction
 */

import type { Character } from "../types/character.js";
import type { CharacterVersion } from "../types/versionHistory.js";
import { VersionHistoryManager } from "../storage/versionHistory.js";
import { squashDescriptions } from "../utils/squashDescriptions.js";

export class VersionHistoryService {
  private manager: VersionHistoryManager;
  private squashDelayMs: number;
  private squashTimerId: number | null = null;
  private unsquashedVersionIds: string[] = [];
  private _isSquashing = false;

  /**
   * Create a new VersionHistoryService
   * @param manager The VersionHistoryManager for persistent storage
   * @param squashDelayMs Delay in milliseconds before squashing (default: 5000)
   */
  constructor(manager: VersionHistoryManager, squashDelayMs: number = 5000) {
    this.manager = manager;
    this.squashDelayMs = squashDelayMs;
  }

  /**
   * Track a character change and schedule squashing
   * Saves version immediately to IndexedDB (backward compatible)
   * @param character The character to save
   * @param description Description of the change
   */
  async trackChange(character: Character, description: string): Promise<void> {
    // Reset squash timer IMMEDIATELY - before any other operations
    // This prevents the previous timer from expiring during async operations
    this.resetTimer();

    // Don't track versions created during squashing operation
    if (this._isSquashing) {
      return;
    }

    // Save version immediately (maintains backward compatibility)
    const version = await this.manager.saveVersion(character, description);

    // Track this version ID as unsquashed
    this.unsquashedVersionIds.push(version.id);
  }

  /**
   * Reset the squash timer
   * Called on any user interaction (edits, modal open, etc.)
   */
  resetTimer(): void {
    // Clear existing timer
    if (this.squashTimerId !== null) {
      window.clearTimeout(this.squashTimerId);
    }

    // Start new timer
    this.squashTimerId = window.setTimeout(() => {
      this.performSquash();
    }, this.squashDelayMs) as unknown as number;
  }

  /**
   * Cancel the squash timer
   * Called when navigating to old versions (read-only mode)
   */
  cancelTimer(): void {
    if (this.squashTimerId !== null) {
      window.clearTimeout(this.squashTimerId);
      this.squashTimerId = null;
    }
  }

  /**
   * Perform squashing operation
   * Deletes unsquashed versions from storage, creates one squashed version
   */
  private async performSquash(): Promise<void> {
    if (this.unsquashedVersionIds.length === 0) {
      this.squashTimerId = null;
      return;
    }

    // Set flag to prevent re-tracking the squashed version
    this._isSquashing = true;

    try {
      // Get all unsquashed versions from storage
      const versions = await Promise.all(
        this.unsquashedVersionIds.map((id) => this.manager.getVersionById(id))
      );

      // Filter out any null results (versions that don't exist)
      const validVersions = versions.filter((v): v is CharacterVersion => v !== null);

      if (validVersions.length === 0) {
        this.unsquashedVersionIds = [];
        this.squashTimerId = null;
        this._isSquashing = false;
        return;
      }

      // Use the most recent character state (last version)
      const latestVersion = validVersions[validVersions.length - 1];

      // Collect all descriptions for squashing
      const descriptions = validVersions.map((v) => v.description);
      const combinedDescription = squashDescriptions(descriptions);

      // Delete all unsquashed versions from IndexedDB
      await this.deleteVersions(this.unsquashedVersionIds);

      // Clear tracking array
      this.unsquashedVersionIds = [];

      // Create one new squashed version
      // The _isSquashing flag prevents trackChange from being called
      const squashedVersion = await this.manager.saveVersion(
        latestVersion.character as Character,
        combinedDescription
      );

      // Mark it as squashed with metadata
      await this.updateVersionMetadata(squashedVersion.id, {
        isSquashed: true,
        squashedCount: validVersions.length,
      });

      // Clear timer and squashing flag
      this.squashTimerId = null;
      this._isSquashing = false;
    } catch (error) {
      console.error("Error performing squash:", error);
      // Clear state on error to prevent stuck state
      this.unsquashedVersionIds = [];
      this.squashTimerId = null;
      this._isSquashing = false;
    }
  }

  /**
   * Delete multiple versions by ID from IndexedDB
   * @param versionIds Array of version IDs to delete
   */
  private async deleteVersions(versionIds: string[]): Promise<void> {
    // Access the private db instance (we need to expose a public delete method)
    // For now, we'll use the internal accessor pattern
    const db = (this.manager as any).db as IDBDatabase;
    if (!db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["versions"], "readwrite");
      const store = transaction.objectStore("versions");

      // Delete each version
      for (const id of versionIds) {
        store.delete(id);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error("Failed to delete versions"));
    });
  }

  /**
   * Update version metadata in IndexedDB
   * @param versionId The ID of the version to update
   * @param updates The metadata to update
   */
  private async updateVersionMetadata(
    versionId: string,
    updates: { isSquashed?: boolean; squashedCount?: number }
  ): Promise<void> {
    const db = (this.manager as any).db as IDBDatabase;
    if (!db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["versions"], "readwrite");
      const store = transaction.objectStore("versions");
      const getRequest = store.get(versionId);

      getRequest.onsuccess = () => {
        const versionData = getRequest.result;
        if (!versionData) {
          reject(new Error(`Version ${versionId} not found`));
          return;
        }

        // Update metadata
        if (updates.isSquashed !== undefined) {
          versionData.isSquashed = updates.isSquashed;
        }
        if (updates.squashedCount !== undefined) {
          versionData.squashedCount = updates.squashedCount;
        }

        // Save updated version
        const putRequest = store.put(versionData);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error("Failed to update version metadata"));
      };

      getRequest.onerror = () => reject(new Error("Failed to get version for update"));
    });
  }

  /**
   * Get count of unsquashed versions
   * Useful for testing
   */
  getUnsquashedCount(): number {
    return this.unsquashedVersionIds.length;
  }

  /**
   * Check if timer is active
   * Useful for testing
   */
  isTimerActive(): boolean {
    return this.squashTimerId !== null;
  }

  /**
   * Check if currently performing squash operation
   * Used to prevent circular event triggering
   */
  isSquashing(): boolean {
    return this._isSquashing;
  }
}
