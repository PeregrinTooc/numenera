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
import type { Clock, TimerHandle } from "@/services/clock";

function emit(name: string): void {
  window.dispatchEvent(new CustomEvent(name));
}

export class VersionHistoryService {
  private manager: VersionHistoryManager;
  private squashDelayMs: number;
  private clock: Clock;
  private globalTimer: TimerHandle | null = null;
  private buffer = new ChangeBuffer();
  private isSquashInProgress: boolean = false;

  constructor(manager: VersionHistoryManager, clock: Clock, squashDelayMs: number = 5000) {
    this.manager = manager;
    this.squashDelayMs = squashDelayMs;
    this.clock = clock;
  }

  resetTimer(): void {
    this.cancelTimer();
    this.globalTimer = this.clock.setTimeout(() => {
      this.performSquash();
    }, this.squashDelayMs);
  }

  private cancelTimer(): void {
    if (this.globalTimer !== null) {
      this.clock.clearTimeout(this.globalTimer);
      this.globalTimer = null;
    }
  }

  bufferChange(character: Character, description: string): void {
    this.buffer.push(character, description);

    this.resetTimer();
  }

  /** Save the buffered changes as one squashed version and mark it with its metadata. */
  private async persistSquash(latest: Character, squashedCount: number): Promise<void> {
    const combinedDescription = squashDescriptions(this.buffer.descriptions());
    const version = await this.manager.saveVersion(latest, combinedDescription);
    await this.manager.updateVersionMetadata(version.id, {
      isSquashed: true,
      squashedCount,
    });
  }

  /** Drop the committed entries, then stop the timer or give late edits a fresh window. */
  private dropSquashedAndRearm(squashedCount: number, latest: Character): void {
    // Redo stack must be cleared because buffered changes are now committed to a version
    // If user wants to undo the version, they use version navigation (not buffer redo)
    this.buffer.dropSquashed(squashedCount, latest);
    if (this.buffer.length === 0) {
      this.globalTimer = null;
    } else {
      // Late edits now build on the version just saved (the new initial
      // state). Their timer may have fired into the in-progress guard above,
      // so give them a fresh window.
      this.resetTimer();
    }
  }

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
      const latest = this.buffer.latest()!;

      await this.persistSquash(latest.character, squashedCount);
      this.dropSquashedAndRearm(squashedCount, latest.character);

      emit("version-squashed");
    } catch (error) {
      // Log-and-continue is deliberate: the character itself was auto-saved,
      // and reconcileVersionHistory rebuilds the missing version on next boot.
      console.error("Error performing squash:", error);
      this.buffer.clear();
      this.globalTimer = null;
    } finally {
      this.isSquashInProgress = false;
    }
  }

  getBufferLength(): number {
    return this.buffer.length;
  }

  isTimerActive(): boolean {
    return this.globalTimer !== null;
  }

  canUndo(): boolean {
    return this.buffer.canUndo();
  }

  setInitialState(character: Character): void {
    this.buffer.setInitialState(character);
  }

  undo(): Character | null {
    if (!this.buffer.canUndo()) {
      return null;
    }

    const result = this.buffer.undo();

    if (this.buffer.length > 0) {
      this.resetTimer();
    } else {
      this.cancelTimer();
    }

    emit("undo-completed");

    return result;
  }

  canRedo(): boolean {
    return this.buffer.canRedo();
  }

  redo(): Character | null {
    if (!this.buffer.canRedo()) {
      return null;
    }

    const redone = this.buffer.redo();

    this.resetTimer();

    return redone;
  }

  async forceSquash(): Promise<void> {
    this.cancelTimer();

    await this.performSquash();
  }
}
