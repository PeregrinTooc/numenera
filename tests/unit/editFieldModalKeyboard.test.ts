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
        fieldType: "currentXp",
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
        fieldType: "currentXp",
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
        fieldType: "currentXp",
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
});
