/**
 * Unit tests for the Comparison View preference storage
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveComparisonViewEnabled,
  loadComparisonViewEnabled,
} from "../../src/storage/comparisonViewPreference";
import { COMPARISON_VIEW_STORAGE_KEY } from "../../src/storage/storageConstants";

describe("Comparison View Preference", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("loadComparisonViewEnabled", () => {
    it("defaults to false when nothing is stored", () => {
      expect(loadComparisonViewEnabled()).toBe(false);
    });

    it("returns the stored value", () => {
      localStorage.setItem(COMPARISON_VIEW_STORAGE_KEY, "true");

      expect(loadComparisonViewEnabled()).toBe(true);
    });

    it("falls back to false for a corrupted stored value", () => {
      localStorage.setItem(COMPARISON_VIEW_STORAGE_KEY, "not-a-boolean");

      expect(loadComparisonViewEnabled()).toBe(false);
    });

    it("falls back to false when localStorage access throws", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("blocked");
      });

      expect(loadComparisonViewEnabled()).toBe(false);
    });
  });

  describe("saveComparisonViewEnabled", () => {
    it("persists true", () => {
      saveComparisonViewEnabled(true);

      expect(localStorage.getItem(COMPARISON_VIEW_STORAGE_KEY)).toBe("true");
    });

    it("persists false", () => {
      saveComparisonViewEnabled(true);
      saveComparisonViewEnabled(false);

      expect(localStorage.getItem(COMPARISON_VIEW_STORAGE_KEY)).toBe("false");
    });

    it("does not throw when localStorage access throws", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("blocked");
      });

      expect(() => saveComparisonViewEnabled(true)).not.toThrow();
    });
  });
});
