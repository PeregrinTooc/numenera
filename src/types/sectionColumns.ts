/**
 * Column choices for card sections.
 *
 * A card section lays its cards out in one or two columns. Only choices that
 * differ from the default are stored, next to the layout (see layoutStorage).
 */

import type { SectionId } from "@/types/layout";

export const CARD_SECTION_IDS = [
  "abilities",
  "specialAbilities",
  "attacks",
  "cyphers",
  "items",
] as const;

export type CardSectionId = (typeof CARD_SECTION_IDS)[number];

export type ColumnCount = 1 | 2;

export type SectionColumns = Partial<Record<CardSectionId, ColumnCount>>;

/**
 * Sections that split into two columns on a wide screen default to two, the
 * others to one.
 */
export const DEFAULT_SECTION_COLUMNS: Readonly<Record<CardSectionId, ColumnCount>> = {
  abilities: 2,
  specialAbilities: 1,
  attacks: 1,
  cyphers: 2,
  items: 2,
};

export function columnsFor(columns: SectionColumns, id: CardSectionId): ColumnCount {
  return columns[id] ?? DEFAULT_SECTION_COLUMNS[id];
}

/**
 * A copy of `columns` with `id` set to `count`. A choice equal to the
 * default is removed rather than stored.
 */
export function withColumns(
  columns: SectionColumns,
  id: CardSectionId,
  count: ColumnCount
): SectionColumns {
  const next: SectionColumns = { ...columns };
  if (count === DEFAULT_SECTION_COLUMNS[id]) {
    delete next[id];
  } else {
    next[id] = count;
  }
  return next;
}

function isCardSectionKey(key: string): key is CardSectionId {
  return (CARD_SECTION_IDS as readonly string[]).includes(key);
}

export function isCardSection(id: SectionId): id is CardSectionId {
  return isCardSectionKey(id);
}

/**
 * True for a plain object whose keys are card section ids and whose values
 * are 1 or 2. Used on values read from storage or an imported file.
 */
export function isValidSectionColumns(value: unknown): value is SectionColumns {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  return Object.entries(value).every(
    ([key, count]) => isCardSectionKey(key) && (count === 1 || count === 2)
  );
}
