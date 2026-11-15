import { describe, it, expect, vi, afterEach } from "vitest";
import { SystemClock } from "@/services/clock";

describe("SystemClock", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports the current epoch time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(123456);

    expect(new SystemClock().now()).toBe(123456);
  });

  it("fires a timer after its delay unless it was cleared", () => {
    vi.useFakeTimers();
    const clock = new SystemClock();
    const fired: string[] = [];
    clock.setTimeout(() => fired.push("kept"), 100);
    const cleared = clock.setTimeout(() => fired.push("cleared"), 100);
    clock.clearTimeout(cleared);

    vi.advanceTimersByTime(100);

    expect(fired).toEqual(["kept"]);
  });
});
