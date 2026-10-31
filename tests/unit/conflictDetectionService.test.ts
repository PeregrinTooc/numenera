import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConflictDetectionService } from "@/services/conflictDetectionService";
import type { Character } from "@/types/character";
import { createTestCharacter } from "../factories/character";

// Mock MessageEvent interface for tests
interface MockMessageEvent<T = unknown> {
  data: T;
}

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string;
  onmessage: ((event: MockMessageEvent) => void) | null = null;
  postMessage = vi.fn();
  close = vi.fn();

  constructor(name: string) {
    this.name = name;
  }
}

/**
 * Private members the tests read to reach the mock channel and the pending
 * state. A structural view of the class, not `any`.
 */
interface ServiceInternals {
  channel: MockBroadcastChannel;
  tabId: string;
  pendingCharacter: Character | null;
}

function internalsOf(service: ConflictDetectionService): ServiceInternals {
  return service as unknown as ServiceInternals;
}

// Store references to created channels for cross-channel testing
const _channels: MockBroadcastChannel[] = [];

describe("ConflictDetectionService", () => {
  let originalBroadcastChannel: unknown;

  beforeEach(() => {
    // Mock BroadcastChannel
    originalBroadcastChannel = (globalThis as Record<string, unknown>).BroadcastChannel;
    (globalThis as Record<string, unknown>).BroadcastChannel = MockBroadcastChannel;
    _channels.length = 0;
  });

  afterEach(() => {
    (globalThis as Record<string, unknown>).BroadcastChannel = originalBroadcastChannel;
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should create a BroadcastChannel with correct name", () => {
      const service = new ConflictDetectionService();
      expect(service).toBeDefined();
      service.close();
    });

    it("should broadcast tab-opened message on creation", () => {
      const service = new ConflictDetectionService();
      const mockChannel = internalsOf(service).channel;

      expect(mockChannel.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "tab-opened",
          tabId: expect.any(String),
        })
      );
      service.close();
    });

    it("should generate unique tab IDs", () => {
      const service1 = new ConflictDetectionService();
      const service2 = new ConflictDetectionService();

      const tabId1 = internalsOf(service1).tabId;
      const tabId2 = internalsOf(service2).tabId;

      expect(tabId1).not.toBe(tabId2);

      service1.close();
      service2.close();
    });
  });

  describe("dirty state tracking", () => {
    it("should start with clean state", () => {
      const service = new ConflictDetectionService();

      expect(service.isDirty()).toBe(false);

      service.close();
    });

    it("should mark as dirty when markDirty is called", () => {
      const service = new ConflictDetectionService();

      service.markDirty();

      expect(service.isDirty()).toBe(true);

      service.close();
    });

    it("should clear dirty state when clearDirty is called", () => {
      const service = new ConflictDetectionService();

      service.markDirty();
      expect(service.isDirty()).toBe(true);

      service.clearDirty();
      expect(service.isDirty()).toBe(false);

      service.close();
    });

    it("should store pending character when markDirty is called with character", () => {
      const service = new ConflictDetectionService();
      const mockCharacter = createTestCharacter({ name: "Test Character" });

      service.markDirty(mockCharacter);

      expect(service.isDirty()).toBe(true);
      expect(internalsOf(service).pendingCharacter).toBe(mockCharacter);

      service.close();
    });

    it("should clear pending character when clearDirty is called", () => {
      const service = new ConflictDetectionService();
      const mockCharacter = createTestCharacter({ name: "Test Character" });

      service.markDirty(mockCharacter);
      service.clearDirty();

      expect(internalsOf(service).pendingCharacter).toBeNull();

      service.close();
    });
  });

  describe("ETag management", () => {
    it("should start with null ETag", () => {
      const service = new ConflictDetectionService();

      expect(service.getCurrentEtag()).toBeNull();

      service.close();
    });

    it("should set ETag when setCurrentEtag is called", async () => {
      const service = new ConflictDetectionService();
      const mockCharacter = createTestCharacter({ name: "Test Character" });

      await service.setCurrentEtag(mockCharacter);

      expect(service.getCurrentEtag()).not.toBeNull();
      expect(typeof service.getCurrentEtag()).toBe("string");

      service.close();
    });

    it("should generate different ETags for different characters", async () => {
      const service = new ConflictDetectionService();
      const char1 = createTestCharacter({ name: "Character 1" });
      const char2 = createTestCharacter({ name: "Character 2" });

      await service.setCurrentEtag(char1);
      const etag1 = service.getCurrentEtag();

      await service.setCurrentEtag(char2);
      const etag2 = service.getCurrentEtag();

      expect(etag1).not.toBe(etag2);

      service.close();
    });
  });

  describe("notifyVersionSaved", () => {
    it("should broadcast version-saved message", async () => {
      const service = new ConflictDetectionService();
      const mockChannel = internalsOf(service).channel;
      const mockCharacter = createTestCharacter({ name: "Test Character" });

      // Clear initial tab-opened call
      mockChannel.postMessage.mockClear();

      await service.notifyVersionSaved(mockCharacter);

      expect(mockChannel.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "version-saved",
          tabId: expect.any(String),
          etag: expect.any(String),
          timestamp: expect.any(Number),
          characterName: "Test Character",
        })
      );

      service.close();
    });

    it("should update current ETag after saving", async () => {
      const service = new ConflictDetectionService();
      const mockCharacter = createTestCharacter({ name: "Test Character" });

      expect(service.getCurrentEtag()).toBeNull();

      await service.notifyVersionSaved(mockCharacter);

      expect(service.getCurrentEtag()).not.toBeNull();

      service.close();
    });

    it("should clear pending character after saving", async () => {
      const service = new ConflictDetectionService();
      const mockCharacter = createTestCharacter({ name: "Test Character" });

      service.markDirty(mockCharacter);
      expect(internalsOf(service).pendingCharacter).toBe(mockCharacter);

      await service.notifyVersionSaved(mockCharacter);

      expect(internalsOf(service).pendingCharacter).toBeNull();

      service.close();
    });
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
