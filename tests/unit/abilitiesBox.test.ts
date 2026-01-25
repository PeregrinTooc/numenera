// Unit tests for Abilities component - Add Ability Button
import { Abilities } from "../../src/components/Abilities.js";
import { Ability } from "../../src/types/character.js";
import { testContainerAddButton } from "./helpers/containerTestSuite.js";

// Use shared test suite for add button functionality
testContainerAddButton<Ability>({
  componentName: "Abilities",
  createComponent: (items, onUpdate, onDelete) => new Abilities(items, onUpdate, onDelete),
  addButtonTestId: "add-ability-button",
  mockItems: [
    { name: "Bash", cost: 1, pool: "might", description: "Strike a foe with your weapon" },
    { name: "Fleet of Foot", cost: 1, pool: "speed", description: "Move a short distance" },
  ],
});
