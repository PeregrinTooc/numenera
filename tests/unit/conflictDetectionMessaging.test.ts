import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConflictDetectionService } from "@/services/conflictDetectionService";
import { createTestCharacter } from "../factories/character";
import {
  installMockBroadcastChannel,
  MockBroadcastChannel,
} from "../factories/mockBroadcastChannel";

describe("ConflictDetectionService messaging", () => {
  let restoreBroadcastChannel: () => void;

  beforeEach(() => {
    restoreBroadcastChannel = installMockBroadcastChannel();
  });

  afterEach(() => {
    restoreBroadcastChannel();
    vi.restoreAllMocks();
  });

  describe("conflict detection", () => {
    it("should emit version-conflict when receiving version-saved with dirty state", async () => {
      const service = new ConflictDetectionService();
      const mockChannel = MockBroadcastChannel.latest();
      const conflictHandler = vi.fn();

      window.addEventListener("version-conflict", conflictHandler);

      await service.setCurrentEtag(createTestCharacter({ name: "Original" }));
      service.markDirty(createTestCharacter({ name: "Local Changes" }));

      const message = {
        type: "version-saved",
        tabId: "other-tab-123",
        etag: "different-etag",
        timestamp: Date.now(),
        characterName: "Remote Character",
      };

      mockChannel.receive(message);

      expect(conflictHandler).toHaveBeenCalled();

      window.removeEventListener("version-conflict", conflictHandler);
      service.close();
    });

    it("should emit newer-version-available when receiving version-saved without dirty state", async () => {
      const service = new ConflictDetectionService();
      const mockChannel = MockBroadcastChannel.latest();
      const newerVersionHandler = vi.fn();

      window.addEventListener("newer-version-available", newerVersionHandler);

      await service.setCurrentEtag(createTestCharacter({ name: "Original" }));

      const message = {
        type: "version-saved",
        tabId: "other-tab-123",
        etag: "different-etag",
        timestamp: Date.now(),
        characterName: "Remote Character",
      };

      mockChannel.receive(message);

      expect(newerVersionHandler).toHaveBeenCalled();

      window.removeEventListener("newer-version-available", newerVersionHandler);
      service.close();
    });

    it("should ignore messages from same tab", async () => {
      const service = new ConflictDetectionService();
      const mockChannel = MockBroadcastChannel.latest();
      const tabId = mockChannel.tabId;
      const conflictHandler = vi.fn();
      const newerVersionHandler = vi.fn();

      window.addEventListener("version-conflict", conflictHandler);
      window.addEventListener("newer-version-available", newerVersionHandler);

      await service.setCurrentEtag(createTestCharacter({ name: "Original" }));
      service.markDirty(createTestCharacter({ name: "Local Changes" }));

      const message = {
        type: "version-saved",
        tabId: tabId,
        etag: "different-etag",
        timestamp: Date.now(),
        characterName: "Same Tab Character",
      };

      mockChannel.receive(message);

      expect(conflictHandler).not.toHaveBeenCalled();
      expect(newerVersionHandler).not.toHaveBeenCalled();

      window.removeEventListener("version-conflict", conflictHandler);
      window.removeEventListener("newer-version-available", newerVersionHandler);
      service.close();
    });

    it("should emit conflict when marking dirty with stale remote ETag", async () => {
      const service = new ConflictDetectionService();
      const mockChannel = MockBroadcastChannel.latest();
      const conflictHandler = vi.fn();

      window.addEventListener("version-conflict", conflictHandler);

      await service.setCurrentEtag(createTestCharacter({ name: "Original" }));

      const message = {
        type: "version-saved",
        tabId: "other-tab-123",
        etag: "remote-etag",
        timestamp: Date.now(),
        characterName: "Remote Character",
      };

      mockChannel.receive(message);

      conflictHandler.mockClear();

      service.markDirty(createTestCharacter({ name: "Local Changes" }));

      expect(conflictHandler).toHaveBeenCalled();

      window.removeEventListener("version-conflict", conflictHandler);
      service.close();
    });
  });

  describe("close", () => {
    it("should broadcast tab-closed message on close", () => {
      const service = new ConflictDetectionService();
      const mockChannel = MockBroadcastChannel.latest();

      mockChannel.postMessage.mockClear();

      service.close();

      expect(mockChannel.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "tab-closed",
          tabId: expect.any(String),
        })
      );
    });

    it("should close the BroadcastChannel", () => {
      const service = new ConflictDetectionService();
      const mockChannel = MockBroadcastChannel.latest();

      service.close();

      expect(mockChannel.close).toHaveBeenCalled();
    });
  });
});
