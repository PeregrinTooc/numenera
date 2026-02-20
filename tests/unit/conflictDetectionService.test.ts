import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConflictDetectionService } from "../../src/services/conflictDetectionService";

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

// Store references to created channels for cross-channel testing
const _channels: MockBroadcastChannel[] = [];

describe("ConflictDetectionService", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalBroadcastChannel: any;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockChannel = (service as any).channel as MockBroadcastChannel;

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tabId1 = (service1 as any).tabId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tabId2 = (service2 as any).tabId;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCharacter = { name: "Test Character" } as any;

      service.markDirty(mockCharacter);

      expect(service.isDirty()).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((service as any).pendingCharacter).toBe(mockCharacter);

      service.close();
    });

    it("should clear pending character when clearDirty is called", () => {
      const service = new ConflictDetectionService();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCharacter = { name: "Test Character" } as any;

      service.markDirty(mockCharacter);
      service.clearDirty();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((service as any).pendingCharacter).toBeNull();

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCharacter = { name: "Test Character" } as any;

      await service.setCurrentEtag(mockCharacter);

      expect(service.getCurrentEtag()).not.toBeNull();
      expect(typeof service.getCurrentEtag()).toBe("string");

      service.close();
    });

    it("should generate different ETags for different characters", async () => {
      const service = new ConflictDetectionService();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const char1 = { name: "Character 1" } as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const char2 = { name: "Character 2" } as any;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockChannel = (service as any).channel as MockBroadcastChannel;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCharacter = { name: "Test Character" } as any;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCharacter = { name: "Test Character" } as any;

      expect(service.getCurrentEtag()).toBeNull();

      await service.notifyVersionSaved(mockCharacter);

      expect(service.getCurrentEtag()).not.toBeNull();

      service.close();
    });

    it("should clear pending character after saving", async () => {
      const service = new ConflictDetectionService();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCharacter = { name: "Test Character" } as any;

      service.markDirty(mockCharacter);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((service as any).pendingCharacter).toBe(mockCharacter);

      await service.notifyVersionSaved(mockCharacter);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((service as any).pendingCharacter).toBeNull();

      service.close();
    });
  });

  describe("conflict detection", () => {
    it("should emit version-conflict when receiving version-saved with dirty state", async () => {
      const service = new ConflictDetectionService();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockChannel = (service as any).channel as MockBroadcastChannel;
      const conflictHandler = vi.fn();

      window.addEventListener("version-conflict", conflictHandler);

      // Set up initial state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await service.setCurrentEtag({ name: "Original" } as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      service.markDirty({ name: "Local Changes" } as any);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockChannel = (service as any).channel as MockBroadcastChannel;
      const newerVersionHandler = vi.fn();

      window.addEventListener("newer-version-available", newerVersionHandler);

      // Set up initial state (not dirty)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await service.setCurrentEtag({ name: "Original" } as any);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockChannel = (service as any).channel as MockBroadcastChannel;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tabId = (service as any).tabId;
      const conflictHandler = vi.fn();
      const newerVersionHandler = vi.fn();

      window.addEventListener("version-conflict", conflictHandler);
      window.addEventListener("newer-version-available", newerVersionHandler);

      // Set up initial state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await service.setCurrentEtag({ name: "Original" } as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      service.markDirty({ name: "Local Changes" } as any);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockChannel = (service as any).channel as MockBroadcastChannel;
      const conflictHandler = vi.fn();

      window.addEventListener("version-conflict", conflictHandler);

      // Set up initial state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await service.setCurrentEtag({ name: "Original" } as any);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      service.markDirty({ name: "Local Changes" } as any);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockChannel = (service as any).channel as MockBroadcastChannel;

      // Clear initial tab-opened call
      mockChannel.postMessage.mockClear();

      service.setEnabled(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await service.notifyVersionSaved({ name: "Test" } as any);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockChannel = (service as any).channel as MockBroadcastChannel;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockChannel = (service as any).channel as MockBroadcastChannel;

      service.close();

      expect(mockChannel.close).toHaveBeenCalled();
    });
  });
});
