import { describe, it, expect, beforeEach } from "vitest";
import { render } from "lit-html";
import { SaveIndicator } from "@/components/SaveIndicator";

describe("SaveIndicator", () => {
  let indicator: SaveIndicator;

  beforeEach(() => {
    indicator = new SaveIndicator();
  });

  describe("render", () => {
    it("should not render when never saved", () => {
      // Verify component state rather than HTML parsing
      expect(indicator.hasTimestamp()).toBe(false);
      expect(indicator.getTimestamp()).toBeNull();
    });

    it("should render with timestamp when saved", () => {
      indicator.updateTimestamp("2:45:33 PM");

      // Verify component state
      expect(indicator.hasTimestamp()).toBe(true);
      expect(indicator.getTimestamp()).toBe("2:45:33 PM");
    });

    it("should have save-indicator testid", () => {
      indicator.updateTimestamp("2:45:33 PM");
      const result = indicator.render();
      const html = result.strings.join("");

      expect(html).toContain('data-testid="save-indicator"');
    });

    it("should have fixed position styling", () => {
      indicator.updateTimestamp("2:45:33 PM");
      const result = indicator.render();
      const html = result.strings.join("");

      expect(html).toContain("position: fixed");
      expect(html).toContain("bottom:");
      expect(html).toContain("right:");
    });

    it("should have subtle styling", () => {
      indicator.updateTimestamp("2:45:33 PM");
      const result = indicator.render();
      const html = result.strings.join("");

      expect(html).toContain("font-size: 0.75rem");
      expect(html).toContain("opacity:");
    });
  });

  describe("updateTimestamp", () => {
    it("should update timestamp and make indicator visible", () => {
      expect(indicator.hasTimestamp()).toBe(false);

      indicator.updateTimestamp("2:45:33 PM");

      expect(indicator.hasTimestamp()).toBe(true);
      expect(indicator.getTimestamp()).toBe("2:45:33 PM");
    });

    it("should update to new timestamp", () => {
      indicator.updateTimestamp("2:45:33 PM");
      expect(indicator.getTimestamp()).toBe("2:45:33 PM");

      indicator.updateTimestamp("3:00:00 PM");
      expect(indicator.getTimestamp()).toBe("3:00:00 PM");
    });
  });

  describe("getTimestamp", () => {
    it("should return null when never saved", () => {
      expect(indicator.getTimestamp()).toBeNull();
    });

    it("should return timestamp after update", () => {
      indicator.updateTimestamp("2:45:33 PM");
      expect(indicator.getTimestamp()).toBe("2:45:33 PM");
    });
  });

  describe("hasTimestamp", () => {
    it("should return false when never saved", () => {
      expect(indicator.hasTimestamp()).toBe(false);
    });

    it("should return true after update", () => {
      indicator.updateTimestamp("2:45:33 PM");
      expect(indicator.hasTimestamp()).toBe(true);
    });
  });

  describe("error state", () => {
    function renderToElement(): HTMLElement {
      const container = document.createElement("div");
      render(indicator.render(), container);
      return container.querySelector('[data-testid="save-indicator"]') as HTMLElement;
    }

    it("is visible as an alert with the storage-full text when the storage is full", () => {
      indicator.showError("quota");

      const element = renderToElement();

      expect(element.getAttribute("role")).toBe("alert");
      expect(element.style.display).not.toBe("none");
      expect(element.textContent).toContain("Storage is full");
    });

    it("shows the generic text for any other failure", () => {
      indicator.showError("unknown");

      expect(renderToElement().textContent).toContain("Changes could not be saved");
    });

    it("is visible even if nothing was ever saved", () => {
      indicator.showError("unknown");

      expect(indicator.hasError()).toBe(true);
      expect(renderToElement().style.display).not.toBe("none");
    });

    it("replaces the last-saved timestamp while in error", () => {
      indicator.updateTimestamp("2:45:33 PM");
      indicator.showError("unknown");

      expect(renderToElement().textContent).not.toContain("2:45:33 PM");
    });

    it("is cleared by the next successful save", () => {
      indicator.showError("quota");

      indicator.updateTimestamp("2:45:33 PM");

      const element = renderToElement();
      expect(indicator.hasError()).toBe(false);
      expect(element.getAttribute("role")).toBeNull();
      expect(element.textContent).toContain("2:45:33 PM");
    });
  });
});
