// Unit tests for EquipmentItem component
/* global describe, it, expect, beforeEach, afterEach, vi, HTMLDivElement */

import { render } from "lit-html";
import { screen, fireEvent } from "@testing-library/dom";
import { EquipmentItem } from "../../src/components/EquipmentItem.js";
import { EquipmentItem as EquipmentItemType } from "../../src/types/character.js";
import {
  findEditButton,
  expectModalOpen,
  expectModalClosed,
  clickConfirmButton,
  clickCancelButton,
  changeFieldValue,
} from "./helpers/cardEditHelpers.js";

describe("EquipmentItem", () => {
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

  const mockEquipment: EquipmentItemType = {
    name: "Rope (50 feet)",
    description: "Strong hemp rope for climbing",
  };

  it("renders equipment with name and description", () => {
    const item = new EquipmentItem(mockEquipment, 0);
    render(item.render(), container);

    expect(screen.getByTestId(`equipment-item-${mockEquipment.name}`)).toBeTruthy();
    expect(container.textContent).toContain(mockEquipment.name);
    expect(container.textContent).toContain(mockEquipment.description);
  });

  it("shows edit button when onUpdate callback is provided", () => {
    const onUpdate = vi.fn();
    const item = new EquipmentItem(mockEquipment, 0, onUpdate);
    render(item.render(), container);

    const editButton = screen.queryByTestId("equipment-edit-button-0");
    expect(editButton).toBeTruthy();
  });

  it("opens modal with editable fields when edit button is clicked", () => {
    const onUpdate = vi.fn();
    const item = new EquipmentItem(mockEquipment, 0, onUpdate);
    render(item.render(), container);

    const editButton = findEditButton(container);
    fireEvent.click(editButton);

    expectModalOpen();

    // Verify all fields are present
    expect(screen.getByTestId("edit-field-name")).toBeTruthy();
    expect(screen.getByTestId("edit-field-description")).toBeTruthy();
  });

  it("confirms changes and calls onUpdate callback", () => {
    const onUpdate = vi.fn();
    const item = new EquipmentItem(mockEquipment, 0, onUpdate);
    render(item.render(), container);

    const editButton = findEditButton(container);
    fireEvent.click(editButton);

    // Edit fields
    changeFieldValue("name", "Lantern");
    changeFieldValue("description", "Provides light in darkness");

    clickConfirmButton();

    expectModalClosed();
    expect(onUpdate).toHaveBeenCalledWith({
      name: "Lantern",
      description: "Provides light in darkness",
    });
  });

  it("cancels changes without calling onUpdate", () => {
    const onUpdate = vi.fn();
    const item = new EquipmentItem(mockEquipment, 0, onUpdate);
    render(item.render(), container);

    const editButton = findEditButton(container);
    fireEvent.click(editButton);

    // Edit fields
    changeFieldValue("name", "Different Item");

    clickCancelButton();

    expectModalClosed();
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
