import type {
  Character,
  Cypher,
  Artifact,
  Ability,
  EquipmentItem,
  Attack,
  SpecialAbility,
} from "@/types/character";
import {
  BASIC_INFO_FIELDS,
  RESOURCE_FIELDS,
  STAT_NAMES,
  TEXT_FIELDS,
  resourceDiffers,
  statPoolDiffers,
  textFieldDiffers,
} from "@/utils/characterFieldGroups";

/**
 * Fine-grained, field-by-field diff between two character snapshots, for the
 * Comparison View's colour highlighting and uncapped change header. Sibling
 * to changeDetection.ts, not a replacement for it: changeDetection.ts stays
 * dedicated to producing the short, capped/combined version-history
 * description string, while this stays dedicated to "does this exact field
 * or card differ, and how" for rendering. Deliberately dependency-free (no
 * i18n import) so it stays a pure, easily unit-testable util, matching the
 * convention set by changeDetection.ts.
 */

export type CollectionItemStatus = "unchanged" | "added" | "removed" | "modified";

export interface CollectionDiffEntry<T> {
  item: T;
  status: CollectionItemStatus;
}

export interface CollectionDiff<T> {
  /** Items as they should render in the left pane: unchanged, modified, or removed. Never "added". */
  left: CollectionDiffEntry<T>[];
  /** Items as they should render in the right pane: unchanged, modified, or added. Never "removed". */
  right: CollectionDiffEntry<T>[];
}

export interface CharacterDiff {
  basicInfo: {
    name: boolean;
    tier: boolean;
    type: boolean;
    descriptor: boolean;
    focus: boolean;
  };
  stats: {
    might: boolean;
    speed: boolean;
    intellect: boolean;
  };
  resources: {
    xp: boolean;
    shins: boolean;
    armor: boolean;
    effort: boolean;
    maxCyphers: boolean;
  };
  textFields: {
    background: boolean;
    notes: boolean;
  };
  collections: {
    cyphers: CollectionDiff<Cypher>;
    artifacts: CollectionDiff<Artifact>;
    equipment: CollectionDiff<EquipmentItem>;
    attacks: CollectionDiff<Attack>;
    abilities: CollectionDiff<Ability>;
    specialAbilities: CollectionDiff<SpecialAbility>;
    oddities: CollectionDiff<string>;
  };
  /** True if any field or collection entry differs between left and right. */
  hasChanges: boolean;
}

/**
 * Diffs a collection matched by a caller-supplied key (name for most card
 * types, the string itself for oddities). Same name in both -> compared for
 * equality and marked "modified" or "unchanged". Name only on one side ->
 * "added" or "removed". A rename therefore surfaces as a removal on the old
 * name plus an addition on the new one, not a modification - this is a
 * deliberate consequence of matching by name, not a bug.
 */
function diffCollection<T>(
  oldItems: T[],
  newItems: T[],
  getKey: (item: T) => string
): CollectionDiff<T> {
  const oldByKey = new Map(oldItems.map((item) => [getKey(item), item]));
  const newByKey = new Map(newItems.map((item) => [getKey(item), item]));

  const left: CollectionDiffEntry<T>[] = oldItems.map((item) => {
    const key = getKey(item);
    if (!newByKey.has(key)) {
      return { item, status: "removed" };
    }
    const matching = newByKey.get(key) as T;
    const status: CollectionItemStatus =
      JSON.stringify(item) === JSON.stringify(matching) ? "unchanged" : "modified";
    return { item, status };
  });

  const right: CollectionDiffEntry<T>[] = newItems.map((item) => {
    const key = getKey(item);
    if (!oldByKey.has(key)) {
      return { item, status: "added" };
    }
    const matching = oldByKey.get(key) as T;
    const status: CollectionItemStatus =
      JSON.stringify(item) === JSON.stringify(matching) ? "unchanged" : "modified";
    return { item, status };
  });

  return { left, right };
}

function collectionHasChanges(diff: CollectionDiff<unknown>): boolean {
  // "removed"/"modified" show up on the left, "added"/"modified" on the
  // right - a purely-added item never appears in `left` at all, so both
  // sides must be checked.
  return (
    diff.left.some((entry) => entry.status !== "unchanged") ||
    diff.right.some((entry) => entry.status !== "unchanged")
  );
}

function flagsFor<K extends string>(
  keys: readonly K[],
  differs: (key: K) => boolean
): Record<K, boolean> {
  return Object.fromEntries(keys.map((key) => [key, differs(key)])) as Record<K, boolean>;
}

export function diffCharacters(left: Character, right: Character): CharacterDiff {
  const basicInfo = flagsFor(BASIC_INFO_FIELDS, (field) => left[field] !== right[field]);
  const stats = flagsFor(STAT_NAMES, (stat) => statPoolDiffers(left, right, stat));
  const resources = Object.fromEntries(
    RESOURCE_FIELDS.map((group) => [group.key, resourceDiffers(left, right, group)])
  ) as CharacterDiff["resources"];
  const textFields = flagsFor(TEXT_FIELDS, (field) => textFieldDiffers(left, right, field));

  const collections = {
    cyphers: diffCollection(left.cyphers, right.cyphers, (item) => item.name),
    artifacts: diffCollection(left.artifacts, right.artifacts, (item) => item.name),
    equipment: diffCollection(left.equipment, right.equipment, (item) => item.name),
    attacks: diffCollection(left.attacks, right.attacks, (item) => item.name),
    abilities: diffCollection(left.abilities, right.abilities, (item) => item.name),
    specialAbilities: diffCollection(
      left.specialAbilities,
      right.specialAbilities,
      (item) => item.name
    ),
    oddities: diffCollection(left.oddities, right.oddities, (item) => item),
  };

  const hasChanges =
    Object.values(basicInfo).some(Boolean) ||
    Object.values(stats).some(Boolean) ||
    Object.values(resources).some(Boolean) ||
    Object.values(textFields).some(Boolean) ||
    Object.values(collections).some((diff) => collectionHasChanges(diff));

  return { basicInfo, stats, resources, textFields, collections, hasChanges };
}
