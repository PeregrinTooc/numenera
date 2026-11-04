// Unit tests for Attacks component - Add Attack Button
import { Attacks } from "@/components/Attacks";
import { Attack } from "@/types/character";
import { testContainerAddButton } from "./helpers/containerTestSuite.js";

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
