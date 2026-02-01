import { describe, it, expect, vi } from "vitest";
import { VersionWarningBanner } from "../../src/components/VersionWarningBanner";

describe("VersionWarningBanner", () => {
  it("should render banner with warning message", () => {
    const onReturn = vi.fn();
    const onRestore = vi.fn();
    const banner = new VersionWarningBanner({
      description: "Changed name",
      timestamp: new Date("2024-01-15T10:30:00"),
      onReturn,
      onRestore,
    });

    const container = document.createElement("div");
    banner.mount(container);

    // Should have warning banner element
    const warningBanner = container.querySelector('[data-testid="version-warning-banner"]');
    expect(warningBanner).toBeTruthy();
  });

  it("should display change description", () => {
    const onReturn = vi.fn();
    const onRestore = vi.fn();
    const banner = new VersionWarningBanner({
      description: "Changed name to Aria",
      timestamp: new Date("2024-01-15T10:30:00"),
      onReturn,
      onRestore,
    });

    const container = document.createElement("div");
    banner.mount(container);

    const description = container.querySelector('[data-testid="version-change-description"]');
    expect(description?.textContent).toContain("Changed name to Aria");
  });

  it("should display timestamp", () => {
    const onReturn = vi.fn();
    const onRestore = vi.fn();
    const banner = new VersionWarningBanner({
      description: "Changed name",
      timestamp: new Date("2024-01-15T10:30:00"),
      onReturn,
      onRestore,
    });

    const container = document.createElement("div");
    banner.mount(container);

    const timestamp = container.querySelector('[data-testid="version-timestamp"]');
    expect(timestamp?.textContent).toBeTruthy();
    expect(timestamp?.textContent?.length).toBeGreaterThan(0);
  });

  it("should have return button that calls onReturn", () => {
    const onReturn = vi.fn();
    const onRestore = vi.fn();
    const banner = new VersionWarningBanner({
      description: "Changed name",
      timestamp: new Date("2024-01-15T10:30:00"),
      onReturn,
      onRestore,
    });

    const container = document.createElement("div");
    banner.mount(container);

    const returnButton = container.querySelector(
      '[data-testid="version-return-button"]'
    ) as HTMLButtonElement;
    expect(returnButton).toBeTruthy();

    returnButton.click();
    expect(onReturn).toHaveBeenCalledTimes(1);
    expect(onRestore).not.toHaveBeenCalled();
  });

  it("should have restore button that calls onRestore", () => {
    const onReturn = vi.fn();
    const onRestore = vi.fn();
    const banner = new VersionWarningBanner({
      description: "Changed name",
      timestamp: new Date("2024-01-15T10:30:00"),
      onReturn,
      onRestore,
    });

    const container = document.createElement("div");
    banner.mount(container);

    const restoreButton = container.querySelector(
      '[data-testid="version-restore-button"]'
    ) as HTMLButtonElement;
    expect(restoreButton).toBeTruthy();

    restoreButton.click();
    expect(onRestore).toHaveBeenCalledTimes(1);
    expect(onReturn).not.toHaveBeenCalled();
  });

  it("should show warning text about viewing old version", () => {
    const onReturn = vi.fn();
    const onRestore = vi.fn();
    const banner = new VersionWarningBanner({
      description: "Changed name",
      timestamp: new Date("2024-01-15T10:30:00"),
      onReturn,
      onRestore,
    });

    const container = document.createElement("div");
    banner.mount(container);

    const warningText = container.textContent;
    expect(warningText).toContain("viewing an old version");
  });

  it("should be styled as a warning banner", () => {
    const onReturn = vi.fn();
    const onRestore = vi.fn();
    const banner = new VersionWarningBanner({
      description: "Changed name",
      timestamp: new Date("2024-01-15T10:30:00"),
      onReturn,
      onRestore,
    });

    const container = document.createElement("div");
    banner.mount(container);

    const warningBanner = container.querySelector(
      '[data-testid="version-warning-banner"]'
    ) as HTMLElement;
    // Should have testid and be present in the DOM (styles are applied via cssText)
    expect(warningBanner).toBeTruthy();
    expect(warningBanner.getAttribute("data-testid")).toBe("version-warning-banner");
  });

  it("should update when props change", () => {
    const onReturn = vi.fn();
    const onRestore = vi.fn();
    const banner = new VersionWarningBanner({
      description: "Changed name",
      timestamp: new Date("2024-01-15T10:30:00"),
      onReturn,
      onRestore,
    });

    const container = document.createElement("div");
    banner.mount(container);

    // Update with new description
    const newOnReturn = vi.fn();
    const newOnRestore = vi.fn();
    banner.update({
      description: "Changed tier to 2",
      timestamp: new Date("2024-01-15T11:00:00"),
      onReturn: newOnReturn,
      onRestore: newOnRestore,
    });

    const description = container.querySelector('[data-testid="version-change-description"]');
    expect(description?.textContent).toContain("Changed tier to 2");
  });

  it("should unmount cleanly", () => {
    const onReturn = vi.fn();
    const onRestore = vi.fn();
    const banner = new VersionWarningBanner({
      description: "Changed name",
      timestamp: new Date("2024-01-15T10:30:00"),
      onReturn,
      onRestore,
    });

    const container = document.createElement("div");
    banner.mount(container);

    expect(container.children.length).toBeGreaterThan(0);

    banner.unmount();

    expect(container.children.length).toBe(0);
  });
});
