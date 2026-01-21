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

export interface Character {
  name: string;
  tier: number;
  type: string;
  descriptor: string;
  focus: string;
  stats: {
    might: StatPool;
    speed: StatPool;
    intellect: StatPool;
  };
  cyphers: Cypher[];
  artifacts: Artifact[];
  oddities: string[];
  textFields: {
    background: string;
    notes: string;
    equipment: string;
    abilities: string;
  };
}
