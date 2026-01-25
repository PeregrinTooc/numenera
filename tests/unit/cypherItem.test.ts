// Unit tests for CypherItem component
/* global describe, it, expect, beforeEach, afterEach, vi, Event */

import { render } from "lit-html";
import { CypherItem } from "../../src/components/CypherItem.js";
import { Cypher } from "../../src/types/character.js";
import {
  findEditButton,
  expectModalOpen,
  expectModalClosed,
  clickConfirmButton,
  clickCancelButton,
} from "./helpers/cardEditHelpers.js";

describe("CypherItem", () => {
  let container: HTMLElement;
  const mockCypher: Cypher = {
    name: "Test Cypher",
    level: 5,
    effect: "Test effect description",
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    // Clean up any remaining modals
    const modals = document.querySelectorAll('[data-testid="card-modal-backdrop"]');
    modals.forEach((modal) => {
      if (modal.parentElement) {
        modal.parentElement.remove();
      }
    });
  });

  it("should render cypher with edit button when onUpdate is provided", () => {
    const onUpdate = vi.fn();
    const component = new CypherItem(mockCypher, 0, onUpdate);
    render(component.render(), container);

    const editButton = findEditButton(container);
    expect(editButton).toBeTruthy();
  });

  it("should open modal when edit button is clicked", () => {
    const onUpdate = vi.fn();
    const component = new CypherItem(mockCypher, 0, onUpdate);
    render(component.render(), container);

    const editButton = findEditButton(container);
    editButton?.click();

    expectModalOpen();
  });

  it("should call onUpdate when changes are confirmed", () => {
    const onUpdate = vi.fn();
    const component = new CypherItem(mockCypher, 0, onUpdate);
    render(component.render(), container);

    const editButton = findEditButton(container);
    editButton?.click();

    // Modify the name field
    const nameInput = document.querySelector<HTMLInputElement>('[data-testid="edit-cypher-name"]');
    if (nameInput) {
      nameInput.value = "Updated Cypher";
      nameInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    clickConfirmButton();

    expect(onUpdate).toHaveBeenCalledWith({
      name: "Updated Cypher",
      level: 5,
      effect: "Test effect description",
    });
    expectModalClosed();
  });

  it("should not call onUpdate when changes are cancelled", () => {
    const onUpdate = vi.fn();
    const component = new CypherItem(mockCypher, 0, onUpdate);
    render(component.render(), container);

    const editButton = findEditButton(container);
    editButton?.click();

    // Modify the name field
    const nameInput = document.querySelector<HTMLInputElement>('[data-testid="edit-cypher-name"]');
    if (nameInput) {
      nameInput.value = "Updated Cypher";
      nameInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    clickCancelButton();

    expect(onUpdate).not.toHaveBeenCalled();
    expectModalClosed();
  });

  it("should not render edit button when onUpdate is not provided", () => {
    const component = new CypherItem(mockCypher, 0);
    render(component.render(), container);

    const editButton = container.querySelector('[data-testid*="edit-button"]');
    expect(editButton).toBeNull();
  });

  it("should render delete button when onDelete is provided", () => {
    const onDelete = vi.fn();
    const component = new CypherItem(mockCypher, 0, undefined, onDelete);
    render(component.render(), container);

    const deleteButton = container.querySelector('[data-testid="cypher-delete-button-0"]');
    expect(deleteButton).toBeTruthy();
  });

  it("should call onDelete when delete button is clicked", () => {
    const onDelete = vi.fn();
    const component = new CypherItem(mockCypher, 0, undefined, onDelete);
    render(component.render(), container);

    const deleteButton = container.querySelector('[data-testid="cypher-delete-button-0"]');
    deleteButton?.dispatchEvent(new Event("click", { bubbles: true }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("should not render delete button when onDelete is not provided", () => {
    const component = new CypherItem(mockCypher, 0);
    render(component.render(), container);

    const deleteButton = container.querySelector('[data-testid*="delete-button"]');
    expect(deleteButton).toBeNull();
  });
});
