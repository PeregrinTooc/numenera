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

  describe("Modal Initialization", () => {
    it("should open with correct initial value", () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const modal = new EditFieldModal({
        fieldType: "currentXp",
        currentValue: 5,
        onConfirm,
        onCancel,
      });

      render(modal.render(), container);

      const input = container.querySelector('[data-testid="edit-modal-input"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.value).toBe("5");
    });

    it("should display modal with backdrop", () => {
      const modal = new EditFieldModal({
        fieldType: "currentXp",
        currentValue: 5,
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
      });

      render(modal.render(), container);

      const backdrop = container.querySelector('[data-testid="modal-backdrop"]');
      const modalContent = container.querySelector('[data-testid="edit-modal"]');

      expect(backdrop).toBeTruthy();
      expect(modalContent).toBeTruthy();
    });
  });

  describe("Numeric Field Validation", () => {
    it("should validate numeric fields within min/max bounds", () => {
      const onConfirm = vi.fn();
      const modal = new EditFieldModal({
        fieldType: "currentXp",
        currentValue: 5,
        onConfirm,
        onCancel: vi.fn(),
      });

      render(modal.render(), container);

      const input = container.querySelector('[data-testid="edit-modal-input"]') as HTMLInputElement;
      const confirmButton = container.querySelector(
        '[data-testid="modal-confirm-button"]'
      ) as HTMLButtonElement;

      // Valid value
      input.value = "10";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(confirmButton.disabled).toBe(false);
    });

    it("should reject values below minimum", () => {
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

      // Below minimum (XP min is 0)
      input.value = "-1";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(confirmButton.disabled).toBe(true);
    });

    it("should reject values above maximum", () => {
      const modal = new EditFieldModal({
        fieldType: "effort",
        currentValue: 5,
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
      });

      render(modal.render(), container);

      const input = container.querySelector('[data-testid="edit-modal-input"]') as HTMLInputElement;
      const confirmButton = container.querySelector(
        '[data-testid="modal-confirm-button"]'
      ) as HTMLButtonElement;

      // Above maximum (effort max is 20)
      input.value = "25";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(confirmButton.disabled).toBe(true);
    });

    it("should reject non-integer numbers", () => {
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

      // Decimal value
      input.value = "5.5";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(confirmButton.disabled).toBe(true);
    });

    it("should reject empty input", () => {
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

      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(confirmButton.disabled).toBe(true);
    });

    it("should disable button for invalid input (validation logic)", () => {
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

      // Trigger invalid input (below minimum)
      input.value = "-1";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // Button should be disabled due to validation error
      expect(confirmButton.disabled).toBe(true);
    });
  });

  describe("Tier Validation", () => {
    it("should allow any tier input but constrain on confirm", () => {
      const onConfirm = vi.fn();
      const modal = new EditFieldModal({
        fieldType: "tier",
        currentValue: 3,
        onConfirm,
        onCancel: vi.fn(),
      });

      render(modal.render(), container);

      const input = container.querySelector('[data-testid="edit-modal-input"]') as HTMLInputElement;
      const confirmButton = container.querySelector(
        '[data-testid="modal-confirm-button"]'
      ) as HTMLButtonElement;

      // Tier field should always allow input (button never disabled)
      input.value = "4";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      expect(confirmButton.disabled).toBe(false);

      // Even out-of-range values don't disable button (constrained on confirm)
      input.value = "7";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      expect(confirmButton.disabled).toBe(false);

      // Confirm with out-of-range value - should constrain to 6
      confirmButton.click();
      expect(onConfirm).toHaveBeenCalledWith(6);

      // Test below minimum - need to dispatch input event to update internal state
      onConfirm.mockClear();
      input.value = "0";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      confirmButton.click();
      expect(onConfirm).toHaveBeenCalledWith(1);
    });
  });
});
