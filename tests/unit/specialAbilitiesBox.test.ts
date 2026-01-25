// Unit tests for SpecialAbilities component - Add Special Ability Button
import { SpecialAbilities } from "../../src/components/SpecialAbilities.js";
import { SpecialAbility } from "../../src/types/character.js";
import { testContainerAddButton } from "./helpers/containerTestSuite.js";

// Use shared test suite for add button functionality
testContainerAddButton<SpecialAbility>({
  componentName: "SpecialAbilities",
  createComponent: (items, onUpdate, onDelete) => new SpecialAbilities(items, onUpdate, onDelete),
  addButtonTestId: "add-special-ability-button",
  mockItems: [
    {
      name: "Practiced in Armor",
      source: "Type",
      description: "You can wear armor for long periods",
    },
    {
      name: "Fire Affinity",
      source: "Focus",
      description: "You are trained in fire-based attacks",
    },
  ],
});
