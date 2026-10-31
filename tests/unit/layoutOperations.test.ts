import { describe, it, expect } from "vitest";
import { reorderLayout, mergeSectionsInLayout, splitGridInLayout } from "@/utils/layoutOperations";
import type { Layout } from "@/types/layout";

const layout: Layout = [
  { type: "single", id: "basicInfo" },
  { type: "single", id: "stats" },
  { type: "grid", items: ["abilities", "attacks"] },
  { type: "single", id: "cyphers" },
  { type: "single", id: "items" },
];

describe("layoutOperations", () => {
  describe("reorderLayout", () => {
    it("moves a single section before the target", () => {
      expect(reorderLayout(layout, "items", "stats")).toEqual([
        { type: "single", id: "basicInfo" },
        { type: "single", id: "items" },
        { type: "single", id: "stats" },
        { type: "grid", items: ["abilities", "attacks"] },
        { type: "single", id: "cyphers" },
      ]);
    });

    it("leaves the partner of a section taken out of a grid as a single", () => {
      expect(reorderLayout(layout, "abilities", "basicInfo")).toEqual([
        { type: "single", id: "abilities" },
        { type: "single", id: "basicInfo" },
        { type: "single", id: "stats" },
        { type: "single", id: "attacks" },
        { type: "single", id: "cyphers" },
        { type: "single", id: "items" },
      ]);
    });

    it("inserts before a grid when the target is one of its sections", () => {
      const result = reorderLayout(layout, "items", "attacks");
      expect(result?.[2]).toEqual({ type: "single", id: "items" });
      expect(result?.[3]).toEqual({ type: "grid", items: ["abilities", "attacks"] });
    });

    it("returns null when the source or target is not in the layout", () => {
      expect(reorderLayout(layout, "notes", "stats")).toBeNull();
      expect(reorderLayout(layout, "stats", "notes")).toBeNull();
    });

    it("does not mutate the input layout", () => {
      const before = globalThis.structuredClone(layout);
      reorderLayout(layout, "items", "stats");
      expect(layout).toEqual(before);
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
