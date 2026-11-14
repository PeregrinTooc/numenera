import { describe, it, expect, vi } from "vitest";
import { LongPressDrag } from "@/components/helpers/LongPressDrag";
import { ManualClock } from "@/services/manualClock";

function createDrag() {
  const clock = new ManualClock();
  const onActivate = vi.fn();
  const onHover = vi.fn();
  const onDrop = vi.fn();
  const onAbort = vi.fn();
  const drag = new LongPressDrag<string>({ onActivate, onHover, onDrop, onAbort }, clock);
  return { drag, clock, onActivate, onHover, onDrop, onAbort };
}

describe("LongPressDrag", () => {
  it("activates once the touch has been held for 250ms", () => {
    const { drag, clock, onActivate } = createDrag();

    drag.start("cyphers", 100, 100);
    clock.advance(249);
    expect(onActivate).not.toHaveBeenCalled();
    expect(drag.isActive()).toBe(false);

    clock.advance(1);
    expect(onActivate).toHaveBeenCalledWith("cyphers");
    expect(drag.isActive()).toBe(true);
  });

  it("never activates when the touch moves more than 10px before the hold elapses", () => {
    const { drag, clock, onActivate } = createDrag();

    drag.start("cyphers", 100, 100);
    expect(drag.move(100, 111)).toBe(false);
    clock.advance(250);

    expect(onActivate).not.toHaveBeenCalled();
    expect(drag.isActive()).toBe(false);
  });

  it("still activates when the finger jitters within 10px during the hold", () => {
    const { drag, clock, onActivate } = createDrag();

    drag.start("cyphers", 100, 100);
    drag.move(106, 108); // distance 10
    clock.advance(250);

    expect(onActivate).toHaveBeenCalledWith("cyphers");
  });

  it("reports hover positions and asks to prevent scrolling once active", () => {
    const { drag, clock, onHover } = createDrag();

    drag.start("cyphers", 100, 100);
    clock.advance(250);

    expect(drag.move(100, 400)).toBe(true);
    expect(onHover).toHaveBeenCalledWith(100, 400);
  });

  it("does not ask to prevent scrolling while still pending", () => {
    const { drag, onHover } = createDrag();

    drag.start("cyphers", 100, 100);

    expect(drag.move(102, 101)).toBe(false);
    expect(onHover).not.toHaveBeenCalled();
  });

  it("drops when an active gesture ends, and returns to idle first", () => {
    const { drag, clock, onDrop } = createDrag();
    let activeDuringDrop: boolean | null = null;
    onDrop.mockImplementation(() => {
      activeDuringDrop = drag.isActive();
    });

    drag.start("cyphers", 100, 100);
    clock.advance(250);
    drag.end();

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(activeDuringDrop).toBe(false);
    expect(drag.isActive()).toBe(false);
  });

  it("a short tap ends before activation and never activates or drops", () => {
    const { drag, clock, onActivate, onDrop } = createDrag();

    drag.start("cyphers", 100, 100);
    clock.advance(100);
    drag.end();
    clock.advance(500);

    expect(onActivate).not.toHaveBeenCalled();
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("aborts when an active gesture is cancelled", () => {
    const { drag, clock, onAbort, onDrop } = createDrag();

    drag.start("cyphers", 100, 100);
    clock.advance(250);
    drag.cancel();

    expect(onAbort).toHaveBeenCalledTimes(1);
    expect(onDrop).not.toHaveBeenCalled();
    expect(drag.isActive()).toBe(false);
  });

  it("cancelling a pending gesture prevents activation without aborting", () => {
    const { drag, clock, onActivate, onAbort } = createDrag();

    drag.start("cyphers", 100, 100);
    drag.cancel();
    clock.advance(500);

    expect(onActivate).not.toHaveBeenCalled();
    expect(onAbort).not.toHaveBeenCalled();
  });

  it("starting a new gesture cancels the one in progress", () => {
    const { drag, clock, onActivate, onAbort } = createDrag();

    drag.start("cyphers", 100, 100);
    clock.advance(250);
    drag.start("abilities", 50, 50);

    expect(onAbort).toHaveBeenCalledTimes(1);
    expect(drag.isActive()).toBe(false);

    clock.advance(250);
    expect(onActivate).toHaveBeenLastCalledWith("abilities");
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it("a gesture started from onAbort is not clobbered by the start that aborted it", () => {
    const { drag, clock, onActivate, onAbort } = createDrag();
    onAbort.mockImplementationOnce(() => {
      drag.start("notes", 0, 0);
    });

    drag.start("cyphers", 100, 100);
    clock.advance(250);
    drag.start("abilities", 50, 50);
    clock.advance(250);

    expect(onActivate).toHaveBeenLastCalledWith("notes");
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it("ignores move, end and cancel when no gesture is in progress", () => {
    const { drag, onHover, onDrop, onAbort } = createDrag();

    expect(drag.move(10, 10)).toBe(false);
    drag.end();
    drag.cancel();

    expect(onHover).not.toHaveBeenCalled();
    expect(onDrop).not.toHaveBeenCalled();
    expect(onAbort).not.toHaveBeenCalled();
  });
});
