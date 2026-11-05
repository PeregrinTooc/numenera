import { describe, it, expect, beforeEach } from "vitest";
import { render } from "lit-html";
import { SaveIndicator } from "@/components/SaveIndicator";

describe("SaveIndicator", () => {
  let indicator: SaveIndicator;

  beforeEach(() => {
    indicator = new SaveIndicator();
  });

  function renderToElement(): HTMLElement {
    const container = document.createElement("div");
    render(indicator.render(), container);
    return container.querySelector('[data-testid="save-indicator"]') as HTMLElement;
  }

  describe("render", () => {
    it("is hidden when never saved", () => {
      expect(renderToElement().getAttribute("style")).toContain("display: none");
    });

    it("shows the timestamp when saved", () => {
      indicator.updateTimestamp("2:45:33 PM");

      const element = renderToElement();
      expect(element.getAttribute("style")).toContain("display: block");
      expect(element.textContent).toContain("2:45:33 PM");
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
    it("replaces the shown timestamp with the new one", () => {
      indicator.updateTimestamp("2:45:33 PM");
      indicator.updateTimestamp("3:00:00 PM");

      const text = renderToElement().textContent;
      expect(text).toContain("3:00:00 PM");
      expect(text).not.toContain("2:45:33 PM");
    });
  });

  describe("error state", () => {
    it("is visible as an alert with the storage-full text when the storage is full", () => {
      indicator.showError("quota");

      const element = renderToElement();

      expect(element.getAttribute("role")).toBe("alert");
      expect(element.getAttribute("style")).toContain("display: block");
      expect(element.textContent).toContain("Storage is full");
    });

    it("shows the generic text for any other failure", () => {
      indicator.showError("unknown");

      expect(renderToElement().textContent).toContain("Changes could not be saved");
    });

    it("is visible even if nothing was ever saved", () => {
      indicator.showError("unknown");

      expect(renderToElement().getAttribute("style")).toContain("display: block");
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
      expect(element.getAttribute("role")).toBeNull();
      expect(element.textContent).toContain("2:45:33 PM");
    });
  });
});
