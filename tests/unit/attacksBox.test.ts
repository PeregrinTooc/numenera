// Unit tests for Attacks component - Add Attack Button
/* global vi */
import { Attacks } from "../../src/components/Attacks.js";
import { Character } from "../../src/types/character.js";
import { testContainerAddButton } from "./helpers/containerTestSuite.js";

// Mock character for testing
const mockCharacter: Character = {
  name: "Test Character",
  tier: 1,
  type: "Glaive",
  descriptor: "Strong",
  focus: "Fights with Panache",
  xp: 0,
  shins: 10,
  armor: 1,
  effort: 1,
  maxCyphers: 2,
  stats: {
    might: { pool: 10, edge: 1, current: 10 },
    speed: { pool: 10, edge: 1, current: 10 },
    intellect: { pool: 10, edge: 0, current: 10 },
  },
  cyphers: [],
  artifacts: [],
  oddities: [],
  abilities: [],
  equipment: [],
  attacks: [
    { name: "Broadsword", damage: 6, modifier: 1, range: "Immediate" },
    { name: "Crossbow", damage: 4, modifier: 0, range: "Long" },
  ],
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

// Use shared test suite for add button functionality
// Note: Attacks component requires full character, not just attacks array
testContainerAddButton<Character>({
  componentName: "Attacks",
  createComponent: (_items, onAttackUpdate, onAttackDelete) =>
    new Attacks(mockCharacter, vi.fn(), onAttackUpdate, onAttackDelete),
  addButtonTestId: "add-attack-button",
  mockItems: [mockCharacter],
});
