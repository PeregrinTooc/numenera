import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConflictDetectionService } from "@/services/conflictDetectionService";
import { createTestCharacter } from "../factories/character";
import {
  installMockBroadcastChannel,
  internalsOf,
  type MockMessageEvent,
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
      const mockChannel = internalsOf(service).channel;
      const conflictHandler = vi.fn();

      window.addEventListener("version-conflict", conflictHandler);

      // Set up initial state
      await service.setCurrentEtag(createTestCharacter({ name: "Original" }));
      service.markDirty(createTestCharacter({ name: "Local Changes" }));

      // Simulate receiving a version-saved message from another tab
      const message = {
        type: "version-saved",
        tabId: "other-tab-123",
        etag: "different-etag",
        timestamp: Date.now(),
        characterName: "Remote Character",
      };

      mockChannel.onmessage?.({
        data: message,
      } as MockMessageEvent);

      expect(conflictHandler).toHaveBeenCalled();

      window.removeEventListener("version-conflict", conflictHandler);
      service.close();
    });

    it("should emit newer-version-available when receiving version-saved without dirty state", async () => {
      const service = new ConflictDetectionService();
      const mockChannel = internalsOf(service).channel;
      const newerVersionHandler = vi.fn();

      window.addEventListener("newer-version-available", newerVersionHandler);

      // Set up initial state (not dirty)
      await service.setCurrentEtag(createTestCharacter({ name: "Original" }));

      // Simulate receiving a version-saved message from another tab
      const message = {
        type: "version-saved",
        tabId: "other-tab-123",
        etag: "different-etag",
        timestamp: Date.now(),
        characterName: "Remote Character",
      };

      mockChannel.onmessage?.({
        data: message,
      } as MockMessageEvent);

      expect(newerVersionHandler).toHaveBeenCalled();

      window.removeEventListener("newer-version-available", newerVersionHandler);
      service.close();
    });

    it("should ignore messages from same tab", async () => {
      const service = new ConflictDetectionService();
      const mockChannel = internalsOf(service).channel;
      const tabId = internalsOf(service).tabId;
      const conflictHandler = vi.fn();
      const newerVersionHandler = vi.fn();

      window.addEventListener("version-conflict", conflictHandler);
      window.addEventListener("newer-version-available", newerVersionHandler);

      // Set up initial state
      await service.setCurrentEtag(createTestCharacter({ name: "Original" }));
      service.markDirty(createTestCharacter({ name: "Local Changes" }));

      // Simulate receiving a message from the same tab
      const message = {
        type: "version-saved",
        tabId: tabId, // Same tab ID
        etag: "different-etag",
        timestamp: Date.now(),
        characterName: "Same Tab Character",
      };

      mockChannel.onmessage?.({
        data: message,
      } as MockMessageEvent);

      expect(conflictHandler).not.toHaveBeenCalled();
      expect(newerVersionHandler).not.toHaveBeenCalled();

      window.removeEventListener("version-conflict", conflictHandler);
      window.removeEventListener("newer-version-available", newerVersionHandler);
      service.close();
    });

    it("should emit conflict when marking dirty with stale remote ETag", async () => {
      const service = new ConflictDetectionService();
      const mockChannel = internalsOf(service).channel;
      const conflictHandler = vi.fn();

      window.addEventListener("version-conflict", conflictHandler);

      // Set up initial state
      await service.setCurrentEtag(createTestCharacter({ name: "Original" }));

      // Simulate receiving a version-saved message (sets remoteEtagReceived)
      const message = {
        type: "version-saved",
        tabId: "other-tab-123",
        etag: "remote-etag",
        timestamp: Date.now(),
        characterName: "Remote Character",
      };

      mockChannel.onmessage?.({
        data: message,
      } as MockMessageEvent);

      // Clear the newer-version-available event
      conflictHandler.mockClear();

      // Now when we mark dirty, it should detect stale state
      service.markDirty(createTestCharacter({ name: "Local Changes" }));

      expect(conflictHandler).toHaveBeenCalled();

      window.removeEventListener("version-conflict", conflictHandler);
      service.close();
    });
  });

  describe("enable/disable", () => {
    it("should be enabled by default", () => {
      const service = new ConflictDetectionService();

      expect(service.isConflictDetectionEnabled()).toBe(true);

      service.close();
    });

    it("should not broadcast when disabled", async () => {
      const service = new ConflictDetectionService();
      const mockChannel = internalsOf(service).channel;

      // Clear initial tab-opened call
      mockChannel.postMessage.mockClear();

      service.setEnabled(false);

      await service.notifyVersionSaved(createTestCharacter({ name: "Test" }));

      // The postMessage should still be called internally but broadcast returns early
      // Actually, looking at the code, broadcast checks isEnabled before posting
      // So when disabled, postMessage should not be called
      expect(mockChannel.postMessage).not.toHaveBeenCalled();

      service.close();
    });

    it("should toggle enabled state", () => {
      const service = new ConflictDetectionService();

      expect(service.isConflictDetectionEnabled()).toBe(true);

      service.setEnabled(false);
      expect(service.isConflictDetectionEnabled()).toBe(false);

      service.setEnabled(true);
      expect(service.isConflictDetectionEnabled()).toBe(true);

      service.close();
    });
  });

  describe("close", () => {
    it("should broadcast tab-closed message on close", () => {
      const service = new ConflictDetectionService();
      const mockChannel = internalsOf(service).channel;

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
      const mockChannel = internalsOf(service).channel;

      service.close();

      expect(mockChannel.close).toHaveBeenCalled();
    });
  });
});
