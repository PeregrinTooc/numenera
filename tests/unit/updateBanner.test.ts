import { describe, it, expect, vi } from "vitest";
import { render } from "lit-html";
import { UpdateBanner } from "@/components/UpdateBanner";

describe("UpdateBanner", () => {
  function renderBanner(onReload: () => void = () => {}): HTMLElement {
    const container = document.createElement("div");
    render(new UpdateBanner(onReload).render(), container);
    return container;
  }

  it("tells the user a newer version is available", () => {
    const banner = renderBanner().querySelector('[data-testid="update-banner"]');

    expect(banner?.textContent).toContain("A newer version is available");
  });

  it("is announced to screen readers", () => {
    const banner = renderBanner().querySelector('[data-testid="update-banner"]');

    expect(banner?.getAttribute("role")).toBe("status");
  });

  it("reloads into the newer version when the user asks", () => {
    const onReload = vi.fn();
    const button = renderBanner(onReload).querySelector<HTMLButtonElement>(
      '[data-testid="update-reload-button"]'
    );

    button?.click();

    expect(onReload).toHaveBeenCalledOnce();
  });
});
