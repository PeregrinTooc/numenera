/**
 * Layout Types Unit Tests
 *
 * Tests for layout type utilities including fixed section detection.
 */

import { describe, it, expect } from "vitest";
import {
  isFixedSection,
  isGridEligible,
  isValidLayout,
  getAllSectionIds,
  cloneLayout,
  layoutsAreEqual,
  FIXED_SECTIONS,
  GRID_ELIGIBLE_SECTIONS,
  SINGLE_ONLY_SECTIONS,
  DEFAULT_LAYOUT,
  type SectionId,
  type Layout,
} from "../../src/types/layout.js";

describe("Layout Types", () => {
  describe("isFixedSection", () => {
    it("should return true for basicInfo section", () => {
      expect(isFixedSection("basicInfo")).toBe(true);
    });

    it("should return false for non-fixed sections", () => {
      const nonFixedSections: SectionId[] = [
        "stats",
        "recoveryDamage",
        "abilities",
        "specialAbilities",
        "attacks",
        "cyphers",
        "items",
        "background",
        "notes",
      ];

      for (const section of nonFixedSections) {
        expect(isFixedSection(section)).toBe(false);
      }
    });

    it("should have basicInfo as the only fixed section", () => {
      expect(FIXED_SECTIONS).toEqual(["basicInfo"]);
    });
  });

  describe("isGridEligible", () => {
    it("should return true for grid-eligible sections", () => {
      const gridEligible: SectionId[] = [
        "abilities",
        "specialAbilities",
        "attacks",
        "cyphers",
        "items",
        "background",
        "notes",
      ];

      for (const section of gridEligible) {
        expect(isGridEligible(section)).toBe(true);
      }
    });

    it("should return false for single-only sections", () => {
      const singleOnly: SectionId[] = ["basicInfo", "stats", "recoveryDamage"];

      for (const section of singleOnly) {
        expect(isGridEligible(section)).toBe(false);
      }
    });
  });

  describe("SECTION_CONSTANTS", () => {
    it("should have non-overlapping GRID_ELIGIBLE and SINGLE_ONLY sections", () => {
      const overlap = GRID_ELIGIBLE_SECTIONS.filter((s) =>
        SINGLE_ONLY_SECTIONS.includes(s as SectionId)
      );
      expect(overlap).toHaveLength(0);
    });

    it("should cover all section types between GRID_ELIGIBLE and SINGLE_ONLY", () => {
      const allSections = [...GRID_ELIGIBLE_SECTIONS, ...SINGLE_ONLY_SECTIONS];
      expect(allSections).toHaveLength(10);
    });

    it("should have FIXED_SECTIONS as subset of SINGLE_ONLY_SECTIONS", () => {
      for (const fixed of FIXED_SECTIONS) {
        expect(SINGLE_ONLY_SECTIONS).toContain(fixed);
      }
    });
  });

  describe("isValidLayout", () => {
    it("should return true for valid default layout", () => {
      expect(isValidLayout(DEFAULT_LAYOUT)).toBe(true);
    });

    it("should return false for layout missing sections", () => {
      const incomplete: Layout = [
        { type: "single", id: "basicInfo" },
        { type: "single", id: "stats" },
      ];
      expect(isValidLayout(incomplete)).toBe(false);
    });

    it("should return false for layout with duplicate sections", () => {
      const withDuplicates: Layout = [
        { type: "single", id: "basicInfo" },
        { type: "single", id: "basicInfo" }, // duplicate
        { type: "single", id: "stats" },
        { type: "single", id: "recoveryDamage" },
        { type: "single", id: "abilities" },
        { type: "single", id: "specialAbilities" },
        { type: "single", id: "attacks" },
        { type: "single", id: "cyphers" },
        { type: "single", id: "items" },
        { type: "single", id: "background" },
      ];
      expect(isValidLayout(withDuplicates)).toBe(false);
    });

    it("should return false for layout with non-eligible sections in grid", () => {
      const invalidGrid: Layout = [
        { type: "grid", items: ["basicInfo", "stats"] }, // both non-eligible
        { type: "single", id: "recoveryDamage" },
        { type: "single", id: "abilities" },
        { type: "single", id: "specialAbilities" },
        { type: "single", id: "attacks" },
        { type: "single", id: "cyphers" },
        { type: "single", id: "items" },
        { type: "single", id: "background" },
        { type: "single", id: "notes" },
      ];
      expect(isValidLayout(invalidGrid)).toBe(false);
    });

    it("should return true for layout with valid grid", () => {
      const validWithGrid: Layout = [
        { type: "single", id: "basicInfo" },
        { type: "single", id: "stats" },
        { type: "single", id: "recoveryDamage" },
        { type: "grid", items: ["abilities", "specialAbilities"] },
        { type: "single", id: "attacks" },
        { type: "single", id: "cyphers" },
        { type: "single", id: "items" },
        { type: "grid", items: ["background", "notes"] },
      ];
      expect(isValidLayout(validWithGrid)).toBe(true);
    });
  });

  describe("getAllSectionIds", () => {
    it("should extract all section IDs from layout", () => {
      const ids = getAllSectionIds(DEFAULT_LAYOUT);
      expect(ids).toHaveLength(10);
      expect(ids).toContain("basicInfo");
      expect(ids).toContain("notes");
    });

    it("should flatten grid items", () => {
      const layout: Layout = [
        { type: "single", id: "basicInfo" },
        { type: "grid", items: ["abilities", "attacks"] },
      ];
      const ids = getAllSectionIds(layout);
      expect(ids).toEqual(["basicInfo", "abilities", "attacks"]);
    });
  });

  describe("cloneLayout", () => {
    it("should create a deep copy of layout", () => {
      const clone = cloneLayout(DEFAULT_LAYOUT);
      expect(clone).toEqual(DEFAULT_LAYOUT);
      expect(clone).not.toBe(DEFAULT_LAYOUT);
    });

    it("should not share references with original", () => {
      const original: Layout = [{ type: "grid", items: ["abilities", "attacks"] }];
      const clone = cloneLayout(original);

      // Modify clone
      if (clone[0].type === "grid") {
        clone[0].items[0] = "cyphers";
      }

      // Original should be unchanged
      if (original[0].type === "grid") {
        expect(original[0].items[0]).toBe("abilities");
      }
    });
  });

  describe("layoutsAreEqual", () => {
    it("should return true for identical layouts", () => {
      const clone = cloneLayout(DEFAULT_LAYOUT);
      expect(layoutsAreEqual(DEFAULT_LAYOUT, clone)).toBe(true);
    });

    it("should return false for different layouts", () => {
      const different: Layout = [
        { type: "single", id: "basicInfo" },
        { type: "single", id: "stats" },
        { type: "single", id: "recoveryDamage" },
        { type: "single", id: "cyphers" }, // Different order
        { type: "single", id: "abilities" },
        { type: "single", id: "specialAbilities" },
        { type: "single", id: "attacks" },
        { type: "single", id: "items" },
        { type: "single", id: "background" },
        { type: "single", id: "notes" },
      ];
      expect(layoutsAreEqual(DEFAULT_LAYOUT, different)).toBe(false);
    });

    it("should return false for layouts with different lengths", () => {
      const shorter: Layout = [{ type: "single", id: "basicInfo" }];
      expect(layoutsAreEqual(DEFAULT_LAYOUT, shorter)).toBe(false);
    });

    it("should return false when grid items differ", () => {
      const layout1: Layout = [{ type: "grid", items: ["abilities", "attacks"] }];
      const layout2: Layout = [{ type: "grid", items: ["attacks", "abilities"] }];
      expect(layoutsAreEqual(layout1, layout2)).toBe(false);
    });
  });
});