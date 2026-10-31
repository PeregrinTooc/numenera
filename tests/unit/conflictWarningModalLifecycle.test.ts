import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConflictWarningModal } from "@/components/ConflictWarningModal";
import type { ConflictDetail } from "@/services/conflictDetectionService";
import { createTestCharacter } from "../factories/character";
import { setupTestContainer } from "./helpers/testSetup.js";

describe("ConflictWarningModal lifecycle", () => {
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

  describe("close", () => {
    it("should remove modal from DOM", () => {
      modal = new ConflictWarningModal(container);

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
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
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
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
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
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
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
            remoteTimestamp: Date.now(),
            localCharacter: createTestCharacter(),
            resolve: vi.fn(),
          },
        })
      );

      modal.close();

      expect(modal.isVisible()).toBe(false);
    });
  });
});
