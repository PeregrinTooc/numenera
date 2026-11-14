import type { Clock, TimerHandle } from "@/services/clock";

/** 2026-01-15T10:00:00Z */
export const DEFAULT_START_MS = Date.UTC(2026, 0, 15, 10, 0, 0);

interface PendingTimer {
  handle: TimerHandle;
  dueAt: number;
  callback: () => void;
}

/** A clock that moves only when `advance` is called; timers fire from there and nowhere else. */
export class ManualClock implements Clock {
  private current: number;
  private nextHandle = 1;
  private pending: PendingTimer[] = [];

  constructor(startMs: number = DEFAULT_START_MS) {
    this.current = startMs;
  }

  now(): number {
    return this.current;
  }

  setTimeout(callback: () => void, delayMs: number): TimerHandle {
    const handle = this.nextHandle++;
    this.pending.push({ handle, dueAt: this.current + delayMs, callback });
    return handle;
  }

  clearTimeout(handle: TimerHandle): void {
    this.pending = this.pending.filter((timer) => timer.handle !== handle);
  }

  advance(ms: number): void {
    const target = this.current + ms;
    for (let timer = this.takeNextDue(target); timer; timer = this.takeNextDue(target)) {
      this.current = timer.dueAt;
      timer.callback();
    }
    this.current = target;
  }

  /** Removes and returns the earliest timer due by `target`; ties keep scheduling order. */
  private takeNextDue(target: number): PendingTimer | undefined {
    let next: PendingTimer | undefined;
    for (const timer of this.pending) {
      if (timer.dueAt <= target && (!next || timer.dueAt < next.dueAt)) {
        next = timer;
      }
    }
    if (next) {
      this.clearTimeout(next.handle);
    }
    return next;
  }
}
