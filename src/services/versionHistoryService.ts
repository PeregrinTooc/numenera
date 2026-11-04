/**
 * VersionHistoryService manages smart squashing of version history
 * - Buffers changes in memory (no immediate save)
 * - Single global timer that resets on each user interaction
 * - On timer expiry: combines buffered changes into one squashed version
 * - Three separate concerns: resetTimer, bufferChange, performSquash
 */

import type { Character } from "@/types/character";
import { VersionHistoryManager } from "@/storage/versionHistory";
import { squashDescriptions } from "@/utils/squashDescriptions";
import { ChangeBuffer } from "./changeBuffer.js";
import type { ITimer, TimerHandle } from "./timer.js";
import { RealTimer } from "./timer.js";

function emit(name: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name));
  }
}

export class VersionHistoryService {
  private manager: VersionHistoryManager;
  private squashDelayMs: number;
  private timer: ITimer;
  private globalTimer: TimerHandle | null = null;
  private buffer = new ChangeBuffer();
  private isSquashInProgress: boolean = false;

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
    this.cancelTimer();
    this.globalTimer = this.timer.setTimeout(() => {
      this.performSquash();
    }, this.squashDelayMs);
  }

  private cancelTimer(): void {
    if (this.globalTimer !== null) {
      this.timer.clearTimeout(this.globalTimer);
      this.globalTimer = null;
    }
  }

  /**
   * Buffer a change without immediately saving
   * Called when user confirms a change (modal confirm, field update)
   * @param character The character state to buffer
   * @param description Description of the change
   */
  bufferChange(character: Character, description: string): void {
    // Buffer clones the character and clears the redo stack
    this.buffer.push(character, description);

    // Reset timer when buffering
    this.resetTimer();
  }

  /**
   * Perform squashing operation
   * Combines buffered changes into single version
   */
  private async performSquash(): Promise<void> {
    // An edit during an in-flight squash restarts the timer, which can fire
    // before that squash's save resolves - without this guard, the second call
    // would still see the not-yet-cleared buffer and save it again as a
    // duplicate version.
    if (this.isSquashInProgress) {
      return;
    }

    if (this.buffer.length === 0) {
      this.globalTimer = null;
      return;
    }

    this.isSquashInProgress = true;

    try {
      // Edits buffered while the save below is pending belong to the next
      // squash, so remember how many entries this one covers.
      const squashedCount = this.buffer.length;

      // Use the latest character state
      const latest = this.buffer.latest()!;

      // Combine all descriptions
      const combinedDescription = squashDescriptions(this.buffer.descriptions());

      // Save one squashed version
      const version = await this.manager.saveVersion(latest.character, combinedDescription);

      // Mark as squashed with metadata
      await this.manager.updateVersionMetadata(version.id, {
        isSquashed: true,
        squashedCount,
      });

      // Drop the squashed entries and the redo stack
      // Redo stack must be cleared because buffered changes are now committed to a version
      // If user wants to undo the version, they use version navigation (not buffer redo)
      this.buffer.dropSquashed(squashedCount, latest.character);
      if (this.buffer.length === 0) {
        this.globalTimer = null;
      } else {
        // Late edits now build on the version just saved (the new initial
        // state). Their timer may have fired into the in-progress guard above,
        // so give them a fresh window.
        this.resetTimer();
      }

      // Dispatch custom event to notify that a version was created
      emit("version-squashed");
    } catch (error) {
      // Log-and-continue is deliberate: the character itself was auto-saved,
      // and reconcileVersionHistory rebuilds the missing version on next boot.
      console.error("Error performing squash:", error);
      // Clear state on error
      this.buffer.clear();
      this.globalTimer = null;
    } finally {
      this.isSquashInProgress = false;
    }
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
   * Check if there are buffered changes that can be undone
   * Returns true if the buffer has at least one change
   */
  canUndo(): boolean {
    return this.buffer.canUndo();
  }

  /**
   * Set the initial character state before any buffered changes
   * This allows undo to revert back to the state before editing started
   */
  setInitialState(character: Character): void {
    this.buffer.setInitialState(character);
  }

  /**
   * Undo the last buffered change
   * Returns the previous character state, or null if nothing to undo
   */
  undo(): Character | null {
    if (!this.buffer.canUndo()) {
      return null;
    }

    // Move the last buffered change to redo stack; the result is the previous
    // state (or the initial state when the buffer is now empty)
    const result = this.buffer.undo();

    // If buffer still has changes, reset the timer to give it a fresh delay
    // This ensures the remaining buffered changes get squashed after the full delay
    if (this.buffer.length > 0) {
      this.resetTimer();
    } else {
      // If buffer is now empty, cancel the timer (nothing to squash)
      this.cancelTimer();
    }

    emit("undo-completed");

    return result;
  }

  /**
   * Check if there are undone changes that can be redone
   * Returns true if the redo stack has at least one change
   */
  canRedo(): boolean {
    return this.buffer.canRedo();
  }

  /**
   * Redo the last undone change
   * Returns the redone character state, or null if nothing to redo
   */
  redo(): Character | null {
    if (!this.buffer.canRedo()) {
      return null;
    }

    // Move the last undone change back to buffer
    const redone = this.buffer.redo();

    // Reset the timer to give the buffered changes a fresh delay
    // This ensures changes get squashed after the full delay period
    this.resetTimer();

    // Return the redone state
    return redone;
  }

  /**
   * Force immediate squash (for testing)
   * Cancels any pending timer and performs squash immediately
   * This allows tests to deterministically control when squashing occurs
   * without waiting for timer delays
   * @returns Promise that resolves when squash is complete
   */
  async forceSquash(): Promise<void> {
    // Cancel any pending timer
    this.cancelTimer();

    // Perform squash immediately
    await this.performSquash();
  }
}
