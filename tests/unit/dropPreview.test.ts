import { describe, it, expect } from "vitest";
import { describeDropPreview, rowPreviewClasses, sectionPreviewClasses } from "@/utils/dropPreview";
import { DEFAULT_LAYOUT } from "@/types/layout";

const D = DEFAULT_LAYOUT;

describe("describeDropPreview", () => {
  it("a gap previews a line before the row below it", () => {
    expect(describeDropPreview(D, "items", { kind: "gap", index: 3 })).toEqual({
      line: { kind: "row", rowIndex: 3, edge: "before" },
    });
  });

  it("the end of the sheet previews a line after the last row", () => {
    expect(describeDropPreview(D, "abilities", { kind: "gap", index: 8 })).toEqual({
      line: { kind: "row", rowIndex: 7, edge: "after" },
    });
  });

  it("pairing with a single section previews the ghost beside it on the chosen side", () => {
    expect(
      describeDropPreview(D, "cyphers", { kind: "pair", targetId: "items", side: "right" })
    ).toEqual({ ghost: { sectionId: "items", placement: "right" } });
  });

  it("pairing with a paired section from above previews it replaced and bumped below", () => {
    expect(
      describeDropPreview(D, "cyphers", { kind: "pair", targetId: "notes", side: "left" })
    ).toEqual({
      ghost: { sectionId: "notes", placement: "replace" },
      bump: { rowIndex: 7, edge: "below", sectionId: "notes" },
    });
  });

  it("pairing with a paired section from below previews the bump above", () => {
    expect(
      describeDropPreview(D, "items", { kind: "pair", targetId: "attacks", side: "right" })
    ).toEqual({
      ghost: { sectionId: "attacks", placement: "replace" },
      bump: { rowIndex: 4, edge: "above", sectionId: "attacks" },
    });
  });

  it("swapping with the own partner previews the ghost in the partner's slot, no bump", () => {
    expect(
      describeDropPreview(D, "attacks", {
        kind: "pair",
        targetId: "specialAbilities",
        side: "left",
      })
    ).toEqual({ ghost: { sectionId: "specialAbilities", placement: "replace" } });
  });

  it("breaking a stacked pair previews a line above its lower half", () => {
    expect(describeDropPreview(D, "cyphers", { kind: "breakPair", rowIndex: 7 })).toEqual({
      line: { kind: "section", sectionId: "notes", edge: "before" },
    });
  });
});

describe("rowPreviewClasses", () => {
  it("puts the line on the row it names, on the edge it names", () => {
    const preview = describeDropPreview(D, "abilities", { kind: "gap", index: 8 });
    expect(rowPreviewClasses(preview, 7)).toBe("drop-line-after");
    expect(rowPreviewClasses(preview, 6)).toBe("");
  });

  it("puts the bump on the pair's row", () => {
    const preview = describeDropPreview(D, "items", {
      kind: "pair",
      targetId: "attacks",
      side: "right",
    });
    expect(rowPreviewClasses(preview, 4)).toBe("drop-bump-above");
  });
});

describe("sectionPreviewClasses", () => {
  it("puts the ghost on the section it names", () => {
    const preview = describeDropPreview(D, "cyphers", {
      kind: "pair",
      targetId: "items",
      side: "left",
    });
    expect(sectionPreviewClasses(preview, "items")).toBe("drop-ghost-left");
    expect(sectionPreviewClasses(preview, "cyphers")).toBe("");
  });

  it("puts a stacked pair's seam line on its lower half", () => {
    const preview = describeDropPreview(D, "cyphers", { kind: "breakPair", rowIndex: 7 });
    expect(sectionPreviewClasses(preview, "notes")).toBe("drop-line-before");
  });
});
