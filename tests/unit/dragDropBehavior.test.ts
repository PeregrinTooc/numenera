import { describe, it, expect, beforeEach } from "vitest";

/**
 * DragDropBehavior Unit Tests
 *
 * These tests verify the core drag-drop reordering logic
 * independent of DOM manipulation.
 */

// We'll test the reorder logic first, then expand to full drag behavior
describe("reorderArray", () => {
  // Import will fail until we create the module - that's TDD!
  let reorderArray: <T>(array: T[], fromIndex: number, toIndex: number) => T[];

  beforeEach(async () => {
    const module = await import("../../src/components/helpers/DragDropBehavior.js");
    reorderArray = module.reorderArray;
  });

  describe("moving items forward (higher index)", () => {
    it("should move item from first to last position", () => {
      const array = ["A", "B", "C"];
      const result = reorderArray(array, 0, 2);
      expect(result).toEqual(["B", "C", "A"]);
    });

    it("should move item from first to middle position", () => {
      const array = ["A", "B", "C"];
      const result = reorderArray(array, 0, 1);
      expect(result).toEqual(["B", "A", "C"]);
    });
  });

  describe("moving items backward (lower index)", () => {
    it("should move item from last to first position", () => {
      const array = ["A", "B", "C"];
      const result = reorderArray(array, 2, 0);
      expect(result).toEqual(["C", "A", "B"]);
    });

    it("should move item from last to middle position", () => {
      const array = ["A", "B", "C"];
      const result = reorderArray(array, 2, 1);
      expect(result).toEqual(["A", "C", "B"]);
    });

    it("should move item from middle to first position", () => {
      const array = ["A", "B", "C"];
      const result = reorderArray(array, 1, 0);
      expect(result).toEqual(["B", "A", "C"]);
    });
  });

  describe("edge cases", () => {
    it("should return same array when from equals to", () => {
      const array = ["A", "B", "C"];
      const result = reorderArray(array, 1, 1);
      expect(result).toEqual(["A", "B", "C"]);
    });

    it("should not mutate the original array", () => {
      const array = ["A", "B", "C"];
      const original = [...array];
      reorderArray(array, 0, 2);
      expect(array).toEqual(original);
    });

    it("should work with single element array", () => {
      const array = ["A"];
      const result = reorderArray(array, 0, 0);
      expect(result).toEqual(["A"]);
    });

    it("should work with two element array", () => {
      const array = ["A", "B"];
      const result = reorderArray(array, 0, 1);
      expect(result).toEqual(["B", "A"]);
    });

    it("should work with objects", () => {
      const array = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = reorderArray(array, 2, 0);
      expect(result).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }]);
    });
  });
});
