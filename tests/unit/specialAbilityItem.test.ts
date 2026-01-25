// Unit tests for SpecialAbilityItem edit functionality
/* global HTMLTextAreaElement */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/dom";
import { render } from "lit-html";
import { SpecialAbilityItem } from "../../src/components/SpecialAbilityItem.js";
import { SpecialAbility } from "../../src/types/character.js";

describe("SpecialAbilityItem - Edit Functionality", () => {
  let container: HTMLElement;
  let updateSpy: (updated: SpecialAbility) => void;
  const sampleAbility: SpecialAbility = {
    name: "Test Ability",
    description: "Test description",
    source: "Test Source",
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    updateSpy = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should render with edit button", () => {
    const item = new SpecialAbilityItem(sampleAbility, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("special-ability-edit-button-0");
    expect(editButton).toBeTruthy();
  });

  it("should open modal when edit button is clicked", () => {
    const item = new SpecialAbilityItem(sampleAbility, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("special-ability-edit-button-0");
    fireEvent.click(editButton);

    // Modal should be open
    expect(screen.getByTestId("card-modal-backdrop")).toBeTruthy();
    expect(screen.getByTestId("card-edit-modal")).toBeTruthy();
  });

  it("should display editable fields in modal", () => {
    const item = new SpecialAbilityItem(sampleAbility, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("special-ability-edit-button-0");
    fireEvent.click(editButton);

    // Check for editable fields
    const nameInput = screen.getByTestId("edit-special-ability-name") as HTMLInputElement;
    const descInput = screen.getByTestId("edit-special-ability-description") as HTMLTextAreaElement;
    const sourceInput = screen.getByTestId("edit-special-ability-source") as HTMLInputElement;

    expect(nameInput.value).toBe("Test Ability");
    expect(descInput.value).toBe("Test description");
    expect(sourceInput.value).toBe("Test Source");
  });

  it("should update ability when changes are confirmed", () => {
    const item = new SpecialAbilityItem(sampleAbility, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("special-ability-edit-button-0");
    fireEvent.click(editButton);

    // Edit fields
    const nameInput = screen.getByTestId("edit-special-ability-name") as HTMLInputElement;
    const descInput = screen.getByTestId("edit-special-ability-description") as HTMLTextAreaElement;
    const sourceInput = screen.getByTestId("edit-special-ability-source") as HTMLInputElement;

    fireEvent.input(nameInput, { target: { value: "Updated Name" } });
    fireEvent.input(descInput, { target: { value: "Updated description" } });
    fireEvent.input(sourceInput, { target: { value: "Updated Source" } });

    // Confirm
    const confirmButton = screen.getByTestId("card-modal-confirm");
    fireEvent.click(confirmButton);

    // Verify callback was called with updated data
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({
      name: "Updated Name",
      description: "Updated description",
      source: "Updated Source",
    });

    // Modal should be closed
    expect(screen.queryByTestId("card-modal-backdrop")).toBeNull();
  });

  it("should not update ability when changes are cancelled", () => {
    const item = new SpecialAbilityItem(sampleAbility, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("special-ability-edit-button-0");
    fireEvent.click(editButton);

    // Edit fields
    const nameInput = screen.getByTestId("edit-special-ability-name") as HTMLInputElement;
    fireEvent.input(nameInput, { target: { value: "Updated Name" } });

    // Cancel
    const cancelButton = screen.getByTestId("card-modal-cancel");
    fireEvent.click(cancelButton);

    // Verify callback was NOT called
    expect(updateSpy).not.toHaveBeenCalled();

    // Modal should be closed
    expect(screen.queryByTestId("card-modal-backdrop")).toBeNull();
  });

  it("should close modal on ESC key", () => {
    const item = new SpecialAbilityItem(sampleAbility, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("special-ability-edit-button-0");
    fireEvent.click(editButton);

    // Press ESC
    const backdrop = screen.getByTestId("card-modal-backdrop");
    fireEvent.keyDown(backdrop, { key: "Escape", code: "Escape" });

    // Verify callback was NOT called
    expect(updateSpy).not.toHaveBeenCalled();

    // Modal should be closed
    expect(screen.queryByTestId("card-modal-backdrop")).toBeNull();
  });
});
