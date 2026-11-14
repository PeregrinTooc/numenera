import { describe, it, expect } from "vitest";
import { ManualClock, DEFAULT_START_MS } from "@/services/manualClock";

describe("ManualClock", () => {
  it("starts at the default time and only moves when advanced", () => {
    const clock = new ManualClock();

    expect(clock.now()).toBe(DEFAULT_START_MS);
    clock.advance(250);
    expect(clock.now()).toBe(DEFAULT_START_MS + 250);
  });

  it("can start at a given time", () => {
    expect(new ManualClock(1000).now()).toBe(1000);
  });

  it("does not fire a timer before it is due", () => {
    const clock = new ManualClock();
    const fired: string[] = [];
    clock.setTimeout(() => fired.push("a"), 100);

    clock.advance(99);
    expect(fired).toEqual([]);

    clock.advance(1);
    expect(fired).toEqual(["a"]);
  });

  it("fires a timer only once", () => {
    const clock = new ManualClock();
    let count = 0;
    clock.setTimeout(() => count++, 10);

    clock.advance(100);
    clock.advance(100);

    expect(count).toBe(1);
  });

  it("fires timers in due order, ties in scheduling order", () => {
    const clock = new ManualClock();
    const fired: string[] = [];
    clock.setTimeout(() => fired.push("late"), 200);
    clock.setTimeout(() => fired.push("first-tie"), 100);
    clock.setTimeout(() => fired.push("second-tie"), 100);

    clock.advance(500);

    expect(fired).toEqual(["first-tie", "second-tie", "late"]);
  });

  it("reports each timer's due time from now() while it runs", () => {
    const clock = new ManualClock(0);
    const seen: number[] = [];
    clock.setTimeout(() => seen.push(clock.now()), 100);
    clock.setTimeout(() => seen.push(clock.now()), 300);

    clock.advance(1000);

    expect(seen).toEqual([100, 300]);
    expect(clock.now()).toBe(1000);
  });

  it("does not fire a cleared timer", () => {
    const clock = new ManualClock();
    let fired = false;
    const handle = clock.setTimeout(() => (fired = true), 100);

    clock.clearTimeout(handle);
    clock.advance(200);

    expect(fired).toBe(false);
  });

  it("fires a timer scheduled by a callback within the same advance when due inside it", () => {
    const clock = new ManualClock(0);
    const seen: number[] = [];
    clock.setTimeout(() => {
      seen.push(clock.now());
      clock.setTimeout(() => seen.push(clock.now()), 50);
    }, 100);

    clock.advance(200);

    expect(seen).toEqual([100, 150]);
  });

  it("leaves a timer scheduled by a callback pending when it is due after the window", () => {
    const clock = new ManualClock(0);
    const seen: number[] = [];
    clock.setTimeout(() => clock.setTimeout(() => seen.push(clock.now()), 500), 100);

    clock.advance(200);
    expect(seen).toEqual([]);

    clock.advance(400);
    expect(seen).toEqual([600]);
  });

  it("lets a callback cancel a later timer", () => {
    const clock = new ManualClock();
    let fired = false;
    const later = clock.setTimeout(() => (fired = true), 200);
    clock.setTimeout(() => clock.clearTimeout(later), 100);

    clock.advance(300);

    expect(fired).toBe(false);
  });
});
