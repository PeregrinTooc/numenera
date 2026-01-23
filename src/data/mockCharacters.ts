// Mock character data for development and testing

import { Character } from "../types/character.js";

export const FULL_CHARACTER: Character = {
  name: "Kael the Wanderer",
  tier: 3,
  type: "Glaive",
  descriptor: "Strong",
  focus: "Bears a Halo of Fire",
  xp: 12,
  shins: 47,
  armor: 2,
  effort: 3,
  maxCyphers: 4,
  stats: {
    might: { pool: 15, edge: 2, current: 12 },
    speed: { pool: 12, edge: 1, current: 12 },
    intellect: { pool: 10, edge: 0, current: 8 },
  },
  cyphers: [
    {
      name: "Detonation (Cell)",
      level: "1d6+2",
      effect: "Explodes in an immediate radius",
    },
    {
      name: "Stim (Injector)",
      level: "1d6",
      effect: "Restores 1d6 + 2 points to one Pool",
    },
  ],
  artifacts: [
    {
      name: "Lightning Rod",
      level: "6",
      effect: "Projects lightning bolt up to long range",
    },
  ],
  oddities: [
    "A glowing cube that hums when near water",
    "A piece of transparent metal that's always cold",
  ],
  abilities: [
    {
      name: "Trained in Intimidation",
      description: "You are trained in intimidation tasks",
    },
    {
      name: "Specialized in Heavy Weapons",
      description: "You are specialized in attacks with heavy weapons",
    },
    {
      name: "Bash",
      description: "You can use your weapon or a shield to make a melee bash attack",
    },
    {
      name: "Fleet of Foot",
      description: "You can move a short distance and still make an attack",
    },
  ],
  equipment: [
    {
      name: "Medium armor",
      description: "Provides protection without hindering movement",
    },
    {
      name: "Broadsword",
      description: "Heavy melee weapon",
    },
    {
      name: "Explorer's pack",
    },
    {
      name: "50 feet of rope",
    },
  ],
  textFields: {
    background: "Born in a remote village, discovered ancient ruins that changed everything",
    notes: "Currently investigating the mysterious disappearances in the nearby forest",
  },
};

export const NEW_CHARACTER: Character = {
  name: "",
  tier: 1,
  type: "",
  descriptor: "",
  focus: "",
  xp: 0,
  shins: 0,
  armor: 0,
  effort: 1,
  maxCyphers: 2,
  stats: {
    might: { pool: 7, edge: 0, current: 7 },
    speed: { pool: 7, edge: 0, current: 7 },
    intellect: { pool: 7, edge: 0, current: 7 },
  },
  cyphers: [],
  artifacts: [],
  oddities: [],
  abilities: [],
  equipment: [],
  textFields: {
    background: "",
    notes: "",
  },
};
