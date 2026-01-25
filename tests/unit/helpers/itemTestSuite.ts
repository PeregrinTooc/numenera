// Parameterized test suite for item components (AbilityItem, AttackItem, etc.)
// Eliminates duplication across all item test files
/* global describe, it, expect, beforeEach, afterEach, vi */

import { render } from "lit-html";
import { screen, fireEvent } from "@testing-library/dom";

export interface ItemTestConfig<T> {
  componentName: string;
  createComponent: (item: T, index: number, onUpdate?: any, onDelete?: any) => any;
  sampleItem: T;
  editButtonTestId: string;
  deleteButtonTestId: string;
  fieldTestIds: Record<string, string>;
  fieldValues: Record<string, string | number>;
  updatedFieldValues: Record<string, string | number>;
  expectedUpdateTransform?: (values: Record<string, any>) => Partial<T>;
}

/**
 * Complete test suite for item edit and delete functionality
 * Tests all standard item behaviors consistently
 */
export function testItemEditAndDelete<T>(config: ItemTestConfig<T>): void {
  describe(`${config.componentName} - Edit Functionality`, () => {
    let container: HTMLElement;
    let updateSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);
      updateSpy = vi.fn();
    });

    afterEach(() => {
      document.body.innerHTML = "";
    });

    it("should render with edit button", () => {
      const item = config.createComponent(config.sampleItem, 0, updateSpy);
      render(item.render(), container);

      const editButton = screen.getByTestId(config.editButtonTestId);
      expect(editButton).toBeTruthy();
    });

    it("should open modal when edit button is clicked", () => {
      const item = config.createComponent(config.sampleItem, 0, updateSpy);
      render(item.render(), container);

      const editButton = screen.getByTestId(config.editButtonTestId);
      fireEvent.click(editButton);

      expect(screen.getByTestId("card-modal-backdrop")).toBeTruthy();
      expect(screen.getByTestId("card-edit-modal")).toBeTruthy();
    });

    it("should display all editable fields in modal", () => {
      const item = config.createComponent(config.sampleItem, 0, updateSpy);
      render(item.render(), container);

      const editButton = screen.getByTestId(config.editButtonTestId);
      fireEvent.click(editButton);

      // Verify all fields are present with correct values
      Object.entries(config.fieldTestIds).forEach(([fieldKey, testId]) => {
        const field = screen.getByTestId(testId) as HTMLInputElement;
        const expectedValue = config.fieldValues[fieldKey];
        expect(field.value).toBe(String(expectedValue));
      });
    });

    it("should update item when changes are confirmed", () => {
      const item = config.createComponent(config.sampleItem, 0, updateSpy);
      render(item.render(), container);

      const editButton = screen.getByTestId(config.editButtonTestId);
      fireEvent.click(editButton);

      // Update fields
      Object.entries(config.updatedFieldValues).forEach(([fieldKey, newValue]) => {
        const testId = config.fieldTestIds[fieldKey];
        const field = screen.getByTestId(testId) as HTMLInputElement;
        fireEvent.input(field, { target: { value: String(newValue) } });
      });

      const confirmButton = screen.getByTestId("card-modal-confirm");
      fireEvent.click(confirmButton);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      const updatedItem = (updateSpy as any).mock.calls[0][0];

      // Verify updated values
      const expectedValues = config.expectedUpdateTransform
        ? config.expectedUpdateTransform(config.updatedFieldValues)
        : config.updatedFieldValues;

      Object.entries(expectedValues).forEach(([key, value]) => {
        expect(updatedItem[key]).toBe(value);
      });
    });

    it("should not update item when cancelled", () => {
      const item = config.createComponent(config.sampleItem, 0, updateSpy);
      render(item.render(), container);

      const editButton = screen.getByTestId(config.editButtonTestId);
      fireEvent.click(editButton);

      // Make a change
      const firstFieldTestId = Object.values(config.fieldTestIds)[0];
      const field = screen.getByTestId(firstFieldTestId) as HTMLInputElement;
      fireEvent.input(field, { target: { value: "Changed Value" } });

      const cancelButton = screen.getByTestId("card-modal-cancel");
      fireEvent.click(cancelButton);

      expect(updateSpy).not.toHaveBeenCalled();
      expect(screen.queryByTestId("card-modal-backdrop")).toBeNull();
    });
  });

  describe(`${config.componentName} - Delete Functionality`, () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.innerHTML = "";
    });

    it("shows delete button when onDelete callback is provided", () => {
      const onDelete = vi.fn();
      const item = config.createComponent(config.sampleItem, 0, undefined, onDelete);
      render(item.render(), container);

      const deleteButton = screen.queryByTestId(config.deleteButtonTestId);
      expect(deleteButton).toBeTruthy();
    });

    it("does not show delete button when onDelete callback is not provided", () => {
      const item = config.createComponent(config.sampleItem, 0);
      render(item.render(), container);

      const deleteButton = screen.queryByTestId(config.deleteButtonTestId);
      expect(deleteButton).toBeNull();
    });

    it("calls onDelete callback when delete button is clicked", () => {
      const onDelete = vi.fn();
      const item = config.createComponent(config.sampleItem, 0, undefined, onDelete);
      render(item.render(), container);

      const deleteButton = screen.getByTestId(config.deleteButtonTestId);
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });
}
