import { describe, it, expect, beforeEach, vi } from "vitest";
import { EditFieldModal } from "@/components/EditFieldModal";
import { render } from "lit-html";
import { setupTestContainer } from "./helpers/testSetup.js";

describe("EditFieldModal", () => {
  const getContainer = setupTestContainer();
  let container: HTMLElement;

  beforeEach(() => {
    container = getContainer();
  });

  describe("Modal Interactions", () => {
    it("should close on backdrop click", () => {
      const onCancel = vi.fn();
      const modal = new EditFieldModal({
        fieldType: "currentXp",
        currentValue: 5,
        onConfirm: vi.fn(),
        onCancel,
      });

      render(modal.render(), container);

      const backdrop = container.querySelector('[data-testid="modal-backdrop"]') as HTMLElement;

      // Create click event on backdrop itself
      const clickEvent = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(clickEvent, "target", { value: backdrop, enumerable: true });
      Object.defineProperty(clickEvent, "currentTarget", { value: backdrop, enumerable: true });

      backdrop.dispatchEvent(clickEvent);

      expect(onCancel).toHaveBeenCalled();
    });

    it("should not close on modal content click", () => {
      const onCancel = vi.fn();
      const modal = new EditFieldModal({
        fieldType: "currentXp",
        currentValue: 5,
        onConfirm: vi.fn(),
        onCancel,
      });

      render(modal.render(), container);

      const modalContent = container.querySelector('[data-testid="edit-modal"]') as HTMLElement;

      // Click on modal content
      modalContent.click();

      expect(onCancel).not.toHaveBeenCalled();
    });

    it("should enable confirm button only with valid input", () => {
      const modal = new EditFieldModal({
        fieldType: "currentXp",
        currentValue: 5,
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
      });

      render(modal.render(), container);

      const input = container.querySelector('[data-testid="edit-modal-input"]') as HTMLInputElement;
      const confirmButton = container.querySelector(
        '[data-testid="modal-confirm-button"]'
      ) as HTMLButtonElement;

      // Initially should be enabled (valid initial value)
      expect(confirmButton.disabled).toBe(false);

      // Make invalid
      input.value = "-1";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(confirmButton.disabled).toBe(true);

      // Make valid again
      input.value = "10";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(confirmButton.disabled).toBe(false);
    });
  });

  describe("Text Field Validation", () => {
    it("should validate text fields", () => {
      const onConfirm = vi.fn();
      const modal = new EditFieldModal({
        fieldType: "name",
        currentValue: "Test Character",
        onConfirm,
        onCancel: vi.fn(),
      });

      render(modal.render(), container);

      const input = container.querySelector('[data-testid="edit-modal-input"]') as HTMLInputElement;
      const confirmButton = container.querySelector(
        '[data-testid="modal-confirm-button"]'
      ) as HTMLButtonElement;

      // Valid text
      input.value = "New Name";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(confirmButton.disabled).toBe(false);

      // Confirm
      confirmButton.click();

      expect(onConfirm).toHaveBeenCalledWith("New Name");
    });

    it("should trim text field values on confirm", () => {
      const onConfirm = vi.fn();
      const modal = new EditFieldModal({
        fieldType: "name",
        currentValue: "Test",
        onConfirm,
        onCancel: vi.fn(),
      });

      render(modal.render(), container);

      const input = container.querySelector('[data-testid="edit-modal-input"]') as HTMLInputElement;
      const confirmButton = container.querySelector(
        '[data-testid="modal-confirm-button"]'
      ) as HTMLButtonElement;

      input.value = "  Spaced Name  ";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      confirmButton.click();

      expect(onConfirm).toHaveBeenCalledWith("Spaced Name");
    });
  });
});
