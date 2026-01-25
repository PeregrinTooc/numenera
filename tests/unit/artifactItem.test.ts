// Unit tests for ArtifactItem component
/* global describe, it, expect, beforeEach, afterEach, vi, HTMLDivElement */

import { render } from "lit-html";
import { screen, fireEvent } from "@testing-library/dom";
import { ArtifactItem } from "../../src/components/ArtifactItem.js";
import { Artifact } from "../../src/types/character.js";
import {
  findEditButton,
  expectModalOpen,
  expectModalClosed,
  clickConfirmButton,
  clickCancelButton,
  changeFieldValue,
} from "./helpers/cardEditHelpers.js";

describe("ArtifactItem", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    // Clean up any leftover modals
    const modals = document.querySelectorAll('[data-testid="card-modal-backdrop"]');
    modals.forEach((modal) => {
      if (modal.parentElement) {
        modal.parentElement.remove();
      }
    });
  });

  const mockArtifact: Artifact = {
    name: "Explorer's Gloves",
    level: "1d6",
    effect: "Climbing is eased when worn",
  };

  it("renders artifact with name, level, and effect", () => {
    const item = new ArtifactItem(mockArtifact, 0);
    render(item.render(), container);

    expect(screen.getByTestId("artifact-item")).toBeTruthy();
    expect(screen.getByTestId(`artifact-name-${mockArtifact.name}`)).toBeTruthy();
    expect(screen.getByTestId(`artifact-level-${mockArtifact.name}`)).toBeTruthy();
    expect(container.textContent).toContain(mockArtifact.name);
    expect(container.textContent).toContain(mockArtifact.level);
    expect(container.textContent).toContain(mockArtifact.effect);
  });

  it("shows edit button when onUpdate callback is provided", () => {
    const onUpdate = vi.fn();
    const item = new ArtifactItem(mockArtifact, 0, onUpdate);
    render(item.render(), container);

    const editButton = screen.queryByTestId("artifact-edit-button-0");
    expect(editButton).toBeTruthy();
  });

  it("opens modal with editable fields when edit button is clicked", () => {
    const onUpdate = vi.fn();
    const item = new ArtifactItem(mockArtifact, 0, onUpdate);
    render(item.render(), container);

    const editButton = findEditButton(container);
    fireEvent.click(editButton);

    expectModalOpen();

    // Verify all fields are present
    expect(screen.getByTestId("edit-field-name")).toBeTruthy();
    expect(screen.getByTestId("edit-field-level")).toBeTruthy();
    expect(screen.getByTestId("edit-field-effect")).toBeTruthy();
  });

  it("confirms changes and calls onUpdate callback", () => {
    const onUpdate = vi.fn();
    const item = new ArtifactItem(mockArtifact, 0, onUpdate);
    render(item.render(), container);

    const editButton = findEditButton(container);
    fireEvent.click(editButton);

    // Edit fields
    changeFieldValue("name", "New Artifact");
    changeFieldValue("level", "1d6+2");
    changeFieldValue("effect", "New effect description");

    clickConfirmButton();

    expectModalClosed();
    expect(onUpdate).toHaveBeenCalledWith({
      name: "New Artifact",
      level: "1d6+2",
      effect: "New effect description",
    });
  });

  it("cancels changes without calling onUpdate", () => {
    const onUpdate = vi.fn();
    const item = new ArtifactItem(mockArtifact, 0, onUpdate);
    render(item.render(), container);

    const editButton = findEditButton(container);
    fireEvent.click(editButton);

    // Edit fields
    changeFieldValue("name", "New Artifact");
    changeFieldValue("level", "1d6+2");

    clickCancelButton();

    expectModalClosed();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  // Delete functionality tests
  it("shows delete button when onDelete callback is provided", () => {
    const onDelete = vi.fn();
    const item = new ArtifactItem(mockArtifact, 0, undefined, onDelete);
    render(item.render(), container);

    const deleteButton = screen.queryByTestId("artifact-delete-button-0");
    expect(deleteButton).toBeTruthy();
  });

  it("does not show delete button when onDelete callback is not provided", () => {
    const item = new ArtifactItem(mockArtifact, 0);
    render(item.render(), container);

    const deleteButton = screen.queryByTestId("artifact-delete-button-0");
    expect(deleteButton).toBeNull();
  });

  it("calls onDelete callback when delete button is clicked", () => {
    const onDelete = vi.fn();
    const item = new ArtifactItem(mockArtifact, 0, undefined, onDelete);
    render(item.render(), container);

    const deleteButton = screen.getByTestId("artifact-delete-button-0");
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
