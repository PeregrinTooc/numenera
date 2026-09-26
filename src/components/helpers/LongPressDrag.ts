/**
 * LongPressDrag - decides when a touch becomes a drag.
 *
 * A touch that stays within `moveTolerancePx` of where it started for
 * `holdMs` activates; a touch that moves further first is a scroll and is
 * ignored. DOM-free: the caller feeds it coordinates and reacts to callbacks.
 */

export const DEFAULT_HOLD_MS = 250;
export const DEFAULT_MOVE_TOLERANCE_PX = 10;

export interface LongPressDragOptions<Id extends string> {
  holdMs?: number;
  moveTolerancePx?: number;
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
      timer: ReturnType<typeof setTimeout>;
    }
  | { kind: "active"; id: Id };

export class LongPressDrag<Id extends string> {
  private state: LongPressState<Id> = { kind: "idle" };
  private readonly holdMs: number;
  private readonly moveTolerancePx: number;

  constructor(private readonly options: LongPressDragOptions<Id>) {
    this.holdMs = options.holdMs ?? DEFAULT_HOLD_MS;
    this.moveTolerancePx = options.moveTolerancePx ?? DEFAULT_MOVE_TOLERANCE_PX;
  }

  start(id: Id, x: number, y: number): void {
    const wasActive = this.isActive();
    this.reset();
    const timer = setTimeout(() => this.activate(id), this.holdMs);
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
      if (distance > this.moveTolerancePx) {
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

  /** Return to idle, clearing a pending hold timer. */
  private reset(): void {
    if (this.state.kind === "pending") {
      clearTimeout(this.state.timer);
    }
    this.state = { kind: "idle" };
  }
}
