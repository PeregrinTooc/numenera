import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { VersionNavigator } from "../../src/components/VersionNavigator";

describe("VersionNavigator", () => {
  let container: HTMLElement;
  let versionNavigator: VersionNavigator;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("Visibility", () => {
    it("should not render when there are no versions", () => {
      versionNavigator = new VersionNavigator({
        versionCount: 0,
        currentIndex: 0,
        onNavigateBackward: vi.fn(),
        onNavigateForward: vi.fn(),
      });

      versionNavigator.mount(container);

      const navigator = container.querySelector('[data-testid="version-navigator"]');
      expect(navigator).toBeNull();
    });

    it("should not render when there is only 1 version", () => {
      versionNavigator = new VersionNavigator({
        versionCount: 1,
        currentIndex: 0,
        onNavigateBackward: vi.fn(),
        onNavigateForward: vi.fn(),
      });

      versionNavigator.mount(container);

      const navigator = container.querySelector('[data-testid="version-navigator"]');
      expect(navigator).toBeNull();
    });

    it("should render when there are multiple versions", () => {
      versionNavigator = new VersionNavigator({
        versionCount: 3,
        currentIndex: 2,
        onNavigateBackward: vi.fn(),
        onNavigateForward: vi.fn(),
      });

      versionNavigator.mount(container);

      const navigator = container.querySelector('[data-testid="version-navigator"]');
      expect(navigator).toBeTruthy();
    });
  });

  describe("Version Counter", () => {
    it("should not render counter when there is only 1 version", () => {
      versionNavigator = new VersionNavigator({
        versionCount: 1,
        currentIndex: 0,
        onNavigateBackward: vi.fn(),
        onNavigateForward: vi.fn(),
      });

      versionNavigator.mount(container);

      const counter = container.querySelector('[data-testid="version-counter"]');
      expect(counter).toBeNull();
    });

    it("should display 'Version 3 of 5' when at version 3 of 5", () => {
      versionNavigator = new VersionNavigator({
        versionCount: 5,
        currentIndex: 2, // 0-based index, so version 3
        onNavigateBackward: vi.fn(),
        onNavigateForward: vi.fn(),
      });

      versionNavigator.mount(container);

      const counter = container.querySelector('[data-testid="version-counter"]');
      expect(counter?.textContent).toBe("Version 3 of 5");
    });

    it("should update counter when state changes", () => {
      versionNavigator = new VersionNavigator({
        versionCount: 3,
        currentIndex: 2,
        onNavigateBackward: vi.fn(),
        onNavigateForward: vi.fn(),
      });

      versionNavigator.mount(container);

      let counter = container.querySelector('[data-testid="version-counter"]');
      expect(counter?.textContent).toBe("Version 3 of 3");

      // Update state
      versionNavigator.update({
        versionCount: 3,
        currentIndex: 0,
        onNavigateBackward: vi.fn(),
        onNavigateForward: vi.fn(),
      });

      counter = container.querySelector('[data-testid="version-counter"]');
      expect(counter?.textContent).toBe("Version 1 of 3");
    });
  });

  describe("Navigation Arrows", () => {
    it("should not render arrows when there is only 1 version", () => {
      versionNavigator = new VersionNavigator({
        versionCount: 1,
        currentIndex: 0,
        onNavigateBackward: vi.fn(),
        onNavigateForward: vi.fn(),
      });

      versionNavigator.mount(container);

      const backwardArrow = container.querySelector(
        '[data-testid="version-nav-backward"]'
      ) as HTMLButtonElement;
      const forwardArrow = container.querySelector(
        '[data-testid="version-nav-forward"]'
      ) as HTMLButtonElement;

      expect(backwardArrow).toBeNull();
      expect(forwardArrow).toBeNull();
    });

    it("should disable backward arrow when at first version", () => {
      versionNavigator = new VersionNavigator({
        versionCount: 3,
        currentIndex: 0,
        onNavigateBackward: vi.fn(),
        onNavigateForward: vi.fn(),
      });

      versionNavigator.mount(container);

      const backwardArrow = container.querySelector(
        '[data-testid="version-nav-backward"]'
      ) as HTMLButtonElement;
      const forwardArrow = container.querySelector(
        '[data-testid="version-nav-forward"]'
      ) as HTMLButtonElement;

      expect(backwardArrow?.disabled).toBe(true);
      expect(forwardArrow?.disabled).toBe(false);
    });

    it("should disable forward arrow when at last version", () => {
      versionNavigator = new VersionNavigator({
        versionCount: 3,
        currentIndex: 2,
        onNavigateBackward: vi.fn(),
        onNavigateForward: vi.fn(),
      });

      versionNavigator.mount(container);

      const backwardArrow = container.querySelector(
        '[data-testid="version-nav-backward"]'
      ) as HTMLButtonElement;
      const forwardArrow = container.querySelector(
        '[data-testid="version-nav-forward"]'
      ) as HTMLButtonElement;

      expect(backwardArrow?.disabled).toBe(false);
      expect(forwardArrow?.disabled).toBe(true);
    });

    it("should enable both arrows when in the middle", () => {
      versionNavigator = new VersionNavigator({
        versionCount: 5,
        currentIndex: 2,
        onNavigateBackward: vi.fn(),
        onNavigateForward: vi.fn(),
      });

      versionNavigator.mount(container);

      const backwardArrow = container.querySelector(
        '[data-testid="version-nav-backward"]'
      ) as HTMLButtonElement;
      const forwardArrow = container.querySelector(
        '[data-testid="version-nav-forward"]'
      ) as HTMLButtonElement;

      expect(backwardArrow?.disabled).toBe(false);
      expect(forwardArrow?.disabled).toBe(false);
    });
  });

  describe("Navigation Events", () => {
    it("should call onNavigateBackward when backward arrow is clicked", () => {
      const onNavigateBackward = vi.fn();
      versionNavigator = new VersionNavigator({
        versionCount: 3,
        currentIndex: 2,
        onNavigateBackward,
        onNavigateForward: vi.fn(),
      });

      versionNavigator.mount(container);

      const backwardArrow = container.querySelector(
        '[data-testid="version-nav-backward"]'
      ) as HTMLButtonElement;
      backwardArrow.click();

      expect(onNavigateBackward).toHaveBeenCalledTimes(1);
    });

    it("should call onNavigateForward when forward arrow is clicked", () => {
      const onNavigateForward = vi.fn();
      versionNavigator = new VersionNavigator({
        versionCount: 3,
        currentIndex: 0,
        onNavigateBackward: vi.fn(),
        onNavigateForward,
      });

      versionNavigator.mount(container);

      const forwardArrow = container.querySelector(
        '[data-testid="version-nav-forward"]'
      ) as HTMLButtonElement;
      forwardArrow.click();

      expect(onNavigateForward).toHaveBeenCalledTimes(1);
    });

    it("should not call callback when clicking disabled backward arrow", () => {
      const onNavigateBackward = vi.fn();
      versionNavigator = new VersionNavigator({
        versionCount: 3,
        currentIndex: 0,
        onNavigateBackward,
        onNavigateForward: vi.fn(),
      });

      versionNavigator.mount(container);

      const backwardArrow = container.querySelector(
        '[data-testid="version-nav-backward"]'
      ) as HTMLButtonElement;
      backwardArrow.click();

      expect(onNavigateBackward).not.toHaveBeenCalled();
    });

    it("should not call callback when clicking disabled forward arrow", () => {
      const onNavigateForward = vi.fn();
      versionNavigator = new VersionNavigator({
        versionCount: 3,
        currentIndex: 2,
        onNavigateBackward: vi.fn(),
        onNavigateForward,
      });

      versionNavigator.mount(container);

      const forwardArrow = container.querySelector(
        '[data-testid="version-nav-forward"]'
      ) as HTMLButtonElement;
      forwardArrow.click();

      expect(onNavigateForward).not.toHaveBeenCalled();
    });
  });

  describe("Unmounting", () => {
    it("should remove element from DOM when unmounted", () => {
      versionNavigator = new VersionNavigator({
        versionCount: 3,
        currentIndex: 2,
        onNavigateBackward: vi.fn(),
        onNavigateForward: vi.fn(),
      });

      versionNavigator.mount(container);
      expect(container.querySelector('[data-testid="version-navigator"]')).toBeTruthy();

      versionNavigator.unmount();
      expect(container.querySelector('[data-testid="version-navigator"]')).toBeNull();
    });
  });
});
