// Unit tests for OddityItem component
import { OddityItem } from "../../src/components/OddityItem.js";
import { testItemEditAndDelete } from "./helpers/itemTestSuite.js";

const mockOddity = "A crystal that hums when near water";

// Use shared parameterized test suite
// Note: Oddity is a string type, so it's updated directly (not as an object)
testItemEditAndDelete<string>({
  componentName: "OddityItem",
  createComponent: (item, index, onUpdate, onDelete) =>
    new OddityItem(item, index, onUpdate, onDelete),
  sampleItem: mockOddity,
  editButtonTestId: "oddity-edit-button-0",
  deleteButtonTestId: "oddity-delete-button-0",
  fieldTestIds: {
    oddity: "edit-field-oddity",
  },
  fieldValues: {
    oddity: "A crystal that hums when near water",
  },
  updatedFieldValues: {
    oddity: "A glowing stone that whispers",
  },
  // Oddity is a string, so the update returns the string directly
  expectedUpdateTransform: (values) => values.oddity as any,
});
