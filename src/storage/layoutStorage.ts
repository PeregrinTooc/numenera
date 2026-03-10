/**
 * Layout Storage Service
 *
 * Handles persistence of layout preferences separately from character data.
 * Layout is stored in localStorage as a user preference.
 */

import { Layout, DEFAULT_LAYOUT, isValidLayout, cloneLayout } from "../types/layout.js";
import { LAYOUT_STORAGE_KEY } from "./storageConstants.js";

/**
 * Save layout to localStorage
 *
 * @param layout - The layout configuration to save
 */
export function saveLayout(layout: Layout): void {
  try {
    const serialized = JSON.stringify(layout);
    localStorage.setItem(LAYOUT_STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Failed to save layout:", error);
  }
}

/**
 * Load layout from localStorage
 *
 * @returns The stored layout, or the default layout if not found or invalid
 */
export function loadLayout(): Layout {
  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!stored) {
      return cloneLayout(DEFAULT_LAYOUT);
    }

    const parsed = JSON.parse(stored) as Layout;

    // Validate the loaded layout
    if (!isValidLayout(parsed)) {
      console.warn("Invalid layout in storage, using default");
      return cloneLayout(DEFAULT_LAYOUT);
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load layout:", error);
    return cloneLayout(DEFAULT_LAYOUT);
  }
}

/**
 * Reset layout to default
 * Clears the stored layout and returns the default
 */
export function resetLayout(): Layout {
  try {
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear layout:", error);
  }
  return cloneLayout(DEFAULT_LAYOUT);
}

/**
 * Check if a custom layout is stored
 *
 * @returns true if a layout is stored in localStorage
 */
export function hasCustomLayout(): boolean {
  try {
    return localStorage.getItem(LAYOUT_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Get the default layout (returns a clone to prevent mutation)
 */
export function getDefaultLayout(): Layout {
  return cloneLayout(DEFAULT_LAYOUT);
}
