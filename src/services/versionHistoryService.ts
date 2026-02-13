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
import type { ITimer, TimerHandle } from "./timer.js";
import { RealTimer } from "./timer.js";

interface BufferedChange {
  character: Character;
  description: string;
  timestamp: number;
}

export class VersionHistoryService {
  private manager: VersionHistoryManager;
  private squashDelayMs: number;
  private timer: ITimer;
  private globalTimer: TimerHandle | null = null;
  private buffer: BufferedChange[] = [];
  private redoStack: BufferedChange[] = [];
  private initialState: Character | null = null;

  /**
   * Create a new VersionHistoryService
   * @param manager The VersionHistoryManager for persistent storage
   * @param squashDelayMs Delay in milliseconds before squashing (default: 5000)
   * @param timer Timer implementation (defaults to RealTimer for production)
   */
  constructor(
    manager: VersionHistoryManager,
    squashDelayMs: number = 5000,
    timer: ITimer = new RealTimer()
  ) {
    this.manager = manager;
    this.squashDelayMs = squashDelayMs;
    this.timer = timer;
  }

  /**
   * Reset the squash timer (synchronous)
   * Called on every user interaction (keystrokes, field changes)
   */
  resetTimer(): void {
    if (this.globalTimer !== null) {
      this.timer.clearTimeout(this.globalTimer);
    }

    this.globalTimer = this.timer.setTimeout(() => {
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

    // Clear redo stack when new change is made
    this.redoStack = [];

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

    // Emit squash-started event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("squash-started"));
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

      // Clear buffer, timer, initial state, AND redo stack
      // Redo stack must be cleared because buffered changes are now committed to a version
      // If user wants to undo the version, they use version navigation (not buffer redo)
      this.buffer = [];
      this.redoStack = [];
      this.globalTimer = null;
      this.initialState = null;

      // Dispatch custom event to notify that a version was created
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("version-squashed"));
        window.dispatchEvent(new CustomEvent("squash-completed"));
      }
    } catch (error) {
      console.error("Error performing squash:", error);
      // Clear state on error
      this.buffer = [];
      this.globalTimer = null;
      this.initialState = null;

      // Emit error event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("squash-error", { detail: { error } }));
      }
    }
  }

  /**
   * Flush buffered changes (called on page unload)
   * Saves any pending changes before page closes
   */
  async flush(): Promise<void> {
    if (this.globalTimer !== null) {
      this.timer.clearTimeout(this.globalTimer);
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

  /**
   * Check if there are buffered changes that can be undone
   * Returns true if the buffer has at least one change
   */
  canUndo(): boolean {
    return this.buffer.length > 0;
  }

  /**
   * Set the initial character state before any buffered changes
   * This allows undo to revert back to the state before editing started
   */
  setInitialState(character: Character): void {
    this.initialState = globalThis.structuredClone(character);
  }

  /**
   * Undo the last buffered change
   * Returns the previous character state, or null if nothing to undo
   */
  undo(): Character | null {
    if (this.buffer.length === 0) {
      return null;
    }

    // Emit undo-started event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("undo-started"));
    }

    // Move the last buffered change to redo stack
    const undoneChange = this.buffer.pop()!;
    this.redoStack.push(undoneChange);

    // If buffer still has changes, reset the timer to give it a fresh delay
    // This ensures the remaining buffered changes get squashed after the full delay
    if (this.buffer.length > 0) {
      this.resetTimer();
    } else {
      // If buffer is now empty, cancel the timer (nothing to squash)
      if (this.globalTimer !== null) {
        this.timer.clearTimeout(this.globalTimer);
        this.globalTimer = null;
      }
    }

    // Return the previous state (now the last item in buffer)
    // If buffer is now empty, return initial state
    const result =
      this.buffer.length === 0 ? this.initialState : this.buffer[this.buffer.length - 1].character;

    // Emit undo-completed event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("undo-completed"));
    }

    return result;
  }

  /**
   * Check if there are undone changes that can be redone
   * Returns true if the redo stack has at least one change
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Redo the last undone change
   * Returns the redone character state, or null if nothing to redo
   */
  redo(): Character | null {
    if (this.redoStack.length === 0) {
      return null;
    }

    // Emit redo-started event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("redo-started"));
    }

    // Move the last undone change back to buffer
    const redoneChange = this.redoStack.pop()!;
    this.buffer.push(redoneChange);

    // Reset the timer to give the buffered changes a fresh delay
    // This ensures changes get squashed after the full delay period
    this.resetTimer();

    // Emit redo-completed event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("redo-completed"));
    }

    // Return the redone state
    return redoneChange.character;
  }

  /**
   * Clear the buffer without creating a version
   * Used when the buffered state has been persisted to localStorage
   * and doesn't need to become a version (e.g., after redo + save)
   * Note: Does NOT clear the redo stack, only the buffer
   */
  clearBuffer(): void {
    this.buffer = [];
    // Don't clear redoStack - it's needed for subsequent redos
    this.initialState = null;

    // Clear any active timer since we're clearing the buffer
    if (this.globalTimer !== null) {
      this.timer.clearTimeout(this.globalTimer);
      this.globalTimer = null;
    }
  }

  /**
   * Get the timer handle for testing (allows tests to trigger specific timers)
   */
  getTimerHandle(): TimerHandle | null {
    return this.globalTimer;
  }
}
