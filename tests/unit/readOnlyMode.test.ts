import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ReadOnlyModeManager } from "../../src/utils/readOnlyMode";

describe("ReadOnlyModeManager", () => {
  let container: HTMLElement;
  let manager: ReadOnlyModeManager;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    manager = new ReadOnlyModeManager();
  });

  afterEach(() => {
    manager.disable();
    document.body.removeChild(container);
  });

  describe("enable", () => {
    it("should disable all input elements", () => {
      const input = document.createElement("input");
      container.appendChild(input);

      manager.enable(container);

      expect(input.disabled).toBe(true);
    });

    it("should disable all textarea elements", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      manager.enable(container);

      expect(textarea.disabled).toBe(true);
    });

    it("should disable all button elements", () => {
      const button = document.createElement("button");
      container.appendChild(button);

      manager.enable(container);

      expect(button.disabled).toBe(true);
    });

    it("should disable all select elements", () => {
      const select = document.createElement("select");
      container.appendChild(select);

      manager.enable(container);

      expect(select.disabled).toBe(true);
    });

    it("should add visual indicator class to disabled elements", () => {
      const input = document.createElement("input");
      container.appendChild(input);

      manager.enable(container);

      expect(input.classList.contains("read-only-disabled")).toBe(true);
    });

    it("should handle nested elements", () => {
      const wrapper = document.createElement("div");
      const input = document.createElement("input");
      wrapper.appendChild(input);
      container.appendChild(wrapper);

      manager.enable(container);

      expect(input.disabled).toBe(true);
    });

    it("should not disable elements with data-read-only-exempt attribute", () => {
      const input = document.createElement("input");
      input.setAttribute("data-read-only-exempt", "true");
      container.appendChild(input);

      manager.enable(container);

      expect(input.disabled).toBe(false);
    });

    it("should track which elements were disabled", () => {
      const input = document.createElement("input");
      container.appendChild(input);

      manager.enable(container);

      expect(manager.isEnabled()).toBe(true);
    });
  });

  describe("disable", () => {
    it("should re-enable previously disabled inputs", () => {
      const input = document.createElement("input");
      container.appendChild(input);

      manager.enable(container);
      expect(input.disabled).toBe(true);

      manager.disable();
      expect(input.disabled).toBe(false);
    });

    it("should remove visual indicator class", () => {
      const input = document.createElement("input");
      container.appendChild(input);

      manager.enable(container);
      expect(input.classList.contains("read-only-disabled")).toBe(true);

      manager.disable();
      expect(input.classList.contains("read-only-disabled")).toBe(false);
    });

    it("should not enable elements that were already disabled", () => {
      const input = document.createElement("input");
      input.disabled = true;
      container.appendChild(input);

      manager.enable(container);
      manager.disable();

      expect(input.disabled).toBe(true);
    });

    it("should clear tracked elements", () => {
      const input = document.createElement("input");
      container.appendChild(input);

      manager.enable(container);
      manager.disable();

      expect(manager.isEnabled()).toBe(false);
    });
  });

  describe("isEnabled", () => {
    it("should return false by default", () => {
      expect(manager.isEnabled()).toBe(false);
    });

    it("should return true after enabling", () => {
      const input = document.createElement("input");
      container.appendChild(input);

      manager.enable(container);

      expect(manager.isEnabled()).toBe(true);
    });

    it("should return false after disabling", () => {
      const input = document.createElement("input");
      container.appendChild(input);

      manager.enable(container);
      manager.disable();

      expect(manager.isEnabled()).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle empty container", () => {
      expect(() => manager.enable(container)).not.toThrow();
    });

    it("should handle multiple enable calls", () => {
      const input = document.createElement("input");
      container.appendChild(input);

      manager.enable(container);
      manager.enable(container);

      expect(input.disabled).toBe(true);
    });

    it("should handle disable without enable", () => {
      expect(() => manager.disable()).not.toThrow();
    });

    it("should handle elements added after enable", () => {
      manager.enable(container);

      const input = document.createElement("input");
      container.appendChild(input);

      // New element should not be automatically disabled
      expect(input.disabled).toBe(false);
    });
  });
});
