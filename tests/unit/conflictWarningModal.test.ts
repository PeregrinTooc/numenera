import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConflictWarningModal } from "../../src/components/ConflictWarningModal";
import type { ConflictDetail } from "../../src/services/conflictDetectionService";

describe("ConflictWarningModal", () => {
  let container: HTMLElement;
  let modal: ConflictWarningModal;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    modal?.close();
    container.remove();
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should create without showing modal", () => {
      modal = new ConflictWarningModal(container);

      expect(modal.isVisible()).toBe(false);
      expect(container.querySelector('[data-testid="conflict-modal"]')).toBeNull();
    });

    it("should listen for version-conflict events", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");

      modal = new ConflictWarningModal(container);

      expect(addEventListenerSpy).toHaveBeenCalledWith("version-conflict", expect.any(Function));
    });

    it("should listen for newer-version-available events", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");

      modal = new ConflictWarningModal(container);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "newer-version-available",
        expect.any(Function)
      );
    });
  });

  describe("conflict modal", () => {
    it("should show modal when version-conflict event is dispatched", () => {
      modal = new ConflictWarningModal(container);
      const resolveHandler = vi.fn();

      const conflictEvent = new CustomEvent<ConflictDetail>("version-conflict", {
        detail: {
          localEtag: "local-etag",
          remoteEtag: "remote-etag",
          timestamp: Date.now(),
          resolve: resolveHandler,
        },
      });

      window.dispatchEvent(conflictEvent);

      expect(modal.isVisible()).toBe(true);
      expect(container.querySelector('[data-testid="conflict-modal"]')).not.toBeNull();
    });

    it("should have correct modal structure", () => {
      modal = new ConflictWarningModal(container);
      const resolveHandler = vi.fn();

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            timestamp: Date.now(),
            resolve: resolveHandler,
          },
        })
      );

      const modalElement = container.querySelector('[data-testid="conflict-modal"]');
      expect(modalElement).not.toBeNull();
      expect(modalElement?.getAttribute("role")).toBe("dialog");
      expect(modalElement?.getAttribute("aria-modal")).toBe("true");
      expect(modalElement?.getAttribute("aria-labelledby")).toBe("conflict-modal-title");
    });

    it("should have load remote button", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            timestamp: Date.now(),
            resolve: vi.fn(),
          },
        })
      );

      const loadButton = container.querySelector('[data-testid="conflict-load-remote"]');
      expect(loadButton).not.toBeNull();
    });

    it("should have save local button", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            timestamp: Date.now(),
            resolve: vi.fn(),
          },
        })
      );

      const saveButton = container.querySelector('[data-testid="conflict-save-local"]');
      expect(saveButton).not.toBeNull();
    });

    it("should call resolve with load-remote when load button clicked", () => {
      modal = new ConflictWarningModal(container);
      const resolveHandler = vi.fn();

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            timestamp: Date.now(),
            resolve: resolveHandler,
          },
        })
      );

      const loadButton = container.querySelector(
        '[data-testid="conflict-load-remote"]'
      ) as HTMLButtonElement;
      loadButton.click();

      expect(resolveHandler).toHaveBeenCalledWith("load-remote");
    });

    it("should call resolve with save-local when save button clicked", () => {
      modal = new ConflictWarningModal(container);
      const resolveHandler = vi.fn();

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            timestamp: Date.now(),
            resolve: resolveHandler,
          },
        })
      );

      const saveButton = container.querySelector(
        '[data-testid="conflict-save-local"]'
      ) as HTMLButtonElement;
      saveButton.click();

      expect(resolveHandler).toHaveBeenCalledWith("save-local");
    });

    it("should close modal after resolving conflict", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            timestamp: Date.now(),
            resolve: vi.fn(),
          },
        })
      );

      expect(modal.isVisible()).toBe(true);

      const loadButton = container.querySelector(
        '[data-testid="conflict-load-remote"]'
      ) as HTMLButtonElement;
      loadButton.click();

      expect(modal.isVisible()).toBe(false);
    });

    it("should resolve with load-remote on Escape key", () => {
      modal = new ConflictWarningModal(container);
      const resolveHandler = vi.fn();

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            timestamp: Date.now(),
            resolve: resolveHandler,
          },
        })
      );

      const modalElement = container.querySelector('[data-testid="conflict-modal"]');
      const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
      modalElement?.dispatchEvent(escapeEvent);

      expect(resolveHandler).toHaveBeenCalledWith("load-remote");
    });

    it("should focus first button when modal opens", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            timestamp: Date.now(),
            resolve: vi.fn(),
          },
        })
      );

      const loadButton = container.querySelector('[data-testid="conflict-load-remote"]');
      expect(document.activeElement).toBe(loadButton);
    });

    it("should remove existing modal before showing new one", () => {
      modal = new ConflictWarningModal(container);

      // Show first modal
      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-1",
            remoteEtag: "remote-1",
            timestamp: Date.now(),
            resolve: vi.fn(),
          },
        })
      );

      expect(container.querySelectorAll('[data-testid="conflict-modal"]').length).toBe(1);

      // Show second modal
      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-2",
            remoteEtag: "remote-2",
            timestamp: Date.now(),
            resolve: vi.fn(),
          },
        })
      );

      // Should still only have one modal
      expect(container.querySelectorAll('[data-testid="conflict-modal"]').length).toBe(1);
    });
  });

  describe("newer version banner", () => {
    it("should show banner when newer-version-available event is dispatched", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: "new-etag",
            timestamp: Date.now(),
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
            timestamp: Date.now(),
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
            timestamp: Date.now(),
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
            timestamp: Date.now(),
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
            timestamp: Date.now(),
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
            timestamp: Date.now(),
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
            timestamp: Date.now(),
          },
        })
      );

      expect(container.querySelectorAll('[data-testid="newer-version-banner"]').length).toBe(1);

      // Show second banner
      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: "etag-2",
            timestamp: Date.now(),
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
            timestamp: Date.now(),
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
            timestamp: Date.now(),
          },
        })
      );

      expect(container.firstChild?.nodeName).toBe("DIV");
      expect((container.firstChild as HTMLElement).getAttribute("data-testid")).toBe(
        "newer-version-banner"
      );
    });
  });

  describe("close", () => {
    it("should remove modal from DOM", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            timestamp: Date.now(),
            resolve: vi.fn(),
          },
        })
      );

      expect(container.querySelector('[data-testid="conflict-modal"]')).not.toBeNull();

      modal.close();

      expect(container.querySelector('[data-testid="conflict-modal"]')).toBeNull();
    });

    it("should update isVisible state", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            timestamp: Date.now(),
            resolve: vi.fn(),
          },
        })
      );

      expect(modal.isVisible()).toBe(true);

      modal.close();

      expect(modal.isVisible()).toBe(false);
    });

    it("should be safe to call close multiple times", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            timestamp: Date.now(),
            resolve: vi.fn(),
          },
        })
      );

      // Multiple close calls should not throw
      expect(() => {
        modal.close();
        modal.close();
        modal.close();
      }).not.toThrow();
    });
  });

  describe("isVisible", () => {
    it("should return false when modal is not shown", () => {
      modal = new ConflictWarningModal(container);

      expect(modal.isVisible()).toBe(false);
    });

    it("should return true when modal is shown", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            timestamp: Date.now(),
            resolve: vi.fn(),
          },
        })
      );

      expect(modal.isVisible()).toBe(true);
    });

    it("should return false after modal is closed", () => {
      modal = new ConflictWarningModal(container);

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            timestamp: Date.now(),
            resolve: vi.fn(),
          },
        })
      );

      modal.close();

      expect(modal.isVisible()).toBe(false);
    });
  });
});
