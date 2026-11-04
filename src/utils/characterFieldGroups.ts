import type { Character } from "@/types/character";

export const BASIC_INFO_FIELDS = ["name", "tier", "type", "descriptor", "focus"] as const;
export type BasicInfoField = (typeof BASIC_INFO_FIELDS)[number];

export const STAT_NAMES = ["might", "speed", "intellect"] as const;
export type StatName = (typeof STAT_NAMES)[number];

export const TEXT_FIELDS = ["background", "notes"] as const;
export type TextField = (typeof TEXT_FIELDS)[number];

export interface ResourceFieldGroup {
  key: "xp" | "shins" | "armor" | "effort" | "maxCyphers";
  fields: ReadonlyArray<keyof Character>;
}

/** Each resource and the Character fields that make it up (xp is a current/total pair). */
export const RESOURCE_FIELDS: readonly ResourceFieldGroup[] = [
  { key: "xp", fields: ["currentXp", "totalXp"] },
  { key: "shins", fields: ["shins"] },
  { key: "armor", fields: ["armor"] },
  { key: "effort", fields: ["effort"] },
  { key: "maxCyphers", fields: ["maxCyphers"] },
];

export interface CollectionKey {
  key:
    | "cyphers"
    | "artifacts"
    | "equipment"
    | "attacks"
    | "abilities"
    | "specialAbilities"
    | "oddities";
  i18nKey: string;
}

export const COLLECTION_KEYS: readonly CollectionKey[] = [
  { key: "cyphers", i18nKey: "cypher" },
  { key: "artifacts", i18nKey: "artifact" },
  { key: "equipment", i18nKey: "equipment" },
  { key: "attacks", i18nKey: "attack" },
  { key: "abilities", i18nKey: "ability" },
  { key: "specialAbilities", i18nKey: "specialAbility" },
  { key: "oddities", i18nKey: "oddity" },
];

export function statPoolDiffers(a: Character, b: Character, stat: StatName): boolean {
  const x = a.stats[stat];
  const y = b.stats[stat];
  return x.pool !== y.pool || x.edge !== y.edge || x.current !== y.current;
}

export function resourceDiffers(a: Character, b: Character, group: ResourceFieldGroup): boolean {
  return group.fields.some((field) => a[field] !== b[field]);
}

export function textFieldDiffers(a: Character, b: Character, field: TextField): boolean {
  return a.textFields[field] !== b.textFields[field];
}
