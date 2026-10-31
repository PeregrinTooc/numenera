import { Character } from "@/types/character";

/**
 * Default values for character fields
 * Used when sanitizing imported data with missing or invalid fields
 */
export const CHARACTER_DEFAULTS: Character = {
  name: "",
  tier: 1,
  type: "",
  descriptor: "",
  focus: "",
  currentXp: 0,
  totalXp: 0,
  shins: 0,
  armor: 0,
  effort: 1,
  maxCyphers: 2,
  stats: {
    might: { pool: 10, edge: 0, current: 10 },
    speed: { pool: 10, edge: 0, current: 10 },
    intellect: { pool: 10, edge: 0, current: 10 },
  },
  cyphers: [],
  artifacts: [],
  oddities: [],
  abilities: [],
  equipment: [],
  attacks: [],
  specialAbilities: [],
  recoveryRolls: {
    action: false,
    tenMinutes: false,
    oneHour: false,
    tenHours: false,
    modifier: 0,
  },
  damageTrack: { impairment: "healthy" },
  textFields: { background: "", notes: "" },
};
