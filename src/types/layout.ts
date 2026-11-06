/**
 * Header is NOT included as it's always fixed at the top
 */
export const SECTION_IDS = [
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
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const GRID_ELIGIBLE_SECTIONS: readonly SectionId[] = [
  "abilities",
  "specialAbilities",
  "attacks",
  "cyphers",
  "items",
  "background",
  "notes",
] as const;

export const SINGLE_ONLY_SECTIONS: readonly SectionId[] = [
  "basicInfo",
  "stats",
  "recoveryDamage",
] as const;

export interface SingleLayoutItem {
  type: "single";
  id: SectionId;
}

export interface GridLayoutItem {
  type: "grid";
  items: [SectionId, SectionId];
}

export type LayoutItem = SingleLayoutItem | GridLayoutItem;

export type Layout = LayoutItem[];

export function isGridEligible(sectionId: SectionId): boolean {
  return GRID_ELIGIBLE_SECTIONS.includes(sectionId);
}

export function getAllSectionIds(layout: Layout): SectionId[] {
  return layout.flatMap((item) => {
    if (item.type === "single") {
      return [item.id];
    }
    return item.items;
  });
}

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

  if (layoutSections.length !== allSections.length) {
    return false;
  }

  const sectionSet = new Set(layoutSections);
  if (sectionSet.size !== allSections.length) {
    return false;
  }

  for (const section of allSections) {
    if (!sectionSet.has(section)) {
      return false;
    }
  }

  for (const item of layout) {
    if (item.type === "grid") {
      if (!isGridEligible(item.items[0]) || !isGridEligible(item.items[1])) {
        return false;
      }
    }
  }

  return true;
}

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

export function cloneLayout(layout: Layout): Layout {
  return layout.map((item) => {
    if (item.type === "single") {
      return { type: "single", id: item.id };
    }
    return { type: "grid", items: [...item.items] as [SectionId, SectionId] };
  });
}

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

export function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value);
}
