// Unit tests for CypherItem component
import { CypherItem } from "../../src/components/CypherItem.js";
import { Cypher } from "../../src/types/character.js";
import { testItemEditAndDelete } from "./helpers/itemTestSuite.js";

const mockCypher: Cypher = {
  name: "Test Cypher",
  level: "5",
  effect: "Test effect description",
};

// Use shared parameterized test suite
testItemEditAndDelete<Cypher>({
  componentName: "CypherItem",
  createComponent: (item, index, onUpdate, onDelete) =>
    new CypherItem(item, index, onUpdate, onDelete),
  sampleItem: mockCypher,
  editButtonTestId: "cypher-edit-button-0",
  deleteButtonTestId: "cypher-delete-button-0",
  fieldTestIds: {
    name: "edit-cypher-name",
    level: "edit-cypher-level",
    effect: "edit-cypher-effect",
  },
  fieldValues: {
    name: "Test Cypher",
    level: "5",
    effect: "Test effect description",
  },
  updatedFieldValues: {
    name: "Updated Cypher",
  },
});
