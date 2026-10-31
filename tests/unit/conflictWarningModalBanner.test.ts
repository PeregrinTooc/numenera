import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConflictWarningModal } from "@/components/ConflictWarningModal";
import { createTestCharacter } from "../factories/character";
import { setupTestContainer } from "./helpers/testSetup.js";

describe("ConflictWarningModal newer version banner", () => {
  const getContainer = setupTestContainer();
  let container: HTMLElement;
  let modal: ConflictWarningModal;

  beforeEach(() => {
    container = getContainer();
  });

  afterEach(() => {
    modal?.close();
    vi.restoreAllMocks();
  });

  describe("newer version banner", () => {
    it("should show banner when newer-version-available event is dispatched", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: "new-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
            characterName: "Test Character",
          },
        })
      );

      const banner = container.querySelector('[data-testid="newer-version-banner"]');
      expect(banner).not.toBeNull();
    });

    it("should have correct banner structure", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: "new-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
            characterName: "Test Character",
          },
        })
      );

      const banner = container.querySelector('[data-testid="newer-version-banner"]');
      expect(banner?.getAttribute("role")).toBe("alert");
    });

    it("should have reload button", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: "new-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
          },
        })
      );

      const reloadButton = container.querySelector('[data-testid="newer-version-reload"]');
      expect(reloadButton).not.toBeNull();
    });

    it("should have dismiss button", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: "new-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
          },
        })
      );

      const dismissButton = container.querySelector('[data-testid="newer-version-dismiss"]');
      expect(dismissButton).not.toBeNull();
    });

    it("should remove banner when dismiss button clicked", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: "new-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
          },
        })
      );

      expect(container.querySelector('[data-testid="newer-version-banner"]')).not.toBeNull();

      const dismissButton = container.querySelector(
        '[data-testid="newer-version-dismiss"]'
      ) as HTMLButtonElement;
      dismissButton.click();

      expect(container.querySelector('[data-testid="newer-version-banner"]')).toBeNull();
    });

    it("should reload page when reload button clicked", () => {
      modal = new ConflictWarningModal(container);
      const reloadMock = vi.fn();
      Object.defineProperty(window, "location", {
        value: { reload: reloadMock },
        writable: true,
      });

      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: "new-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
          },
        })
      );

      const reloadButton = container.querySelector(
        '[data-testid="newer-version-reload"]'
      ) as HTMLButtonElement;
      reloadButton.click();

      expect(reloadMock).toHaveBeenCalled();
    });

    it("should remove existing banner before showing new one", () => {
      modal = new ConflictWarningModal(container);

      // Show first banner
      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: "etag-1",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
          },
        })
      );

      expect(container.querySelectorAll('[data-testid="newer-version-banner"]').length).toBe(1);

      // Show second banner
      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: "etag-2",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
          },
        })
      );

      // Should still only have one banner
      expect(container.querySelectorAll('[data-testid="newer-version-banner"]').length).toBe(1);
    });

    it("should auto-dismiss banner after 10 seconds", () => {
      vi.useFakeTimers();
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: "new-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
          },
        })
      );

      expect(container.querySelector('[data-testid="newer-version-banner"]')).not.toBeNull();

      vi.advanceTimersByTime(10000);

      expect(container.querySelector('[data-testid="newer-version-banner"]')).toBeNull();

      vi.useRealTimers();
    });

    it("should insert banner at top of container", () => {
      modal = new ConflictWarningModal(container);
      const existingChild = document.createElement("div");
      existingChild.textContent = "Existing content";
      container.appendChild(existingChild);

      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: "new-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
          },
        })
      );

      expect(container.firstChild?.nodeName).toBe("DIV");
      expect((container.firstChild as HTMLElement).getAttribute("data-testid")).toBe(
        "newer-version-banner"
      );
    });
  });
});
