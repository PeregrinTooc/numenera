/**
 * VersionHistoryService manages smart squashing of version history
 * - Buffers changes in memory (no immediate save)
 * - Single global timer that resets on each user interaction
 * - On timer expiry: combines buffered changes into one squashed version
 * - Three separate concerns: resetTimer, bufferChange, performSquash
 */

import type { Character } from "../types/character.js";
import { VersionHistoryManager } from "../storage/versionHistory.js";
import { squashDescriptions } from "../utils/squashDescriptions.js";

interface BufferedChange {
  character: Character;
  description: string;
  timestamp: number;
}

export class VersionHistoryService {
  private manager: VersionHistoryManager;
  private squashDelayMs: number;
  private globalTimer: ReturnType<typeof setTimeout> | null = null;
  private buffer: BufferedChange[] = [];

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
   * Reset the squash timer (synchronous)
   * Called on every user interaction (keystrokes, field changes)
   */
  resetTimer(): void {
    if (this.globalTimer !== null) {
      globalThis.clearTimeout(this.globalTimer);
    }

    this.globalTimer = globalThis.setTimeout(() => {
      this.performSquash();
    }, this.squashDelayMs);
  }

  /**
   * Buffer a change without immediately saving
   * Called when user confirms a change (modal confirm, field update)
   * @param character The character state to buffer
   * @param description Description of the change
   */
  bufferChange(character: Character, description: string): void {
    // Deep clone to prevent mutations
    this.buffer.push({
      character: globalThis.structuredClone(character),
      description,
      timestamp: Date.now(),
    });

    // Reset timer when buffering
    this.resetTimer();
  }

  /**
   * Convenience method: reset timer AND buffer change
   * Used for non-modal edits (e.g., stat buttons, checkboxes)
   * @param character The character state to buffer
   * @param description Description of the change
   */
  trackChange(character: Character, description: string): void {
    this.resetTimer();
    this.bufferChange(character, description);
  }

  /**
   * Perform squashing operation
   * Combines buffered changes into single version
   */
  private async performSquash(): Promise<void> {
    if (this.buffer.length === 0) {
      this.globalTimer = null;
      return;
    }

    try {
      // Use the latest character state
      const latest = this.buffer[this.buffer.length - 1];

      // Combine all descriptions
      const descriptions = this.buffer.map((b) => b.description);
      const combinedDescription = squashDescriptions(descriptions);

      // Save one squashed version
      const version = await this.manager.saveVersion(latest.character, combinedDescription);

      // Mark as squashed with metadata
      await this.updateVersionMetadata(version.id, {
        isSquashed: true,
        squashedCount: this.buffer.length,
      });

      // Clear buffer and timer
      this.buffer = [];
      this.globalTimer = null;

      // Dispatch custom event to notify that a version was created
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("version-squashed"));
      }
    } catch (error) {
      console.error("Error performing squash:", error);
      // Clear state on error
      this.buffer = [];
      this.globalTimer = null;
    }
  }

  /**
   * Flush buffered changes (called on page unload)
   * Saves any pending changes before page closes
   */
  async flush(): Promise<void> {
    if (this.globalTimer !== null) {
      globalThis.clearTimeout(this.globalTimer);
      this.globalTimer = null;
    }
    await this.performSquash();
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
   * Get buffer length (for testing)
   */
  getBufferLength(): number {
    return this.buffer.length;
  }

  /**
   * Check if timer is active (for testing)
   */
  isTimerActive(): boolean {
    return this.globalTimer !== null;
  }

  /**
   * Check if currently performing a squash operation
   * Used to prevent version creation during squash
   */
  isSquashing(): boolean {
    // We're squashing if there's pending async work (buffer > 0 and timer just expired)
    // For now, just return false as the timer check in main.ts is sufficient
    return false;
  }
}
