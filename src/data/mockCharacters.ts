// Mock character data for development and testing

import { Character } from "../types/character.js";

export const FULL_CHARACTER: Character = {
  name: "Kael the Wanderer",
  tier: 3,
  type: "Glaive",
  descriptor: "Strong",
  focus: "Bears a Halo of Fire",
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
  textFields: {
    background: "Born in a remote village, discovered ancient ruins that changed everything",
    notes: "Currently investigating the mysterious disappearances in the nearby forest",
    equipment: "Medium armor, Broadsword, Explorer's pack, 50 feet of rope",
    abilities: "Trained in intimidation, Specialized in heavy weapons",
  },
};

export const EMPTY_CHARACTER: Character = {
  name: "Kael the Wanderer",
  tier: 3,
  type: "Glaive",
  descriptor: "Strong",
  focus: "Bears a Halo of Fire",
  stats: {
    might: { pool: 15, edge: 2, current: 12 },
    speed: { pool: 12, edge: 1, current: 12 },
    intellect: { pool: 10, edge: 0, current: 8 },
  },
  cyphers: [],
  artifacts: [],
  oddities: [],
  textFields: {
    background: "",
    notes: "",
    equipment: "",
    abilities: "",
  },
};
