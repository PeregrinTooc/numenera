// Unit tests for AbilityItem edit functionality
/* global HTMLTextAreaElement, HTMLSelectElement */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/dom";
import { render } from "lit-html";
import { AbilityItem } from "../../src/components/AbilityItem.js";
import { Ability } from "../../src/types/character.js";

describe("AbilityItem - Edit Functionality", () => {
  let container: HTMLElement;
  let updateSpy: (updated: Ability) => void;
  const sampleAbility: Ability = {
    name: "Power Strike",
    description: "A powerful melee attack",
    cost: 3,
    pool: "might",
    action: "1 action",
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
    const item = new AbilityItem(sampleAbility, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("ability-edit-button-0");
    expect(editButton).toBeTruthy();
  });

  it("should open modal when edit button is clicked", () => {
    const item = new AbilityItem(sampleAbility, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("ability-edit-button-0");
    fireEvent.click(editButton);

    expect(screen.getByTestId("card-modal-backdrop")).toBeTruthy();
    expect(screen.getByTestId("card-edit-modal")).toBeTruthy();
  });

  it("should display all editable fields in modal", () => {
    const item = new AbilityItem(sampleAbility, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("ability-edit-button-0");
    fireEvent.click(editButton);

    const nameInput = screen.getByTestId("edit-ability-name") as HTMLInputElement;
    const descInput = screen.getByTestId("edit-ability-description") as HTMLTextAreaElement;
    const costInput = screen.getByTestId("edit-ability-cost") as HTMLInputElement;
    const actionInput = screen.getByTestId("edit-ability-action") as HTMLInputElement;
    const poolSelect = screen.getByTestId("edit-ability-pool") as HTMLSelectElement;

    expect(nameInput.value).toBe("Power Strike");
    expect(descInput.value).toBe("A powerful melee attack");
    expect(costInput.value).toBe("3");
    expect(actionInput.value).toBe("1 action");
    expect(poolSelect.value).toBe("might");
  });

  it("should update ability when changes are confirmed", () => {
    const item = new AbilityItem(sampleAbility, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("ability-edit-button-0");
    fireEvent.click(editButton);

    const nameInput = screen.getByTestId("edit-ability-name") as HTMLInputElement;
    const costInput = screen.getByTestId("edit-ability-cost") as HTMLInputElement;

    fireEvent.input(nameInput, { target: { value: "Updated Strike" } });
    fireEvent.input(costInput, { target: { value: "5" } });

    const confirmButton = screen.getByTestId("card-modal-confirm");
    fireEvent.click(confirmButton);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    const updatedAbility = (updateSpy as any).mock.calls[0][0];
    expect(updatedAbility.name).toBe("Updated Strike");
    expect(updatedAbility.cost).toBe(5);
  });

  it("should handle optional fields (no cost, pool, or action)", () => {
    const minimalAbility: Ability = {
      name: "Simple Ability",
      description: "Just a description",
    };

    const item = new AbilityItem(minimalAbility, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("ability-edit-button-0");
    fireEvent.click(editButton);

    const costInput = screen.getByTestId("edit-ability-cost") as HTMLInputElement;
    const actionInput = screen.getByTestId("edit-ability-action") as HTMLInputElement;

    expect(costInput.value).toBe("");
    expect(actionInput.value).toBe("");
  });

  it("should not update ability when cancelled", () => {
    const item = new AbilityItem(sampleAbility, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("ability-edit-button-0");
    fireEvent.click(editButton);

    const nameInput = screen.getByTestId("edit-ability-name") as HTMLInputElement;
    fireEvent.input(nameInput, { target: { value: "Changed Name" } });

    const cancelButton = screen.getByTestId("card-modal-cancel");
    fireEvent.click(cancelButton);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(screen.queryByTestId("card-modal-backdrop")).toBeNull();
  });

  // Delete functionality tests
  it("shows delete button when onDelete callback is provided", () => {
    const onDelete = vi.fn();
    const item = new AbilityItem(sampleAbility, 0, undefined, onDelete);
    render(item.render(), container);

    const deleteButton = screen.queryByTestId("ability-delete-button-0");
    expect(deleteButton).toBeTruthy();
  });

  it("does not show delete button when onDelete callback is not provided", () => {
    const item = new AbilityItem(sampleAbility, 0);
    render(item.render(), container);

    const deleteButton = screen.queryByTestId("ability-delete-button-0");
    expect(deleteButton).toBeNull();
  });

  it("calls onDelete callback when delete button is clicked", () => {
    const onDelete = vi.fn();
    const item = new AbilityItem(sampleAbility, 0, undefined, onDelete);
    render(item.render(), container);

    const deleteButton = screen.getByTestId("ability-delete-button-0");
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
