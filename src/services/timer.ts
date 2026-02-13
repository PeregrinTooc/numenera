/**
 * Timer abstraction for testability
 * Production uses real setTimeout/clearTimeout
 * Tests can use controllable test doubles
 */

export type TimerHandle = ReturnType<typeof setTimeout>;

export interface ITimer {
  setTimeout(callback: () => void, delay: number): TimerHandle;
  clearTimeout(handle: TimerHandle): void;
}

/**
 * Real timer implementation using browser APIs
 */
export class RealTimer implements ITimer {
  setTimeout(callback: () => void, delay: number): TimerHandle {
    return globalThis.setTimeout(callback, delay);
  }

  clearTimeout(handle: TimerHandle): void {
    globalThis.clearTimeout(handle);
  }
}

/**
 * Test timer that can be controlled programmatically
 * Timers don't fire automatically - tests must call trigger()
 */
export class TestTimer implements ITimer {
  private timers = new Map<TimerHandle, () => void>();
  private nextHandle = 1;

  setTimeout(callback: () => void, _delay: number): TimerHandle {
    const handle = this.nextHandle++ as TimerHandle;
    this.timers.set(handle, callback);

    // Emit event for test observability
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("test-timer-scheduled", {
          detail: { handle },
        })
      );
    }

    return handle;
  }

  clearTimeout(handle: TimerHandle): void {
    this.timers.delete(handle);
  }

  /**
   * Trigger a specific timer by handle
   */
  trigger(handle: TimerHandle): void {
    const callback = this.timers.get(handle);
    if (callback) {
      this.timers.delete(handle);
      callback();
    }
  }

  /**
   * Trigger all pending timers
   */
  triggerAll(): void {
    const callbacks = Array.from(this.timers.values());
    this.timers.clear();
    callbacks.forEach((cb) => cb());
  }

  /**
   * Get count of pending timers
   */
  getPendingCount(): number {
    return this.timers.size;
  }

  /**
   * Clear all pending timers without triggering
   */
  clearAll(): void {
    this.timers.clear();
  }
}
