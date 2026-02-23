// Unit tests for Attacks component - Add Attack Button
import { Attacks } from "../../src/components/Attacks.js";
import { Attack } from "../../src/types/character.js";
import { testContainerAddButton } from "./helpers/containerTestSuite.js";

// Use shared test suite for add button functionality
// Note: Attacks component takes Character and onFieldUpdate callback
testContainerAddButton<Attack>({
  componentName: "Attacks",
  createComponent: (character) => new Attacks(character, vi.fn()),
  addButtonTestId: "add-attack-button",
  collectionKey: "attacks",
  mockItems: [
    { name: "Broadsword", damage: 6, modifier: 1, range: "Immediate" },
    { name: "Crossbow", damage: 4, modifier: 0, range: "Long" },
  ],
});
