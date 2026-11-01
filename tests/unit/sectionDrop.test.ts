import { describe, it, expect } from "vitest";
import { dropZoneAt, resolveDropIntent } from "@/utils/sectionDrop";
import { DEFAULT_LAYOUT } from "@/types/layout";

const D = DEFAULT_LAYOUT;

const rect = { left: 0, top: 100, width: 400, height: 200 };

describe("dropZoneAt", () => {
  describe("on a wide layout", () => {
    it("is the top zone in the top quarter", () => {
      expect(dropZoneAt(rect, 10, 120, true)).toBe("top");
      expect(dropZoneAt(rect, 10, 149, true)).toBe("top");
    });

    it("is the left or right zone in the middle half, by the side of the width", () => {
      expect(dropZoneAt(rect, 100, 150, true)).toBe("left");
      expect(dropZoneAt(rect, 300, 200, true)).toBe("right");
    });

    it("is the bottom zone in the bottom quarter", () => {
      expect(dropZoneAt(rect, 10, 250, true)).toBe("bottom");
    });
  });

  describe("on a narrow layout", () => {
    it("splits the section into a top and a bottom half", () => {
      expect(dropZoneAt(rect, 300, 199, false)).toBe("top");
      expect(dropZoneAt(rect, 300, 200, false)).toBe("bottom");
    });
  });
});

describe("resolveDropIntent — gaps", () => {
  it("the top zone is the gap above the hovered section's row", () => {
    expect(resolveDropIntent(D, "items", "abilities", "top", true)).toEqual({
      kind: "gap",
      index: 3,
    });
  });

  it("the bottom zone is the gap below the hovered section's row", () => {
    expect(resolveDropIntent(D, "items", "abilities", "bottom", true)).toEqual({
      kind: "gap",
      index: 4,
    });
  });

  it("a paired section's gaps are above and below the whole pair", () => {
    expect(resolveDropIntent(D, "items", "attacks", "top", true)).toEqual({
      kind: "gap",
      index: 4,
    });
  });

  it("the bottom zone of the last row is the end of the sheet", () => {
    expect(resolveDropIntent(D, "abilities", "notes", "bottom", true)).toEqual({
      kind: "gap",
      index: 8,
    });
  });

  it("is null for a gap the drop would leave unchanged", () => {
    expect(resolveDropIntent(D, "cyphers", "items", "top", true)).toBeNull();
  });
});
