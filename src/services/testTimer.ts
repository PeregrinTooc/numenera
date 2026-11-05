import type { ITimer, TimerHandle } from "@/services/timer";

/**
 * Test timer that can be controlled programmatically
 * Timers don't fire automatically - tests must call trigger()
 */
export class TestTimer implements ITimer {
  private timers = new Map<TimerHandle, () => void>();
  private nextHandle = 1;

  setTimeout(callback: () => void, _delay: number): TimerHandle {
    const handle = this.nextHandle++ as unknown as TimerHandle;
    this.timers.set(handle, callback);

    window.dispatchEvent(
      new CustomEvent("test-timer-scheduled", {
        detail: { handle },
      })
    );

    return handle;
  }

  clearTimeout(handle: TimerHandle): void {
    this.timers.delete(handle);
  }

  trigger(handle: TimerHandle): void {
    const callback = this.timers.get(handle);
    if (callback) {
      this.timers.delete(handle);
      callback();
    }
  }

  triggerAll(): void {
    const callbacks = Array.from(this.timers.values());
    this.timers.clear();
    callbacks.forEach((cb) => cb());
  }

  getPendingCount(): number {
    return this.timers.size;
  }

  clearAll(): void {
    this.timers.clear();
  }
}
