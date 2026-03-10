/**
 * Unit tests for Layout Storage Service
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveLayout,
  loadLayout,
  resetLayout,
  hasCustomLayout,
  getDefaultLayout,
} from "../../src/storage/layoutStorage";
import { DEFAULT_LAYOUT, Layout, layoutsAreEqual } from "../../src/types/layout";
import { LAYOUT_STORAGE_KEY } from "../../src/storage/storageConstants";

describe("Layout Storage", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("saveLayout", () => {
    it("should save layout to localStorage", () => {
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

      saveLayout(layout);

      const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(layout);
    });

    it("should overwrite existing layout", () => {
      const layout1: Layout = [
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

      const layout2: Layout = [
        { type: "single", id: "notes" },
        { type: "single", id: "background" },
        { type: "single", id: "items" },
        { type: "single", id: "cyphers" },
        { type: "single", id: "attacks" },
        { type: "single", id: "specialAbilities" },
        { type: "single", id: "abilities" },
        { type: "single", id: "recoveryDamage" },
        { type: "single", id: "stats" },
        { type: "single", id: "basicInfo" },
      ];

      saveLayout(layout1);
      saveLayout(layout2);

      const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
      expect(JSON.parse(stored!)).toEqual(layout2);
    });

    it("should handle localStorage errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      saveLayout(DEFAULT_LAYOUT);

      expect(consoleSpy).toHaveBeenCalledWith("Failed to save layout:", expect.any(Error));
      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe("loadLayout", () => {
    it("should return default layout when nothing is stored", () => {
      const layout = loadLayout();
      expect(layoutsAreEqual(layout, DEFAULT_LAYOUT)).toBe(true);
    });

    it("should return stored layout when valid", () => {
      const customLayout: Layout = [
        { type: "single", id: "notes" },
        { type: "single", id: "background" },
        { type: "single", id: "items" },
        { type: "single", id: "cyphers" },
        { type: "single", id: "attacks" },
        { type: "single", id: "specialAbilities" },
        { type: "single", id: "abilities" },
        { type: "single", id: "recoveryDamage" },
        { type: "single", id: "stats" },
        { type: "single", id: "basicInfo" },
      ];

      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(customLayout));

      const layout = loadLayout();
      expect(layoutsAreEqual(layout, customLayout)).toBe(true);
    });

    it("should return default layout for invalid JSON", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      localStorage.setItem(LAYOUT_STORAGE_KEY, "invalid json{");

      const layout = loadLayout();

      expect(layoutsAreEqual(layout, DEFAULT_LAYOUT)).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should return default layout for invalid layout structure", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const invalidLayout = [{ type: "single", id: "basicInfo" }]; // Missing sections
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(invalidLayout));

      const layout = loadLayout();

      expect(layoutsAreEqual(layout, DEFAULT_LAYOUT)).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith("Invalid layout in storage, using default");
      consoleSpy.mockRestore();
    });

    it("should return a clone, not the original default", () => {
      const layout1 = loadLayout();
      const layout2 = loadLayout();

      expect(layout1).not.toBe(layout2);
    });
  });

  describe("resetLayout", () => {
    it("should remove layout from localStorage", () => {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(DEFAULT_LAYOUT));

      resetLayout();

      expect(localStorage.getItem(LAYOUT_STORAGE_KEY)).toBeNull();
    });

    it("should return default layout", () => {
      const layout = resetLayout();
      expect(layoutsAreEqual(layout, DEFAULT_LAYOUT)).toBe(true);
    });

    it("should handle localStorage errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("Storage error");
      });

      const layout = resetLayout();

      expect(consoleSpy).toHaveBeenCalledWith("Failed to clear layout:", expect.any(Error));
      expect(layoutsAreEqual(layout, DEFAULT_LAYOUT)).toBe(true);
      removeItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe("hasCustomLayout", () => {
    it("should return false when no layout is stored", () => {
      expect(hasCustomLayout()).toBe(false);
    });

    it("should return true when a layout is stored", () => {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(DEFAULT_LAYOUT));
      expect(hasCustomLayout()).toBe(true);
    });

    it("should handle localStorage errors gracefully", () => {
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage error");
      });

      expect(hasCustomLayout()).toBe(false);
      getItemSpy.mockRestore();
    });
  });

  describe("getDefaultLayout", () => {
    it("should return a clone of default layout", () => {
      const layout = getDefaultLayout();
      expect(layoutsAreEqual(layout, DEFAULT_LAYOUT)).toBe(true);
      expect(layout).not.toBe(DEFAULT_LAYOUT);
    });

    it("should return independent clones", () => {
      const layout1 = getDefaultLayout();
      const layout2 = getDefaultLayout();

      expect(layout1).not.toBe(layout2);
      expect(layoutsAreEqual(layout1, layout2)).toBe(true);
    });
  });
});
