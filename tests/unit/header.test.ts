import { describe, it, expect, vi } from "vitest";
import { render } from "lit-html";
import { Header } from "@/components/Header";
import { setupTestContainer } from "./helpers/testSetup.js";

describe("Header", () => {
  const getContainer = setupTestContainer();

  it("ignores export-handle-updated on window; the remembered location comes only from the sheet", () => {
    // A new Header is constructed on every field edit (see main.ts's
    // needsNewSheet check); state must flow in through setHasRememberedLocation,
    // not through a window listener that would leak one closure per edit.
    const container = getContainer();
    const header = new Header(
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn()
    );
    render(header.render(), container);
    const before = container.innerHTML;

    window.dispatchEvent(new CustomEvent("export-handle-updated"));
    render(header.render(), container);

    expect(container.innerHTML).toBe(before);
  });
});
