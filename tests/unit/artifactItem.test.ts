// Unit tests for ArtifactItem component
import { ArtifactItem } from "../../src/components/ArtifactItem.js";
import { Artifact } from "../../src/types/character.js";
import { testItemEditAndDelete } from "./helpers/itemTestSuite.js";

const mockArtifact: Artifact = {
  name: "Explorer's Gloves",
  level: "1d6",
  effect: "Climbing is eased when worn",
};

// Use shared parameterized test suite
testItemEditAndDelete<Artifact>({
  componentName: "ArtifactItem",
  createComponent: (item, index, onUpdate, onDelete) =>
    new ArtifactItem(item, index, onUpdate, onDelete),
  sampleItem: mockArtifact,
  editButtonTestId: "artifact-edit-button-0",
  deleteButtonTestId: "artifact-delete-button-0",
  fieldTestIds: {
    name: "edit-artifact-name",
    level: "edit-artifact-level",
    effect: "edit-artifact-effect",
  },
  fieldValues: {
    name: "Explorer's Gloves",
    level: "1d6",
    effect: "Climbing is eased when worn",
  },
  updatedFieldValues: {
    name: "New Artifact",
    level: "1d6+2",
    effect: "New effect description",
  },
});
