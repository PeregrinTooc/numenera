/**
 * ChangeBuffer holds the in-memory undo/redo state of VersionHistoryService:
 * the buffered changes, the redo stack and the state before editing started.
 * It is pure state; timers and events stay with the service.
 */

import type { Character } from "@/types/character";

export interface BufferedChange {
  character: Character;
  description: string;
  timestamp: number;
}

export class ChangeBuffer {
  private buffer: BufferedChange[] = [];
  private redoStack: BufferedChange[] = [];
  private initialState: Character | null = null;

  /** Buffer a deep clone of the character; a new change invalidates redo. */
  push(character: Character, description: string): void {
    this.buffer.push({
      character: globalThis.structuredClone(character),
      description,
      timestamp: Date.now(),
    });
    this.redoStack = [];
  }

  get length(): number {
    return this.buffer.length;
  }

  /** The most recent buffered change, or undefined when empty. */
  latest(): BufferedChange | undefined {
    return this.buffer[this.buffer.length - 1];
  }

  descriptions(): string[] {
    return this.buffer.map((b) => b.description);
  }

  canUndo(): boolean {
    return this.buffer.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  setInitialState(character: Character): void {
    this.initialState = globalThis.structuredClone(character);
  }

  /**
   * Move the last change to the redo stack. Returns the state to restore
   * (the previous change, or the initial state when the buffer is now empty),
   * or null when there was nothing to undo.
   */
  undo(): Character | null {
    const undone = this.buffer.pop();
    if (!undone) {
      return null;
    }
    this.redoStack.push(undone);
    return this.buffer.length === 0
      ? this.initialState
      : this.buffer[this.buffer.length - 1].character;
  }

  /** Move the last undone change back to the buffer and return its state. */
  redo(): Character | null {
    const redone = this.redoStack.pop();
    if (!redone) {
      return null;
    }
    this.buffer.push(redone);
    return redone.character;
  }

  /**
   * Drop the first `count` entries (they were squashed into a version) and the
   * redo stack. Later entries build on the last squashed state; with none left
   * the initial state is reset.
   */
  dropSquashed(count: number, squashedState: Character): void {
    this.buffer = this.buffer.slice(count);
    this.redoStack = [];
    this.initialState = this.buffer.length === 0 ? null : squashedState;
  }

  /** Clear everything except the redo stack (needed for subsequent redos). */
  clear(): void {
    this.buffer = [];
    this.initialState = null;
  }
}
