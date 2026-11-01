import { describe, it, expect, afterEach, vi } from "vitest";
import { isPhoneViewport, isWideLayout } from "@/utils/viewport";

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

describe("isWideLayout", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockMatchMedia(matchesLgAndUp: boolean): void {
    window.matchMedia = vi.fn(
      (query: string) =>
        ({
          matches: query === "(min-width: 64rem)" ? matchesLgAndUp : false,
          media: query,
        }) as unknown as MediaQueryList
    );
  }

  it("is true at or above Tailwind's lg breakpoint, where pairs render side by side", () => {
    mockMatchMedia(true);

    expect(isWideLayout()).toBe(true);
  });

  it("is false below the lg breakpoint, where pairs stack", () => {
    mockMatchMedia(false);

    expect(isWideLayout()).toBe(false);
  });
});
