/**
 * DragDropBehavior - Utility functions for drag-and-drop reordering
 *
 * This module provides reusable drag-drop functionality for card components.
 */

/**
 * Reorders an array by moving an item from one index to another.
 * Returns a new array without mutating the original.
 *
 * @param array - The array to reorder
 * @param fromIndex - The index of the item to move
 * @param toIndex - The target index where the item should be placed
 * @returns A new array with the item moved to the new position
 */
export function reorderArray<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  // Return copy if no change needed, or if either index is out of range -
  // an out-of-range fromIndex would otherwise splice `undefined` into the array.
  const isInRange = (index: number): boolean => index >= 0 && index < array.length;
  if (fromIndex === toIndex || !isInRange(fromIndex) || !isInRange(toIndex)) {
    return [...array];
  }

  // Create a copy to avoid mutation
  const result = [...array];

  // Remove the item from its original position
  const [removed] = result.splice(fromIndex, 1);

  // Insert it at the new position
  result.splice(toIndex, 0, removed);

  return result;
}

/**
 * Compares a card-order preview against a candidate new order. Used during
 * drag-over to decide whether the preview needs to be re-applied.
 */
export function previewOrderEquals(current: number[] | null, newOrder: number[]): boolean {
  if (!current) return false;
  if (current.length !== newOrder.length) return false;
  return current.every((val, i) => val === newOrder[i]);
}
