import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ManualClock } from "@/services/manualClock";
import { ConflictWarningModal } from "@/components/ConflictWarningModal";
import type { ConflictDetail } from "@/services/conflictDetectionService";
import { t } from "@/i18n/index";
import { createTestCharacter } from "../factories/character";
import { setupTestContainer } from "./helpers/testSetup.js";

describe("ConflictWarningModal", () => {
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

  describe("initialization", () => {
    it("should create without showing modal", () => {
      modal = new ConflictWarningModal(container, new ManualClock());

      expect(modal.isVisible()).toBe(false);
      expect(container.querySelector('[data-testid="conflict-modal"]')).toBeNull();
    });

    it("should react to version-conflict events dispatched on window", () => {
      modal = new ConflictWarningModal(container, new ManualClock());
      expect(modal.isVisible()).toBe(false);

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
            resolve: vi.fn(),
          },
        })
      );

      expect(modal.isVisible()).toBe(true);
    });

    it("should show a newer-version banner, not the conflict modal, on newer-version-available", () => {
      modal = new ConflictWarningModal(container, new ManualClock());

      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: { etag: "etag", timestamp: Date.now() },
        })
      );

      const banner = container.querySelector('[data-testid="newer-version-banner"]');
      expect(banner?.textContent).toContain(t("conflict.newerVersionAvailable"));
      expect(modal.isVisible()).toBe(false);
    });
  });

  describe("conflict modal", () => {
    it("should show modal when version-conflict event is dispatched", () => {
      modal = new ConflictWarningModal(container, new ManualClock());
      const resolveHandler = vi.fn();

      const conflictEvent = new CustomEvent<ConflictDetail>("version-conflict", {
        detail: {
          localEtag: "local-etag",
          remoteEtag: "remote-etag",
          remoteTimestamp: Date.now(),
          localCharacter: createTestCharacter(),
          resolve: resolveHandler,
        },
      });

      window.dispatchEvent(conflictEvent);

      expect(modal.isVisible()).toBe(true);
      expect(container.querySelector('[data-testid="conflict-modal"]')).not.toBeNull();
    });

    it("should have correct modal structure", () => {
      modal = new ConflictWarningModal(container, new ManualClock());
      const resolveHandler = vi.fn();

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
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
      modal = new ConflictWarningModal(container, new ManualClock());

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
            resolve: vi.fn(),
          },
        })
      );

      const loadButton = container.querySelector('[data-testid="conflict-load-remote"]');
      expect(loadButton).not.toBeNull();
    });

    it("should have save local button", () => {
      modal = new ConflictWarningModal(container, new ManualClock());

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
            resolve: vi.fn(),
          },
        })
      );

      const saveButton = container.querySelector('[data-testid="conflict-save-local"]');
      expect(saveButton).not.toBeNull();
    });

    it("should call resolve with load-remote when load button clicked", () => {
      modal = new ConflictWarningModal(container, new ManualClock());
      const resolveHandler = vi.fn();

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
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
      modal = new ConflictWarningModal(container, new ManualClock());
      const resolveHandler = vi.fn();

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
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
      modal = new ConflictWarningModal(container, new ManualClock());

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
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
      modal = new ConflictWarningModal(container, new ManualClock());
      const resolveHandler = vi.fn();

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
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
      modal = new ConflictWarningModal(container, new ManualClock());

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-etag",
            remoteEtag: "remote-etag",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
            resolve: vi.fn(),
          },
        })
      );

      const loadButton = container.querySelector('[data-testid="conflict-load-remote"]');
      expect(document.activeElement).toBe(loadButton);
    });

    it("should remove existing modal before showing new one", () => {
      modal = new ConflictWarningModal(container, new ManualClock());

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-1",
            remoteEtag: "remote-1",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
            resolve: vi.fn(),
          },
        })
      );

      expect(container.querySelectorAll('[data-testid="conflict-modal"]').length).toBe(1);

      window.dispatchEvent(
        new CustomEvent<ConflictDetail>("version-conflict", {
          detail: {
            localEtag: "local-2",
            remoteEtag: "remote-2",
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
            resolve: vi.fn(),
          },
        })
      );

      expect(container.querySelectorAll('[data-testid="conflict-modal"]').length).toBe(1);
    });
  });
});
