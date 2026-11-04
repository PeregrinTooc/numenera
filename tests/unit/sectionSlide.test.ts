import { describe, it, expect } from "vitest";
import { slideKeyframes } from "@/utils/sectionSlide";

describe("slideKeyframes", () => {
  it("starts a moved section at its old place and ends it at its new one", () => {
    expect(slideKeyframes({ left: 0, top: 100 }, { left: 400, top: 300 })).toEqual([
      { transform: "translate(-400px, -200px)" },
      { transform: "none" },
    ]);
  });

  it("returns null for a section that did not move", () => {
    expect(slideKeyframes({ left: 10, top: 20 }, { left: 10, top: 20 })).toBeNull();
  });

  it("ignores sub-pixel layout noise", () => {
    expect(slideKeyframes({ left: 10.2, top: 20 }, { left: 10, top: 20.4 })).toBeNull();
  });

  it("slides a section that only moved sideways", () => {
    expect(slideKeyframes({ left: 0, top: 50 }, { left: 400, top: 50 })?.[0]).toEqual({
      transform: "translate(-400px, 0px)",
    });
  });
});
