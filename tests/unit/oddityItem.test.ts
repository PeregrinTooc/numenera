// Unit tests for OddityItem component
/* global describe, it, expect, beforeEach, afterEach, vi, HTMLDivElement */

import { render } from "lit-html";
import { screen, fireEvent } from "@testing-library/dom";
import { OddityItem } from "../../src/components/OddityItem.js";
import {
  findEditButton,
  expectModalOpen,
  expectModalClosed,
  clickConfirmButton,
  clickCancelButton,
  changeFieldValue,
} from "./helpers/cardEditHelpers.js";

describe("OddityItem", () => {
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

  const mockOddity = "A crystal that hums when near water";

  it("renders oddity text with icon", () => {
    const item = new OddityItem(mockOddity, 0);
    render(item.render(), container);

    expect(screen.getByTestId("oddity-item")).toBeTruthy();
    expect(screen.getByTestId(`oddity-${mockOddity}`)).toBeTruthy();
    expect(container.textContent).toContain(mockOddity);
    expect(container.textContent).toContain("🔮");
  });

  it("shows edit button when onUpdate callback is provided", () => {
    const onUpdate = vi.fn();
    const item = new OddityItem(mockOddity, 0, onUpdate);
    render(item.render(), container);

    const editButton = screen.queryByTestId("oddity-edit-button-0");
    expect(editButton).toBeTruthy();
  });

  it("opens modal with editable field when edit button is clicked", () => {
    const onUpdate = vi.fn();
    const item = new OddityItem(mockOddity, 0, onUpdate);
    render(item.render(), container);

    const editButton = findEditButton(container);
    fireEvent.click(editButton);

    expectModalOpen();

    // Verify field is present
    expect(screen.getByTestId("edit-field-oddity")).toBeTruthy();
  });

  it("confirms changes and calls onUpdate callback", () => {
    const onUpdate = vi.fn();
    const item = new OddityItem(mockOddity, 0, onUpdate);
    render(item.render(), container);

    const editButton = findEditButton(container);
    fireEvent.click(editButton);

    // Edit field
    changeFieldValue("oddity", "A glowing stone that whispers");

    clickConfirmButton();

    expectModalClosed();
    expect(onUpdate).toHaveBeenCalledWith("A glowing stone that whispers");
  });

  it("cancels changes without calling onUpdate", () => {
    const onUpdate = vi.fn();
    const item = new OddityItem(mockOddity, 0, onUpdate);
    render(item.render(), container);

    const editButton = findEditButton(container);
    fireEvent.click(editButton);

    // Edit field
    changeFieldValue("oddity", "A different oddity");

    clickCancelButton();

    expectModalClosed();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  // Delete functionality tests
  it("shows delete button when onDelete callback is provided", () => {
    const onDelete = vi.fn();
    const item = new OddityItem(mockOddity, 0, undefined, onDelete);
    render(item.render(), container);

    const deleteButton = screen.queryByTestId("oddity-delete-button-0");
    expect(deleteButton).toBeTruthy();
  });

  it("does not show delete button when onDelete callback is not provided", () => {
    const item = new OddityItem(mockOddity, 0);
    render(item.render(), container);

    const deleteButton = screen.queryByTestId("oddity-delete-button-0");
    expect(deleteButton).toBeNull();
  });

  it("calls onDelete callback when delete button is clicked", () => {
    const onDelete = vi.fn();
    const item = new OddityItem(mockOddity, 0, undefined, onDelete);
    render(item.render(), container);

    const deleteButton = screen.getByTestId("oddity-delete-button-0");
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
