/**
 * LongPressDrag - decides when a touch becomes a drag.
 *
 * A touch that stays within `MOVE_TOLERANCE_PX` of where it started for
 * `HOLD_MS` activates; a touch that moves further first is a scroll and is
 * ignored. DOM-free: the caller feeds it coordinates and reacts to callbacks.
 */

import type { Clock, TimerHandle } from "@/services/clock";

const HOLD_MS = 250;
const MOVE_TOLERANCE_PX = 10;

export interface LongPressDragOptions<Id extends string> {
  onActivate: (id: Id) => void;
  onHover: (x: number, y: number) => void;
  onDrop: () => void;
  onAbort: () => void;
}

type LongPressState<Id extends string> =
  | { kind: "idle" }
  | {
      kind: "pending";
      id: Id;
      startX: number;
      startY: number;
      timer: TimerHandle;
    }
  | { kind: "active"; id: Id };

export class LongPressDrag<Id extends string> {
  private state: LongPressState<Id> = { kind: "idle" };

  constructor(
    private readonly options: LongPressDragOptions<Id>,
    private readonly clock: Clock
  ) {}

  start(id: Id, x: number, y: number): void {
    const wasActive = this.isActive();
    this.reset();
    const timer = this.clock.setTimeout(() => this.activate(id), HOLD_MS);
    this.state = { kind: "pending", id, startX: x, startY: y, timer };
    if (wasActive) {
      this.options.onAbort();
    }
  }

  isActive(): boolean {
    return this.state.kind === "active";
  }

  move(x: number, y: number): boolean {
    if (this.state.kind === "active") {
      this.options.onHover(x, y);
      return true;
    }
    if (this.state.kind === "pending") {
      const distance = Math.hypot(x - this.state.startX, y - this.state.startY);
      if (distance > MOVE_TOLERANCE_PX) {
        this.reset();
      }
    }
    return false;
  }

  end(): void {
    const wasActive = this.isActive();
    this.reset();
    if (wasActive) {
      this.options.onDrop();
    }
  }

  cancel(): void {
    const wasActive = this.isActive();
    this.reset();
    if (wasActive) {
      this.options.onAbort();
    }
  }

  private activate(id: Id): void {
    this.state = { kind: "active", id };
    this.options.onActivate(id);
  }

  private reset(): void {
    if (this.state.kind === "pending") {
      this.clock.clearTimeout(this.state.timer);
    }
    this.state = { kind: "idle" };
  }
}
