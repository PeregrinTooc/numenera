/**
 * Layout Types for Section Re-arrangement Feature
 *
 * This module defines the data model for customizable section layouts
 * in the character sheet.
 */

/**
 * Section identifiers for all rearrangeable sections
 * Header is NOT included as it's always fixed at the top
 */
export type SectionId =
  | "basicInfo"
  | "stats"
  | "recoveryDamage"
  | "abilities"
  | "specialAbilities"
  | "attacks"
  | "cyphers"
  | "items"
  | "background"
  | "notes";

/**
 * Sections that can be merged into a 2-column grid
 * These are "container" sections that work well side-by-side
 */
export const GRID_ELIGIBLE_SECTIONS: readonly SectionId[] = [
  "abilities",
  "specialAbilities",
  "attacks",
  "cyphers",
  "items",
  "background",
  "notes",
] as const;

/**
 * Sections that must remain in single-column layout
 * These are not eligible for grid merging
 */
export const SINGLE_ONLY_SECTIONS: readonly SectionId[] = [
  "basicInfo",
  "stats",
  "recoveryDamage",
] as const;

/**
 * A single section displayed in its own row
 */
export interface SingleLayoutItem {
  type: "single";
  id: SectionId;
}

/**
 * Two sections displayed side-by-side in a 2-column grid
 * Both sections must be grid-eligible
 */
export interface GridLayoutItem {
  type: "grid";
  items: [SectionId, SectionId];
}

/**
 * A layout item can be either a single section or a grid of two sections
 */
export type LayoutItem = SingleLayoutItem | GridLayoutItem;

/**
 * Complete layout configuration
 * An ordered array of layout items representing the section arrangement
 */
export type Layout = LayoutItem[];

/**
 * Check if a section is eligible for grid placement
 */
export function isGridEligible(sectionId: SectionId): boolean {
  return GRID_ELIGIBLE_SECTIONS.includes(sectionId);
}

/**
 * Get all section IDs from a layout (flattened)
 */
export function getAllSectionIds(layout: Layout): SectionId[] {
  return layout.flatMap((item) => {
    if (item.type === "single") {
      return [item.id];
    }
    return item.items;
  });
}

/**
 * Validate that a layout contains all required sections exactly once
 */
export function isValidLayout(layout: Layout): boolean {
  const allSections: SectionId[] = [
    "basicInfo",
    "stats",
    "recoveryDamage",
    "abilities",
    "specialAbilities",
    "attacks",
    "cyphers",
    "items",
    "background",
    "notes",
  ];

  const layoutSections = getAllSectionIds(layout);

  // Check that all sections are present exactly once
  if (layoutSections.length !== allSections.length) {
    return false;
  }

  const sectionSet = new Set(layoutSections);
  if (sectionSet.size !== allSections.length) {
    return false; // Duplicates exist
  }

  for (const section of allSections) {
    if (!sectionSet.has(section)) {
      return false; // Missing section
    }
  }

  // Check that grid items only contain grid-eligible sections
  for (const item of layout) {
    if (item.type === "grid") {
      if (!isGridEligible(item.items[0]) || !isGridEligible(item.items[1])) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Default layout configuration
 * This represents the standard layout before any customization
 */
export const DEFAULT_LAYOUT: Layout = [
  { type: "single", id: "basicInfo" },
  { type: "single", id: "stats" },
  { type: "single", id: "recoveryDamage" },
  { type: "single", id: "abilities" },
  { type: "grid", items: ["specialAbilities", "attacks"] },
  { type: "single", id: "cyphers" },
  { type: "single", id: "items" },
  { type: "grid", items: ["background", "notes"] },
];

/**
 * Create a deep copy of a layout
 */
export function cloneLayout(layout: Layout): Layout {
  return layout.map((item) => {
    if (item.type === "single") {
      return { type: "single", id: item.id };
    }
    return { type: "grid", items: [...item.items] as [SectionId, SectionId] };
  });
}

/**
 * Check if two layouts are equal
 */
export function layoutsAreEqual(layout1: Layout, layout2: Layout): boolean {
  if (layout1.length !== layout2.length) {
    return false;
  }

  for (let i = 0; i < layout1.length; i++) {
    const item1 = layout1[i];
    const item2 = layout2[i];

    if (item1.type !== item2.type) {
      return false;
    }

    if (item1.type === "single" && item2.type === "single") {
      if (item1.id !== item2.id) {
        return false;
      }
    } else if (item1.type === "grid" && item2.type === "grid") {
      if (item1.items[0] !== item2.items[0] || item1.items[1] !== item2.items[1]) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Human-readable section names for UI display
 * These map to i18n keys: layout.sections.{sectionId}
 */
export const SECTION_DISPLAY_NAMES: Record<SectionId, string> = {
  basicInfo: "Basic Info",
  stats: "Stats",
  recoveryDamage: "Recovery & Damage",
  abilities: "Abilities",
  specialAbilities: "Special Abilities",
  attacks: "Attacks",
  cyphers: "Cyphers",
  items: "Items",
  background: "Background",
  notes: "Notes",
};
