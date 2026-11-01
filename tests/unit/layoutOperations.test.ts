import { describe, it, expect } from "vitest";
import {
  applyDrop,
  rowIndexOf,
  mergeSectionsInLayout,
  splitGridInLayout,
} from "@/utils/layoutOperations";
import { DEFAULT_LAYOUT, type Layout, type LayoutItem, type SectionId } from "@/types/layout";

const D = DEFAULT_LAYOUT;
const s = (id: SectionId): LayoutItem => ({ type: "single", id });
const g = (left: SectionId, right: SectionId): LayoutItem => ({
  type: "grid",
  items: [left, right],
});

const layout: Layout = [
  { type: "single", id: "basicInfo" },
  { type: "single", id: "stats" },
  { type: "grid", items: ["abilities", "attacks"] },
  { type: "single", id: "cyphers" },
  { type: "single", id: "items" },
];

describe("layoutOperations", () => {
  describe("applyDrop — gap", () => {
    it("moves a single section into the gap before a row", () => {
      expect(applyDrop(D, "cyphers", { kind: "gap", index: 3 })).toEqual([
        s("basicInfo"),
        s("stats"),
        s("recoveryDamage"),
        s("cyphers"),
        s("abilities"),
        g("specialAbilities", "attacks"),
        s("items"),
        g("background", "notes"),
      ]);
    });

    it("moves a section to the end of the sheet", () => {
      const result = applyDrop(D, "abilities", { kind: "gap", index: 8 });
      expect(result?.[result.length - 1]).toEqual(s("abilities"));
    });

    it("leaves the partner of a section taken out of a pair as a single in place", () => {
      expect(applyDrop(D, "attacks", { kind: "gap", index: 0 })).toEqual([
        s("attacks"),
        s("basicInfo"),
        s("stats"),
        s("recoveryDamage"),
        s("abilities"),
        s("specialAbilities"),
        s("cyphers"),
        s("items"),
        g("background", "notes"),
      ]);
    });

    it("returns null for the gaps directly above and below the source's own row", () => {
      expect(applyDrop(D, "cyphers", { kind: "gap", index: 5 })).toBeNull();
      expect(applyDrop(D, "cyphers", { kind: "gap", index: 6 })).toBeNull();
    });

    it("returns null when the source is not in the layout", () => {
      expect(applyDrop(layout, "notes", { kind: "gap", index: 0 })).toBeNull();
    });

    it("does not mutate the input layout", () => {
      const before = globalThis.structuredClone(D);
      applyDrop(D, "cyphers", { kind: "gap", index: 3 });
      expect(D).toEqual(before);
    });
  });

  describe("rowIndexOf", () => {
    it("finds a single section's row and a paired section's row", () => {
      expect(rowIndexOf(D, "abilities")).toBe(3);
      expect(rowIndexOf(D, "notes")).toBe(7);
    });

    it("returns -1 for a section not in the layout", () => {
      expect(rowIndexOf(layout, "notes")).toBe(-1);
    });
  });

  describe("mergeSectionsInLayout", () => {
    it("merges two single grid-eligible sections at the earlier position", () => {
      expect(mergeSectionsInLayout(layout, "items", "cyphers")).toEqual([
        { type: "single", id: "basicInfo" },
        { type: "single", id: "stats" },
        { type: "grid", items: ["abilities", "attacks"] },
        { type: "grid", items: ["items", "cyphers"] },
      ]);
    });

    it("returns null when a section is not grid-eligible", () => {
      expect(mergeSectionsInLayout(layout, "stats", "cyphers")).toBeNull();
    });

    it("returns null when a section is not a single in the layout", () => {
      expect(mergeSectionsInLayout(layout, "abilities", "cyphers")).toBeNull();
    });
  });

  describe("splitGridInLayout", () => {
    it("replaces the grid with its two sections as singles", () => {
      expect(splitGridInLayout(layout, "attacks")).toEqual([
        { type: "single", id: "basicInfo" },
        { type: "single", id: "stats" },
        { type: "single", id: "abilities" },
        { type: "single", id: "attacks" },
        { type: "single", id: "cyphers" },
        { type: "single", id: "items" },
      ]);
    });

    it("returns an equal copy when the section is in no grid", () => {
      const result = splitGridInLayout(layout, "stats");
      expect(result).toEqual(layout);
      expect(result).not.toBe(layout);
    });
  });
});
