import type { Character } from "@/types/character";
import {
  BASIC_INFO_FIELDS,
  COLLECTION_KEYS,
  RESOURCE_FIELDS,
  STAT_NAMES,
  TEXT_FIELDS,
  resourceDiffers,
  statPoolDiffers,
  textFieldDiffers,
} from "@/utils/characterFieldGroups";

const PREFIX = "versionHistory.changes";

type Category = "basicInfo" | "stats" | "resources" | "collections" | "textFields";

/** Categories whose changes collapse into one summary line; collections never combine. */
const COMBINED_KEYS: Partial<Record<Category, string>> = {
  basicInfo: `${PREFIX}.basicInfo.combined`,
  stats: `${PREFIX}.stats.combined`,
  resources: `${PREFIX}.resources.combined`,
  textFields: `${PREFIX}.textFields.combined`,
};

interface CategorizedChange {
  description: string;
  category: Category;
}

function summarize(changes: CategorizedChange[]): string[] {
  if (changes.length === 0) {
    return [];
  }

  const firstCategory = changes[0].category;
  const allSameCategory = changes.every((c) => c.category === firstCategory);
  const combined = COMBINED_KEYS[firstCategory];
  if (allSameCategory && changes.length > 1 && combined) {
    return [combined];
  }

  return changes.slice(0, 3).map((c) => c.description);
}

/**
 * Detects changes between two character versions and returns i18n key
 * strings describing what changed (e.g. "versionHistory.changes.basicInfo.name").
 * Callers translate these with `t()` — this stays a pure, dependency-free
 * util so it's trivially unit-testable.
 * Priority: Basic info > Stats > Resources > Collections > Text fields
 * Limits output to top 3 changes maximum
 */
export function detectChanges(oldChar: Character, newChar: Character): string[] {
  const changes: CategorizedChange[] = [];
  const add = (category: Category, descriptions: string[]): void => {
    descriptions.forEach((description) => changes.push({ description, category }));
  };

  add(
    "basicInfo",
    BASIC_INFO_FIELDS.filter((field) => oldChar[field] !== newChar[field]).map(
      (field) => `${PREFIX}.basicInfo.${field}`
    )
  );
  add(
    "stats",
    STAT_NAMES.filter((stat) => statPoolDiffers(oldChar, newChar, stat)).map(
      (stat) => `${PREFIX}.stats.${stat}`
    )
  );
  add(
    "resources",
    RESOURCE_FIELDS.filter((group) => resourceDiffers(oldChar, newChar, group)).map(
      (group) => `${PREFIX}.resources.${group.key}`
    )
  );
  add("collections", detectCollectionChanges(oldChar, newChar));
  add(
    "textFields",
    TEXT_FIELDS.filter((field) => textFieldDiffers(oldChar, newChar, field)).map(
      (field) => `${PREFIX}.textFields.${field}`
    )
  );

  return summarize(changes);
}

/**
 * Helper to detect changes in a collection (added/removed/modified)
 */
function detectCollectionChange(
  oldCollection: unknown[],
  newCollection: unknown[],
  itemKey: string
): string | null {
  if (oldCollection.length < newCollection.length) {
    return `${PREFIX}.collections.${itemKey}.added`;
  } else if (oldCollection.length > newCollection.length) {
    return `${PREFIX}.collections.${itemKey}.removed`;
  } else if (oldCollection.length > 0 && newCollection.length > 0) {
    const oldStr = JSON.stringify(oldCollection);
    const newStr = JSON.stringify(newCollection);
    if (oldStr !== newStr) {
      return `${PREFIX}.collections.${itemKey}.modified`;
    }
  }
  return null;
}

function detectCollectionChanges(oldChar: Character, newChar: Character): string[] {
  const changes: string[] = [];

  for (const { key, i18nKey } of COLLECTION_KEYS) {
    const change = detectCollectionChange(oldChar[key], newChar[key], i18nKey);
    if (change) {
      changes.push(change);
    }
  }

  return changes;
}
