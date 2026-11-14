export type TimerHandle = number;

export interface Clock {
  /** Current time in epoch milliseconds. */
  now(): number;
  setTimeout(callback: () => void, delayMs: number): TimerHandle;
  clearTimeout(handle: TimerHandle): void;
}

/** The only place in the app that reads the real time or starts a real timer. */
export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }

  setTimeout(callback: () => void, delayMs: number): TimerHandle {
    return window.setTimeout(callback, delayMs);
  }

  clearTimeout(handle: TimerHandle): void {
    window.clearTimeout(handle);
  }
}
