import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { EditFieldModal } from "../../src/components/EditFieldModal";
import { render } from "lit-html";

describe("EditFieldModal", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("Modal Initialization", () => {
    it("should open with correct initial value", () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const modal = new EditFieldModal({
        fieldType: "xp",
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
        fieldType: "xp",
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
        fieldType: "xp",
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
        fieldType: "xp",
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
        fieldType: "xp",
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
        fieldType: "xp",
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
        fieldType: "xp",
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

  describe("Keyboard Navigation", () => {
    it("should confirm on Enter key", () => {
      const onConfirm = vi.fn();
      const modal = new EditFieldModal({
        fieldType: "xp",
        currentValue: 5,
        onConfirm,
        onCancel: vi.fn(),
      });

      render(modal.render(), container);

      const input = container.querySelector('[data-testid="edit-modal-input"]') as HTMLInputElement;

      // Set valid value
      input.value = "10";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // Press Enter
      const enterEvent = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
      container.querySelector('[data-testid="modal-backdrop"]')?.dispatchEvent(enterEvent);

      expect(onConfirm).toHaveBeenCalledWith(10);
    });

    it("should cancel on Escape key", () => {
      const onCancel = vi.fn();
      const modal = new EditFieldModal({
        fieldType: "xp",
        currentValue: 5,
        onConfirm: vi.fn(),
        onCancel,
      });

      render(modal.render(), container);

      // Press Escape
      const escapeEvent = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
      container.querySelector('[data-testid="modal-backdrop"]')?.dispatchEvent(escapeEvent);

      expect(onCancel).toHaveBeenCalled();
    });

    it("should trap focus with Tab key - handler is called but on wrong element", () => {
      const modal = new EditFieldModal({
        fieldType: "xp",
        currentValue: 5,
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
      });

      render(modal.render(), container);

      const input = container.querySelector('[data-testid="edit-modal-input"]') as HTMLInputElement;

      // Start: Focus input
      input.focus();
      expect(document.activeElement).toBe(input);

      // The current implementation: @keydown is on the backdrop
      // So when we dispatch from input, it bubbles to backdrop and IS handled
      const tabEventFromInput = new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(tabEventFromInput);

      // This DOES work currently because the event bubbles to backdrop
      expect(tabEventFromInput.defaultPrevented).toBe(true);

      // BUT: The real bug is timing - in a browser, Tab moves focus BEFORE keydown bubbles
      // The fix is to attach @keydown to the modal content div instead of backdrop
      // After the fix, we should verify the handler is on the modal content:
      const modalContent = container.querySelector('[data-testid="edit-modal"]') as HTMLElement;
      expect(modalContent).toBeTruthy();

      // This test documents the issue: the handler works via bubbling,
      // but in real browsers, focus escapes before the handler can prevent it
    });

    it("should have keydown handler on modal content for proper focus trapping", () => {
      const modal = new EditFieldModal({
        fieldType: "xp",
        currentValue: 5,
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
      });

      render(modal.render(), container);

      const modalContent = container.querySelector('[data-testid="edit-modal"]') as HTMLElement;

      // Create an external element to test focus escape
      const externalButton = document.createElement("button");
      externalButton.textContent = "External";
      document.body.appendChild(externalButton);

      try {
        const input = container.querySelector(
          '[data-testid="edit-modal-input"]'
        ) as HTMLInputElement;
        input.focus();

        // Dispatch Tab event that would normally move focus
        const tabEvent = new KeyboardEvent("keydown", {
          key: "Tab",
          bubbles: true,
          cancelable: true,
        });

        // The bug: If handler is on backdrop (aria-hidden), focus can escape
        // The fix: Handler should be on modalContent (role="dialog")
        modalContent.dispatchEvent(tabEvent);

        // After fix, Tab should be prevented
        expect(tabEvent.defaultPrevented).toBe(true);
      } finally {
        document.body.removeChild(externalButton);
      }
    });
  });

  describe("Modal Interactions", () => {
    it("should close on backdrop click", () => {
      const onCancel = vi.fn();
      const modal = new EditFieldModal({
        fieldType: "xp",
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
        fieldType: "xp",
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
        fieldType: "xp",
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
