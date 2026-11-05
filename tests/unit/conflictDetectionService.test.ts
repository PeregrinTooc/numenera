import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConflictDetectionService, type ConflictDetail } from "@/services/conflictDetectionService";
import { createTestCharacter } from "../factories/character";
import {
  installMockBroadcastChannel,
  MockBroadcastChannel,
} from "../factories/mockBroadcastChannel";

describe("ConflictDetectionService", () => {
  let restoreBroadcastChannel: () => void;
  let conflicts: ConflictDetail[];
  const onConflict = (event: Event): void => {
    conflicts.push((event as CustomEvent<ConflictDetail>).detail);
  };

  beforeEach(() => {
    restoreBroadcastChannel = installMockBroadcastChannel();
    conflicts = [];
    window.addEventListener("version-conflict", onConflict);
  });

  afterEach(() => {
    window.removeEventListener("version-conflict", onConflict);
    restoreBroadcastChannel();
    vi.restoreAllMocks();
  });

  function openService(): { service: ConflictDetectionService; channel: MockBroadcastChannel } {
    const service = new ConflictDetectionService();
    return { service, channel: MockBroadcastChannel.latest() };
  }

  function otherTabSavesVersion(channel: MockBroadcastChannel, etag = "remote-etag"): void {
    channel.receive({
      type: "version-saved",
      tabId: "other-tab-123",
      etag,
      timestamp: Date.now(),
      characterName: "Remote Character",
    });
  }

  function otherTabRequestsLatest(channel: MockBroadcastChannel): void {
    channel.receive({ type: "request-latest", tabId: "other-tab-123" });
  }

  describe("initialization", () => {
    it("should create a BroadcastChannel with correct name", () => {
      const { service, channel } = openService();

      expect(channel.name).toBe("numenera-character-sync");
      service.close();
    });

    it("should broadcast tab-opened message on creation", () => {
      const { service, channel } = openService();

      expect(channel.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "tab-opened",
          tabId: expect.any(String),
        })
      );
      service.close();
    });

    it("should generate unique tab IDs", () => {
      const first = openService();
      const second = openService();

      expect(first.channel.tabId).not.toBe(second.channel.tabId);

      first.service.close();
      second.service.close();
    });
  });

  describe("dirty state tracking", () => {
    it("should start with clean state", () => {
      const { service, channel } = openService();

      otherTabSavesVersion(channel);

      expect(conflicts).toHaveLength(0);
      service.close();
    });

    it("should mark as dirty when markDirty is called", () => {
      const { service, channel } = openService();

      service.markDirty();
      otherTabSavesVersion(channel);

      expect(conflicts).toHaveLength(1);
      service.close();
    });

    it("should clear dirty state when clearDirty is called", () => {
      const { service, channel } = openService();

      service.markDirty();
      service.clearDirty();
      otherTabSavesVersion(channel);

      expect(conflicts).toHaveLength(0);
      service.close();
    });

    it("should store pending character when markDirty is called with character", () => {
      const { service, channel } = openService();
      const mockCharacter = createTestCharacter({ name: "Test Character" });

      service.markDirty(mockCharacter);
      otherTabSavesVersion(channel);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].localCharacter).toBe(mockCharacter);
      service.close();
    });

    it("should clear pending character when clearDirty is called", () => {
      const { service, channel } = openService();
      const mockCharacter = createTestCharacter({ name: "Test Character" });

      service.markDirty(mockCharacter);
      service.clearDirty();
      service.markDirty();
      otherTabSavesVersion(channel);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].localCharacter).toEqual({});
      service.close();
    });
  });

  describe("ETag management", () => {
    it("should start with null ETag", () => {
      const { service, channel } = openService();

      otherTabRequestsLatest(channel);

      expect(channel.posted("respond-latest")).toHaveLength(0);
      service.close();
    });

    it("should set ETag when setCurrentEtag is called", async () => {
      const { service, channel } = openService();

      await service.setCurrentEtag(createTestCharacter({ name: "Test Character" }));
      otherTabRequestsLatest(channel);

      const responses = channel.posted("respond-latest");
      expect(responses).toHaveLength(1);
      expect(typeof responses[0].etag).toBe("string");
      service.close();
    });

    it("should generate different ETags for different characters", async () => {
      const { service, channel } = openService();

      await service.setCurrentEtag(createTestCharacter({ name: "Character 1" }));
      otherTabRequestsLatest(channel);
      await service.setCurrentEtag(createTestCharacter({ name: "Character 2" }));
      otherTabRequestsLatest(channel);

      const [first, second] = channel.posted("respond-latest");
      expect(first.etag).not.toBe(second.etag);
      service.close();
    });
  });

  describe("notifyVersionSaved", () => {
    it("should broadcast version-saved message", async () => {
      const { service, channel } = openService();
      const mockCharacter = createTestCharacter({ name: "Test Character" });

      await service.notifyVersionSaved(mockCharacter);

      expect(channel.postMessage).toHaveBeenCalledWith(
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
      const { service, channel } = openService();

      otherTabRequestsLatest(channel);
      expect(channel.posted("respond-latest")).toHaveLength(0);

      await service.notifyVersionSaved(createTestCharacter({ name: "Test Character" }));
      otherTabRequestsLatest(channel);

      const [saved] = channel.posted("version-saved");
      const [response] = channel.posted("respond-latest");
      expect(response.etag).toBe(saved.etag);

      service.close();
    });

    it("should clear pending character after saving", async () => {
      const { service, channel } = openService();
      const mockCharacter = createTestCharacter({ name: "Test Character" });

      service.markDirty(mockCharacter);
      await service.notifyVersionSaved(mockCharacter);
      otherTabSavesVersion(channel);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].localCharacter).toEqual({});

      service.close();
    });
  });
});
