/**
 * Layout Storage Service
 *
 * Handles persistence of layout preferences separately from character data.
 * Layout is stored in localStorage as a user preference.
 */

import { Layout, DEFAULT_LAYOUT, isValidLayout, cloneLayout } from "@/types/layout";
import { SectionColumns, isValidSectionColumns } from "@/types/sectionColumns";
import { LAYOUT_STORAGE_KEY, SECTION_COLUMNS_STORAGE_KEY } from "./storageConstants.js";

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
    // Continuing is fine: a lost layout is cosmetic - the sections visibly revert to the previous order.
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
 * Clears the stored layout and column choices and returns the default
 */
export function resetLayout(): Layout {
  try {
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    localStorage.removeItem(SECTION_COLUMNS_STORAGE_KEY);
  } catch (error) {
    // Continuing is fine: the caller gets the default layout, and a stale stored one only reverts visibly.
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

/**
 * Save the card sections' column choices (non-default values only)
 */
export function saveSectionColumns(columns: SectionColumns): void {
  try {
    localStorage.setItem(SECTION_COLUMNS_STORAGE_KEY, JSON.stringify(columns));
  } catch (error) {
    // Continuing is fine: a lost column choice is cosmetic - the section visibly reverts to its default.
    console.error("Failed to save section columns:", error);
  }
}

/**
 * Load the card sections' column choices
 *
 * @returns The stored choices, or none (every section at its default) if not found or invalid
 */
export function loadSectionColumns(): SectionColumns {
  try {
    const stored = localStorage.getItem(SECTION_COLUMNS_STORAGE_KEY);
    if (!stored) {
      return {};
    }

    const parsed: unknown = JSON.parse(stored);
    if (!isValidSectionColumns(parsed)) {
      console.warn("Invalid section columns in storage, using defaults");
      return {};
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load section columns:", error);
    return {};
  }
}
