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

  describe("out-of-range indices", () => {
    it("should return an unchanged copy when fromIndex is negative", () => {
      const array = ["A", "B", "C"];
      const result = reorderArray(array, -1, 1);
      expect(result).toEqual(["A", "B", "C"]);
    });

    it("should return an unchanged copy when fromIndex is past the end", () => {
      const array = ["A", "B", "C"];
      const result = reorderArray(array, 5, 1);
      expect(result).toEqual(["A", "B", "C"]);
    });

    it("should return an unchanged copy when toIndex is negative", () => {
      const array = ["A", "B", "C"];
      const result = reorderArray(array, 0, -1);
      expect(result).toEqual(["A", "B", "C"]);
    });

    it("should return an unchanged copy when toIndex is past the end", () => {
      const array = ["A", "B", "C"];
      const result = reorderArray(array, 0, 5);
      expect(result).toEqual(["A", "B", "C"]);
    });

    it("should not insert undefined into the array for an out-of-range fromIndex", () => {
      const array = ["A", "B", "C"];
      const result = reorderArray(array, 10, 1);
      expect(result).not.toContain(undefined);
      expect(result).toHaveLength(3);
    });
  });
});

describe("previewOrderEquals", () => {
  let previewOrderEquals: (current: number[] | null, newOrder: number[]) => boolean;

  beforeEach(async () => {
    const module = await import("../../src/components/helpers/DragDropBehavior.js");
    previewOrderEquals = module.previewOrderEquals;
  });

  it("returns false when current is null", () => {
    expect(previewOrderEquals(null, [0, 1, 2])).toBe(false);
  });

  it("returns true for identical orders", () => {
    expect(previewOrderEquals([0, 1, 2], [0, 1, 2])).toBe(true);
  });

  it("returns false for different orders of the same length", () => {
    expect(previewOrderEquals([0, 1, 2], [2, 1, 0])).toBe(false);
  });

  it("returns false when newOrder is longer than current", () => {
    expect(previewOrderEquals([0, 1], [0, 1, 2])).toBe(false);
  });

  it("returns false when newOrder is shorter than current", () => {
    expect(previewOrderEquals([0, 1, 2], [0, 1])).toBe(false);
  });
});
