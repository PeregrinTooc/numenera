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

/** Whether any section `imported` names would show a different column count than in `current`. */
export function columnChoicesDiffer(imported: SectionColumns, current: SectionColumns): boolean {
  return CARD_SECTION_IDS.some(
    (id) => imported[id] !== undefined && columnsFor(imported, id) !== columnsFor(current, id)
  );
}

/** A copy of `columns` with every choice `choices` names applied. */
export function withColumnChoices(
  columns: SectionColumns,
  choices: SectionColumns
): SectionColumns {
  return CARD_SECTION_IDS.reduce((next, id) => {
    const count = choices[id];
    return count === undefined ? next : withColumns(next, id, count);
  }, columns);
}

function isCardSectionKey(key: string): key is CardSectionId {
  return (CARD_SECTION_IDS as readonly string[]).includes(key);
}

export function isCardSection(id: SectionId): id is CardSectionId {
  return isCardSectionKey(id);
}

function isMap(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isColumnCount(count: unknown): count is ColumnCount {
  return count === 1 || count === 2;
}

/**
 * True for a plain object whose keys are card section ids and whose values
 * are 1 or 2, so an import can warn when any entry is dropped.
 */
export function isValidSectionColumns(value: unknown): value is SectionColumns {
  return (
    isMap(value) &&
    Object.entries(value).every(([key, count]) => isCardSectionKey(key) && isColumnCount(count))
  );
}

/**
 * The valid card section choices in a map read from storage or an imported
 * file, so a section this version does not know, or a bad count, costs only
 * its own entry. Undefined when `value` is not a map at all.
 */
export function knownSectionColumns(value: unknown): SectionColumns | undefined {
  if (!isMap(value)) return undefined;
  return CARD_SECTION_IDS.reduce<SectionColumns>((known, id) => {
    const count = value[id];
    return isColumnCount(count) ? { ...known, [id]: count } : known;
  }, {});
}
