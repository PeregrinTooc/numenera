import { Layout, DEFAULT_LAYOUT, isValidLayout, cloneLayout } from "@/types/layout";
import { SectionColumns, knownSectionColumns } from "@/types/sectionColumns";
import { LAYOUT_STORAGE_KEY, SECTION_COLUMNS_STORAGE_KEY } from "./storageConstants.js";

/** Write `value` as JSON; on failure log and continue, with `failureMessage`. */
function saveJson(key: string, value: unknown, failureMessage: string): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(failureMessage, error);
  }
}

/** Read the JSON stored under `key` through `parse`; any absent, invalid or unreadable value yields `fallback()`. */
function loadParsed<T>(
  key: string,
  parse: (value: unknown) => T | undefined,
  fallback: () => T,
  messages: { invalid: string; failed: string }
): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return fallback();
    }

    const parsed = parse(JSON.parse(stored));
    if (parsed === undefined) {
      console.warn(messages.invalid);
      return fallback();
    }

    return parsed;
  } catch (error) {
    console.error(messages.failed, error);
    return fallback();
  }
}

function parseLayout(value: unknown): Layout | undefined {
  const layout = value as Layout;
  return isValidLayout(layout) ? layout : undefined;
}

export function saveLayout(layout: Layout): void {
  // Continuing past a failure is fine: a lost layout is cosmetic - the sections visibly revert to the previous order.
  saveJson(LAYOUT_STORAGE_KEY, layout, "Failed to save layout:");
}

/**
 * @returns The stored layout, or the default layout if not found or invalid
 */
export function loadLayout(): Layout {
  return loadParsed(LAYOUT_STORAGE_KEY, parseLayout, () => cloneLayout(DEFAULT_LAYOUT), {
    invalid: "Invalid layout in storage, using default",
    failed: "Failed to load layout:",
  });
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
 * @returns true if a layout is stored in localStorage
 */
export function hasCustomLayout(): boolean {
  try {
    return localStorage.getItem(LAYOUT_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function getDefaultLayout(): Layout {
  return cloneLayout(DEFAULT_LAYOUT);
}

export function saveSectionColumns(columns: SectionColumns): void {
  // Continuing past a failure is fine: a lost column choice is cosmetic - the section visibly reverts to its default.
  saveJson(SECTION_COLUMNS_STORAGE_KEY, columns, "Failed to save section columns:");
}

/**
 * @returns The stored choices this version knows, or none (every section at its default) if not found or invalid
 */
export function loadSectionColumns(): SectionColumns {
  return loadParsed(SECTION_COLUMNS_STORAGE_KEY, knownSectionColumns, () => ({}), {
    invalid: "Invalid section columns in storage, using defaults",
    failed: "Failed to load section columns:",
  });
}
