/**
 * AutoSaveService handles debounced auto-saving of character data
 * Emits events for save lifecycle: save-completed, save-error
 */

import type { Clock, TimerHandle } from "@/services/clock";

type SaveCallback = () => Promise<void>;

/** Payload of every event the service emits, keyed by event name. */
export interface AutoSaveEvents {
  "save-completed": { timestamp: number };
  "save-error": { error: unknown };
}

type EventType = keyof AutoSaveEvents;
type EventListener<E extends EventType> = (event: AutoSaveEvents[E]) => void;

export class AutoSaveService {
  private saveCallback: SaveCallback;
  private debounceMs: number;
  private clock: Clock;
  private timerId: TimerHandle | null = null;
  private listeners: { [E in EventType]: Set<EventListener<E>> } = {
    "save-completed": new Set(),
    "save-error": new Set(),
  };
  private savePromise: Promise<void> | null = null;

  constructor(saveCallback: SaveCallback, clock: Clock, debounceMs: number = 300) {
    this.saveCallback = saveCallback;
    this.debounceMs = debounceMs;
    this.clock = clock;
  }

  requestSave(): void {
    if (this.timerId !== null) {
      this.clock.clearTimeout(this.timerId);
    }

    this.timerId = this.clock.setTimeout(() => {
      this.performSave();
    }, this.debounceMs);
  }

  private async performSave(): Promise<void> {
    this.timerId = null;

    this.savePromise = this.saveCallback()
      .then(() => {
        const timestamp = this.clock.now();
        this.emit("save-completed", { timestamp });
        this.savePromise = null;
      })
      .catch((error) => {
        this.emit("save-error", { error });
        this.savePromise = null;
      });

    return this.savePromise;
  }

  flush(): Promise<void> {
    // A pending timer means there are unsaved changes: save them now.
    // Not awaited on purpose (unload handlers cannot await): the write is issued in this same task
    // (after the storage-singleton microtask), not after the debounce.
    if (this.timerId !== null) {
      this.clock.clearTimeout(this.timerId);
      return this.performSave();
    }

    return this.savePromise ?? Promise.resolve();
  }

  on<E extends EventType>(event: E, listener: EventListener<E>): void {
    this.listeners[event].add(listener);
  }

  private emit<E extends EventType>(event: E, data: AutoSaveEvents[E]): void {
    this.listeners[event].forEach((listener) => listener(data));
  }
}
