// Unit tests for SpecialAbilityItem edit functionality
import { SpecialAbilityItem } from "../../src/components/SpecialAbilityItem.js";
import { SpecialAbility } from "../../src/types/character.js";
import { testItemEditAndDelete } from "./helpers/itemTestSuite.js";

const sampleAbility: SpecialAbility = {
  name: "Test Ability",
  description: "Test description",
  source: "Test Source",
};

// Use shared parameterized test suite
testItemEditAndDelete<SpecialAbility>({
  componentName: "SpecialAbilityItem",
  createComponent: (item, index, onUpdate, onDelete) =>
    new SpecialAbilityItem(item, index, onUpdate, onDelete),
  sampleItem: sampleAbility,
  editButtonTestId: "special-ability-edit-button-0",
  deleteButtonTestId: "special-ability-delete-button-0",
  fieldTestIds: {
    name: "edit-special-ability-name",
    description: "edit-special-ability-description",
    source: "edit-special-ability-source",
  },
  fieldValues: {
    name: "Test Ability",
    description: "Test description",
    source: "Test Source",
  },
  updatedFieldValues: {
    name: "Updated Name",
    description: "Updated description",
    source: "Updated Source",
  },
});
