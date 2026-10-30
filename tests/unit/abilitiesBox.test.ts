// Unit tests for Abilities component - Add Ability Button
import { Abilities } from "@/components/Abilities";
import { Ability } from "@/types/character";
import { testContainerAddButton } from "./helpers/containerTestSuite.js";

// Use shared test suite for add button functionality
testContainerAddButton<Ability>({
  componentName: "Abilities",
  createComponent: (character) => new Abilities(character),
  addButtonTestId: "add-ability-button",
  collectionKey: "abilities",
  mockItems: [
    { name: "Bash", cost: 1, pool: "might", description: "Strike a foe with your weapon" },
    { name: "Fleet of Foot", cost: 1, pool: "speed", description: "Move a short distance" },
  ],
});
