import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConflictDetectionService } from "@/services/conflictDetectionService";
import { createTestCharacter } from "../factories/character";
import { installMockBroadcastChannel, internalsOf } from "../factories/mockBroadcastChannel";

describe("ConflictDetectionService", () => {
  let restoreBroadcastChannel: () => void;

  beforeEach(() => {
    restoreBroadcastChannel = installMockBroadcastChannel();
  });

  afterEach(() => {
    restoreBroadcastChannel();
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
});
