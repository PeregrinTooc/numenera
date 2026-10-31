/**
 * Unit tests for Layout Types
 */

import { describe, it, expect } from "vitest";
import {
  isGridEligible,
  getAllSectionIds,
  isSectionId,
  DEFAULT_LAYOUT,
  GRID_ELIGIBLE_SECTIONS,
  SINGLE_ONLY_SECTIONS,
  Layout,
} from "@/types/layout";

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

  describe("isSectionId", () => {
    it("accepts every layout section id and rejects anything else", () => {
      expect(isSectionId("cyphers")).toBe(true);
      expect(isSectionId("specialAbilities")).toBe(true);
      expect(isSectionId("Cyphers")).toBe(false);
      expect(isSectionId("")).toBe(false);
      expect(isSectionId("toString")).toBe(false);
    });
  });
});
