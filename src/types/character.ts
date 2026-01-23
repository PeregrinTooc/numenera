// Type definitions for Numenera character sheet

export type StatPool = {
  pool: number;
  edge: number;
  current: number;
};

export type Cypher = {
  name: string;
  level: string;
  effect: string;
};

export type Artifact = {
  name: string;
  level: string;
  effect: string;
};

export type Ability = {
  name: string;
  description: string;
  cost?: number;
  pool?: "might" | "speed" | "intellect";
  action?: string;
};

export type EquipmentItem = {
  name: string;
  description?: string;
};

export interface Character {
  name: string;
  tier: number;
  type: string;
  descriptor: string;
  focus: string;
  xp: number;
  shins: number;
  armor: number;
  effort: number;
  maxCyphers: number;
  stats: {
    might: StatPool;
    speed: StatPool;
    intellect: StatPool;
  };
  cyphers: Cypher[];
  artifacts: Artifact[];
  oddities: string[];
  abilities: Ability[];
  equipment: EquipmentItem[];
  textFields: {
    background: string;
    notes: string;
  };
}
