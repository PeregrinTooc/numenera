import { describe, it, expect, afterEach, vi } from "vitest";
import { isPhoneViewport } from "../../src/utils/viewport";

describe("isPhoneViewport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockMatchMedia(matchesMdAndUp: boolean): void {
    // jsdom doesn't implement matchMedia at all, so there's nothing for
    // vi.spyOn to wrap - assign the property directly instead.
    window.matchMedia = vi.fn(
      (query: string) =>
        ({
          matches: query.includes("768px") ? matchesMdAndUp : false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList
    );
  }

  it("returns true below the md breakpoint (phones: Pixel 5 / iPhone 12 widths)", () => {
    mockMatchMedia(false);

    expect(isPhoneViewport()).toBe(true);
  });

  it("returns false at or above the md breakpoint (tablets and desktop, e.g. iPad Pro)", () => {
    mockMatchMedia(true);

    expect(isPhoneViewport()).toBe(false);
  });
});
