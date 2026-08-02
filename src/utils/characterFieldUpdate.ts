// Pure field-update logic for the character sheet's inline field editing.

import { Character } from "../types/character.js";

export interface FieldUpdateResult {
  character: Character;
  label: string;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Changed name",
  tier: "Changed tier",
  descriptor: "Changed descriptor",
  focus: "Changed focus",
  xp: "Changed XP",
  shins: "Changed shins",
  armor: "Changed armor",
  maxCyphers: "Changed max cyphers",
  effort: "Changed effort",
  mightPool: "Changed Might pool",
  mightEdge: "Changed Might edge",
  mightCurrent: "Changed current Might",
  speedPool: "Changed Speed pool",
  speedEdge: "Changed Speed edge",
  speedCurrent: "Changed current Speed",
  intellectPool: "Changed Intellect pool",
  intellectEdge: "Changed Intellect edge",
  intellectCurrent: "Changed current Intellect",
};

/**
 * Apply a single field edit immutably. `stats` and each of its stat groups
 * are cloned unconditionally (not just when touched) so the result never
 * shares a reference with the input's stats — the input may itself be a
 * displayed character sharing its stats object with a cached version
 * snapshot (see VersionState.navigateToVersion).
 */
export function applyFieldUpdate(
  character: Character,
  field: string,
  value: string | number
): FieldUpdateResult {
  const updatedCharacter: Character = {
    ...character,
    stats: {
      might: { ...character.stats.might },
      speed: { ...character.stats.speed },
      intellect: { ...character.stats.intellect },
    },
  };

  switch (field) {
    case "name":
      updatedCharacter.name = value as string;
      break;
    case "tier":
      updatedCharacter.tier = value as number;
      break;
    case "descriptor":
      updatedCharacter.descriptor = value as string;
      break;
    case "focus":
      updatedCharacter.focus = value as string;
      break;
    case "xp":
      updatedCharacter.xp = value as number;
      break;
    case "shins":
      updatedCharacter.shins = value as number;
      break;
    case "armor":
      updatedCharacter.armor = value as number;
      break;
    case "maxCyphers":
      updatedCharacter.maxCyphers = value as number;
      break;
    case "effort":
      updatedCharacter.effort = value as number;
      break;
    case "mightPool":
      updatedCharacter.stats.might.pool = value as number;
      break;
    case "mightEdge":
      updatedCharacter.stats.might.edge = value as number;
      break;
    case "mightCurrent":
      updatedCharacter.stats.might.current = value as number;
      break;
    case "speedPool":
      updatedCharacter.stats.speed.pool = value as number;
      break;
    case "speedEdge":
      updatedCharacter.stats.speed.edge = value as number;
      break;
    case "speedCurrent":
      updatedCharacter.stats.speed.current = value as number;
      break;
    case "intellectPool":
      updatedCharacter.stats.intellect.pool = value as number;
      break;
    case "intellectEdge":
      updatedCharacter.stats.intellect.edge = value as number;
      break;
    case "intellectCurrent":
      updatedCharacter.stats.intellect.current = value as number;
      break;
  }

  return { character: updatedCharacter, label: FIELD_LABELS[field] ?? field };
}
