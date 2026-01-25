// Unit tests for AttackItem edit functionality
import { AttackItem } from "../../src/components/AttackItem.js";
import { Attack } from "../../src/types/character.js";
import { testItemEditAndDelete } from "./helpers/itemTestSuite.js";

const sampleAttack: Attack = {
  name: "Sword Attack",
  damage: 4,
  modifier: 1,
  range: "Immediate",
  notes: "Sharp blade",
};

// Use shared parameterized test suite
testItemEditAndDelete<Attack>({
  componentName: "AttackItem",
  createComponent: (item, index, onUpdate, onDelete) =>
    new AttackItem(item, index, onUpdate, onDelete),
  sampleItem: sampleAttack,
  editButtonTestId: "attack-edit-button-0",
  deleteButtonTestId: "attack-delete-button-0",
  fieldTestIds: {
    name: "edit-attack-name",
    damage: "edit-attack-damage",
    modifier: "edit-attack-modifier",
    range: "edit-attack-range",
    notes: "edit-attack-notes",
  },
  fieldValues: {
    name: "Sword Attack",
    damage: "4",
    modifier: "1",
    range: "Immediate",
    notes: "Sharp blade",
  },
  updatedFieldValues: {
    name: "Axe Attack",
    damage: "6",
  },
  expectedUpdateTransform: (values) => ({
    name: values.name as string,
    damage: Number(values.damage),
  }),
});
