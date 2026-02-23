// Unit tests for SpecialAbilities component - Add Special Ability Button
import { SpecialAbilities } from "../../src/components/SpecialAbilities.js";
import { SpecialAbility } from "../../src/types/character.js";
import { testContainerAddButton } from "./helpers/containerTestSuite.js";

// Use shared test suite for add button functionality
testContainerAddButton<SpecialAbility>({
  componentName: "SpecialAbilities",
  createComponent: (character) => new SpecialAbilities(character),
  addButtonTestId: "add-special-ability-button",
  collectionKey: "specialAbilities",
  mockItems: [
    { name: "Mind Shield", source: "Nano Ability", description: "Protect your mind" },
    { name: "Fire Blast", source: "Focus", description: "Unleash fire at enemies" },
  ],
});
