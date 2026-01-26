// Unit tests for EquipmentItem component
import { EquipmentItem } from "../../src/components/EquipmentItem.js";
import { EquipmentItem as EquipmentItemType } from "../../src/types/character.js";
import { testItemEditAndDelete } from "./helpers/itemTestSuite.js";

const mockEquipment: EquipmentItemType = {
  name: "Rope (50 feet)",
  description: "Strong hemp rope for climbing",
};

// Use shared parameterized test suite
testItemEditAndDelete<EquipmentItemType>({
  componentName: "EquipmentItem",
  createComponent: (item, index, onUpdate, onDelete) =>
    new EquipmentItem(item, index, onUpdate, onDelete),
  sampleItem: mockEquipment,
  editButtonTestId: "equipment-edit-button-0",
  deleteButtonTestId: "equipment-delete-button-0",
  fieldTestIds: {
    name: "edit-field-name",
    description: "edit-field-description",
  },
  fieldValues: {
    name: "Rope (50 feet)",
    description: "Strong hemp rope for climbing",
  },
  updatedFieldValues: {
    name: "Lantern",
    description: "Provides light in darkness",
  },
});
