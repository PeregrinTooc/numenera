/**
 * Header component tests - window listener lifecycle
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { Header } from "../../src/components/Header.js";

describe("Header", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not register a window listener for export-handle-updated", () => {
    // A new Header is constructed on every field edit (see main.ts's
    // needsNewSheet check); a listener registered here and never removed
    // leaks one closure per edit.
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    new Header(vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn());

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "export-handle-updated",
      expect.any(Function)
    );
  });
});
