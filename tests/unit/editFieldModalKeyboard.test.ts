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

  describe("Keyboard Navigation", () => {
    it("should confirm on Enter key", () => {
      const onConfirm = vi.fn();
      const modal = new EditFieldModal({
        fieldType: "currentXp",
        currentValue: 5,
        onConfirm,
        onCancel: vi.fn(),
      });

      render(modal.render(), container);

      const input = container.querySelector('[data-testid="edit-modal-input"]') as HTMLInputElement;

      input.value = "10";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      const enterEvent = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
      container.querySelector('[data-testid="modal-backdrop"]')?.dispatchEvent(enterEvent);

      expect(onConfirm).toHaveBeenCalledWith(10);
    });

    it("should cancel on Escape key", () => {
      const onCancel = vi.fn();
      const modal = new EditFieldModal({
        fieldType: "currentXp",
        currentValue: 5,
        onConfirm: vi.fn(),
        onCancel,
      });

      render(modal.render(), container);

      const escapeEvent = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
      container.querySelector('[data-testid="modal-backdrop"]')?.dispatchEvent(escapeEvent);

      expect(onCancel).toHaveBeenCalled();
    });

    it("should trap focus with Tab key - handler is called but on wrong element", () => {
      const modal = new EditFieldModal({
        fieldType: "currentXp",
        currentValue: 5,
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
      });

      render(modal.render(), container);

      const input = container.querySelector('[data-testid="edit-modal-input"]') as HTMLInputElement;

      input.focus();
      expect(document.activeElement).toBe(input);

      const tabEventFromInput = new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(tabEventFromInput);

      expect(tabEventFromInput.defaultPrevented).toBe(true);

      // jsdom does not move focus on Tab, so this passes even with the handler on
      // the backdrop; in a browser focus escapes before keydown bubbles that far.
      const modalContent = container.querySelector('[data-testid="edit-modal"]') as HTMLElement;
      expect(modalContent).toBeTruthy();
    });

    it("should have keydown handler on modal content for proper focus trapping", () => {
      const modal = new EditFieldModal({
        fieldType: "currentXp",
        currentValue: 5,
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
      });

      render(modal.render(), container);

      const modalContent = container.querySelector('[data-testid="edit-modal"]') as HTMLElement;

      const externalButton = document.createElement("button");
      externalButton.textContent = "External";
      document.body.appendChild(externalButton);

      try {
        const input = container.querySelector(
          '[data-testid="edit-modal-input"]'
        ) as HTMLInputElement;
        input.focus();

        const tabEvent = new KeyboardEvent("keydown", {
          key: "Tab",
          bubbles: true,
          cancelable: true,
        });

        // The handler must sit on modalContent (role="dialog"), not the aria-hidden
        // backdrop, or focus escapes.
        modalContent.dispatchEvent(tabEvent);

        expect(tabEvent.defaultPrevented).toBe(true);
      } finally {
        document.body.removeChild(externalButton);
      }
    });
  });
});
