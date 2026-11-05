export type TimerHandle = ReturnType<typeof setTimeout>;

export interface ITimer {
  setTimeout(callback: () => void, delay: number): TimerHandle;
  clearTimeout(handle: TimerHandle): void;
}

export class RealTimer implements ITimer {
  setTimeout(callback: () => void, delay: number): TimerHandle {
    return globalThis.setTimeout(callback, delay);
  }

  clearTimeout(handle: TimerHandle): void {
    globalThis.clearTimeout(handle);
  }
}
