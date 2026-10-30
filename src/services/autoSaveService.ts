/**
 * AutoSaveService handles debounced auto-saving of character data
 * Emits events for save lifecycle: save-requested, save-completed, save-error
 */

import type { ITimer, TimerHandle } from "./timer.js";
import { RealTimer } from "./timer.js";

type SaveCallback = () => Promise<void>;

/** Payload of every event the service emits, keyed by event name. */
export interface AutoSaveEvents {
  "save-requested": Record<string, never>;
  "save-completed": { timestamp: number };
  "save-error": { error: unknown };
}

type EventType = keyof AutoSaveEvents;
type EventListener<E extends EventType> = (event: AutoSaveEvents[E]) => void;

export class AutoSaveService {
  private saveCallback: SaveCallback;
  private debounceMs: number;
  private timer: ITimer;
  private timerId: TimerHandle | null = null;
  private listeners: { [E in EventType]: Set<EventListener<E>> } = {
    "save-requested": new Set(),
    "save-completed": new Set(),
    "save-error": new Set(),
  };
  private savePromise: Promise<void> | null = null;

  /**
   * Create a new AutoSaveService
   * @param saveCallback Async function to call when saving
   * @param debounceMs Debounce delay in milliseconds
   * @param timer Timer implementation (defaults to RealTimer for production)
   */
  constructor(
    saveCallback: SaveCallback,
    debounceMs: number = 300,
    timer: ITimer = new RealTimer()
  ) {
    this.saveCallback = saveCallback;
    this.debounceMs = debounceMs;
    this.timer = timer;
  }

  /**
   * Request a save operation (debounced)
   * Multiple rapid calls will be debounced into a single save
   */
  requestSave(): void {
    // Clear existing timer if any
    if (this.timerId !== null) {
      this.timer.clearTimeout(this.timerId);
    }

    // Emit save-requested event
    this.emit("save-requested", {});

    // Set new timer
    this.timerId = this.timer.setTimeout(() => {
      this.performSave();
    }, this.debounceMs);
  }

  /**
   * Perform the actual save operation
   */
  private async performSave(): Promise<void> {
    this.timerId = null;

    this.savePromise = this.saveCallback()
      .then(() => {
        const timestamp = Date.now();
        this.emit("save-completed", { timestamp });
        this.savePromise = null;
      })
      .catch((error) => {
        this.emit("save-error", { error });
        this.savePromise = null;
      });

    return this.savePromise;
  }

  /**
   * Flush pending saves immediately
   * Useful for tests and page unload
   */
  flush(): Promise<void> {
    // A pending timer means there are unsaved changes: save them now.
    // Not awaited on purpose (unload handlers cannot await): the write is issued in this same task
    // (after the storage-singleton microtask), not after the debounce.
    if (this.timerId !== null) {
      this.timer.clearTimeout(this.timerId);
      return this.performSave();
    }

    // If a save is in progress, wait for it; otherwise nothing is pending
    return this.savePromise ?? Promise.resolve();
  }

  /**
   * Add event listener
   */
  on<E extends EventType>(event: E, listener: EventListener<E>): void {
    this.listeners[event].add(listener);
  }

  /**
   * Remove event listener
   */
  off<E extends EventType>(event: E, listener: EventListener<E>): void {
    this.listeners[event].delete(listener);
  }

  /**
   * Emit an event to all listeners
   */
  private emit<E extends EventType>(event: E, data: AutoSaveEvents[E]): void {
    this.listeners[event].forEach((listener) => listener(data));
  }

  /**
   * Get the timer handle for testing
   */
  getTimerHandle(): TimerHandle | null {
    return this.timerId;
  }

  /**
   * Check if a save is currently in progress
   */
  isSaving(): boolean {
    return this.savePromise !== null;
  }
}
