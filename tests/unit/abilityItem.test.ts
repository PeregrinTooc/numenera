// Unit tests for AbilityItem edit functionality
import { AbilityItem } from "../../src/components/AbilityItem.js";
import { Ability } from "../../src/types/character.js";
import { testItemEditAndDelete } from "./helpers/itemTestSuite.js";

const sampleAbility: Ability = {
  name: "Power Strike",
  description: "A powerful melee attack",
  cost: 3,
  pool: "might",
  action: "1 action",
};

// Use shared parameterized test suite
testItemEditAndDelete<Ability>({
  componentName: "AbilityItem",
  createComponent: (item, index, onUpdate, onDelete) =>
    new AbilityItem(item, index, onUpdate, onDelete),
  sampleItem: sampleAbility,
  editButtonTestId: "ability-edit-button-0",
  deleteButtonTestId: "ability-delete-button-0",
  fieldTestIds: {
    name: "edit-ability-name",
    description: "edit-ability-description",
    cost: "edit-ability-cost",
    action: "edit-ability-action",
    pool: "edit-ability-pool",
  },
  fieldValues: {
    name: "Power Strike",
    description: "A powerful melee attack",
    cost: "3",
    action: "1 action",
    pool: "might",
  },
  updatedFieldValues: {
    name: "Updated Strike",
    cost: "5",
  },
  expectedUpdateTransform: (values) => ({
    name: values.name as string,
    cost: Number(values.cost),
  }),
});
