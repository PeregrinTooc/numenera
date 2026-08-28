/**
 * Comparison View Preference Storage
 *
 * Handles persistence of the "Comparison View enabled" setting, separately
 * from character data, following the same dedicated-localStorage-module
 * pattern as layoutStorage.ts (a user preference, not character data, so
 * this deliberately does not go through storageFactory.ts).
 */

import { COMPARISON_VIEW_STORAGE_KEY } from "./storageConstants.js";

const DEFAULT_ENABLED = false;

/**
 * Save the Comparison View on/off preference to localStorage
 */
export function saveComparisonViewEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(COMPARISON_VIEW_STORAGE_KEY, String(enabled));
  } catch (error) {
    console.error("Failed to save comparison view preference:", error);
  }
}

/**
 * Load the Comparison View on/off preference from localStorage.
 *
 * Defaults to false (opt-in): Comparison View replaces the single-pane
 * version browsing flow when active, so defaulting it on would change
 * existing navigation behaviour for every user without them asking for it.
 */
export function loadComparisonViewEnabled(): boolean {
  try {
    const stored = localStorage.getItem(COMPARISON_VIEW_STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
    return DEFAULT_ENABLED;
  } catch (error) {
    console.error("Failed to load comparison view preference:", error);
    return DEFAULT_ENABLED;
  }
}
