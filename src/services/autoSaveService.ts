/**
 * AutoSaveService handles debounced auto-saving of character data
 * Emits events for save lifecycle: save-requested, save-completed, save-error
 */

import type { ITimer, TimerHandle } from "./timer.js";
import { RealTimer } from "./timer.js";

type SaveCallback = () => Promise<void>;
type EventType = "save-requested" | "save-completed" | "save-error";
type EventListener = (event: any) => void;

export class AutoSaveService {
  private saveCallback: SaveCallback;
  private debounceMs: number;
  private timer: ITimer;
  private timerId: TimerHandle | null = null;
  private listeners: Map<EventType, Set<EventListener>> = new Map();
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
  async flush(): Promise<void> {
    // Clear any pending timer
    if (this.timerId !== null) {
      this.timer.clearTimeout(this.timerId);
      this.timerId = null;
    }

    // If a save is in progress, wait for it
    if (this.savePromise) {
      await this.savePromise;
    } else {
      // Otherwise perform a save now
      await this.performSave();
    }
  }

  /**
   * Add event listener
   */
  on(event: EventType, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  /**
   * Remove event listener
   */
  off(event: EventType, listener: EventListener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  /**
   * Emit an event to all listeners
   */
  private emit(event: EventType, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data));
    }
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
