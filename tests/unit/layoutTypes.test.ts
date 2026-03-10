/**
 * Unit tests for Layout Types
 */

import { describe, it, expect } from "vitest";
import {
  isGridEligible,
  getAllSectionIds,
  isValidLayout,
  cloneLayout,
  layoutsAreEqual,
  DEFAULT_LAYOUT,
  GRID_ELIGIBLE_SECTIONS,
  SINGLE_ONLY_SECTIONS,
  Layout,
} from "../../src/types/layout";

describe("Layout Types", () => {
  describe("isGridEligible", () => {
    it("should return true for abilities", () => {
      expect(isGridEligible("abilities")).toBe(true);
    });

    it("should return true for specialAbilities", () => {
      expect(isGridEligible("specialAbilities")).toBe(true);
    });

    it("should return true for attacks", () => {
      expect(isGridEligible("attacks")).toBe(true);
    });

    it("should return true for cyphers", () => {
      expect(isGridEligible("cyphers")).toBe(true);
    });

    it("should return true for items", () => {
      expect(isGridEligible("items")).toBe(true);
    });

    it("should return true for background", () => {
      expect(isGridEligible("background")).toBe(true);
    });

    it("should return true for notes", () => {
      expect(isGridEligible("notes")).toBe(true);
    });

    it("should return false for basicInfo", () => {
      expect(isGridEligible("basicInfo")).toBe(false);
    });

    it("should return false for stats", () => {
      expect(isGridEligible("stats")).toBe(false);
    });

    it("should return false for recoveryDamage", () => {
      expect(isGridEligible("recoveryDamage")).toBe(false);
    });
  });

  describe("GRID_ELIGIBLE_SECTIONS", () => {
    it("should contain exactly 7 sections", () => {
      expect(GRID_ELIGIBLE_SECTIONS.length).toBe(7);
    });

    it("should not contain basicInfo, stats, or recoveryDamage", () => {
      expect(GRID_ELIGIBLE_SECTIONS).not.toContain("basicInfo");
      expect(GRID_ELIGIBLE_SECTIONS).not.toContain("stats");
      expect(GRID_ELIGIBLE_SECTIONS).not.toContain("recoveryDamage");
    });
  });

  describe("SINGLE_ONLY_SECTIONS", () => {
    it("should contain exactly 3 sections", () => {
      expect(SINGLE_ONLY_SECTIONS.length).toBe(3);
    });

    it("should contain basicInfo, stats, and recoveryDamage", () => {
      expect(SINGLE_ONLY_SECTIONS).toContain("basicInfo");
      expect(SINGLE_ONLY_SECTIONS).toContain("stats");
      expect(SINGLE_ONLY_SECTIONS).toContain("recoveryDamage");
    });
  });

  describe("getAllSectionIds", () => {
    it("should return all section IDs from a single-item layout", () => {
      const layout: Layout = [{ type: "single", id: "basicInfo" }];
      expect(getAllSectionIds(layout)).toEqual(["basicInfo"]);
    });

    it("should flatten grid items", () => {
      const layout: Layout = [{ type: "grid", items: ["abilities", "attacks"] }];
      expect(getAllSectionIds(layout)).toEqual(["abilities", "attacks"]);
    });

    it("should return all section IDs from a mixed layout", () => {
      const layout: Layout = [
        { type: "single", id: "basicInfo" },
        { type: "grid", items: ["abilities", "attacks"] },
        { type: "single", id: "notes" },
      ];
      expect(getAllSectionIds(layout)).toEqual(["basicInfo", "abilities", "attacks", "notes"]);
    });

    it("should return all 10 sections from default layout", () => {
      const ids = getAllSectionIds(DEFAULT_LAYOUT);
      expect(ids.length).toBe(10);
    });
  });

  describe("isValidLayout", () => {
    it("should return true for default layout", () => {
      expect(isValidLayout(DEFAULT_LAYOUT)).toBe(true);
    });

    it("should return true for a valid all-single layout", () => {
      const layout: Layout = [
        { type: "single", id: "basicInfo" },
        { type: "single", id: "stats" },
        { type: "single", id: "recoveryDamage" },
        { type: "single", id: "abilities" },
        { type: "single", id: "specialAbilities" },
        { type: "single", id: "attacks" },
        { type: "single", id: "cyphers" },
        { type: "single", id: "items" },
        { type: "single", id: "background" },
        { type: "single", id: "notes" },
      ];
      expect(isValidLayout(layout)).toBe(true);
    });

    it("should return false for layout with missing section", () => {
      const layout: Layout = [
        { type: "single", id: "basicInfo" },
        { type: "single", id: "stats" },
        { type: "single", id: "recoveryDamage" },
        { type: "single", id: "abilities" },
        { type: "single", id: "specialAbilities" },
        { type: "single", id: "attacks" },
        { type: "single", id: "cyphers" },
        { type: "single", id: "items" },
        { type: "single", id: "background" },
        // Missing notes
      ];
      expect(isValidLayout(layout)).toBe(false);
    });

    it("should return false for layout with duplicate section", () => {
      const layout: Layout = [
        { type: "single", id: "basicInfo" },
        { type: "single", id: "stats" },
        { type: "single", id: "recoveryDamage" },
        { type: "single", id: "abilities" },
        { type: "single", id: "specialAbilities" },
        { type: "single", id: "attacks" },
        { type: "single", id: "cyphers" },
        { type: "single", id: "items" },
        { type: "single", id: "background" },
        { type: "single", id: "background" }, // Duplicate
      ];
      expect(isValidLayout(layout)).toBe(false);
    });

    it("should return false for grid with non-eligible section", () => {
      const layout: Layout = [
        { type: "grid", items: ["basicInfo", "stats"] }, // basicInfo and stats are not grid-eligible
        { type: "single", id: "recoveryDamage" },
        { type: "single", id: "abilities" },
        { type: "single", id: "specialAbilities" },
        { type: "single", id: "attacks" },
        { type: "single", id: "cyphers" },
        { type: "single", id: "items" },
        { type: "single", id: "background" },
        { type: "single", id: "notes" },
      ];
      expect(isValidLayout(layout)).toBe(false);
    });

    it("should return true for valid grid with eligible sections", () => {
      const layout: Layout = [
        { type: "single", id: "basicInfo" },
        { type: "single", id: "stats" },
        { type: "single", id: "recoveryDamage" },
        { type: "grid", items: ["abilities", "specialAbilities"] },
        { type: "grid", items: ["attacks", "cyphers"] },
        { type: "grid", items: ["items", "background"] },
        { type: "single", id: "notes" },
      ];
      expect(isValidLayout(layout)).toBe(true);
    });

    it("should return false for empty layout", () => {
      expect(isValidLayout([])).toBe(false);
    });
  });

  describe("cloneLayout", () => {
    it("should create a deep copy of single items", () => {
      const original: Layout = [{ type: "single", id: "basicInfo" }];
      const cloned = cloneLayout(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[0]).not.toBe(original[0]);
    });

    it("should create a deep copy of grid items", () => {
      const original: Layout = [{ type: "grid", items: ["abilities", "attacks"] }];
      const cloned = cloneLayout(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[0]).not.toBe(original[0]);
      if (cloned[0].type === "grid" && original[0].type === "grid") {
        expect(cloned[0].items).not.toBe(original[0].items);
      }
    });

    it("should create a deep copy of default layout", () => {
      const cloned = cloneLayout(DEFAULT_LAYOUT);

      expect(cloned).toEqual(DEFAULT_LAYOUT);
      expect(cloned).not.toBe(DEFAULT_LAYOUT);
    });
  });

  describe("layoutsAreEqual", () => {
    it("should return true for identical layouts", () => {
      const layout1: Layout = [
        { type: "single", id: "basicInfo" },
        { type: "grid", items: ["abilities", "attacks"] },
      ];
      const layout2: Layout = [
        { type: "single", id: "basicInfo" },
        { type: "grid", items: ["abilities", "attacks"] },
      ];
      expect(layoutsAreEqual(layout1, layout2)).toBe(true);
    });

    it("should return false for layouts with different lengths", () => {
      const layout1: Layout = [{ type: "single", id: "basicInfo" }];
      const layout2: Layout = [
        { type: "single", id: "basicInfo" },
        { type: "single", id: "stats" },
      ];
      expect(layoutsAreEqual(layout1, layout2)).toBe(false);
    });

    it("should return false for layouts with different types at same position", () => {
      const layout1: Layout = [{ type: "single", id: "abilities" }];
      const layout2: Layout = [{ type: "grid", items: ["abilities", "attacks"] }];
      expect(layoutsAreEqual(layout1, layout2)).toBe(false);
    });

    it("should return false for single items with different IDs", () => {
      const layout1: Layout = [{ type: "single", id: "basicInfo" }];
      const layout2: Layout = [{ type: "single", id: "stats" }];
      expect(layoutsAreEqual(layout1, layout2)).toBe(false);
    });

    it("should return false for grid items with different first section", () => {
      const layout1: Layout = [{ type: "grid", items: ["abilities", "attacks"] }];
      const layout2: Layout = [{ type: "grid", items: ["specialAbilities", "attacks"] }];
      expect(layoutsAreEqual(layout1, layout2)).toBe(false);
    });

    it("should return false for grid items with different second section", () => {
      const layout1: Layout = [{ type: "grid", items: ["abilities", "attacks"] }];
      const layout2: Layout = [{ type: "grid", items: ["abilities", "cyphers"] }];
      expect(layoutsAreEqual(layout1, layout2)).toBe(false);
    });

    it("should return true for default layout compared to clone", () => {
      expect(layoutsAreEqual(DEFAULT_LAYOUT, cloneLayout(DEFAULT_LAYOUT))).toBe(true);
    });
  });

  describe("DEFAULT_LAYOUT", () => {
    it("should be a valid layout", () => {
      expect(isValidLayout(DEFAULT_LAYOUT)).toBe(true);
    });

    it("should have basicInfo first", () => {
      expect(DEFAULT_LAYOUT[0]).toEqual({ type: "single", id: "basicInfo" });
    });

    it("should have stats second", () => {
      expect(DEFAULT_LAYOUT[1]).toEqual({ type: "single", id: "stats" });
    });

    it("should have recoveryDamage third", () => {
      expect(DEFAULT_LAYOUT[2]).toEqual({ type: "single", id: "recoveryDamage" });
    });

    it("should have specialAbilities and attacks in a grid", () => {
      const gridWithSpecialAbilitiesAndAttacks = DEFAULT_LAYOUT.find(
        (item) =>
          item.type === "grid" &&
          item.items.includes("specialAbilities") &&
          item.items.includes("attacks")
      );
      expect(gridWithSpecialAbilitiesAndAttacks).toBeDefined();
    });

    it("should have background and notes in a grid", () => {
      const gridWithBackgroundAndNotes = DEFAULT_LAYOUT.find(
        (item) =>
          item.type === "grid" && item.items.includes("background") && item.items.includes("notes")
      );
      expect(gridWithBackgroundAndNotes).toBeDefined();
    });
  });
});
