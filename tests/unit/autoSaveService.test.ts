import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { AutoSaveService } from "@/services/autoSaveService";
import { ManualClock } from "@/services/manualClock";

describe("AutoSaveService", () => {
  let clock: ManualClock;
  let service: AutoSaveService;
  let mockSaveCallback: Mock<() => Promise<void>>;

  beforeEach(() => {
    clock = new ManualClock();
    mockSaveCallback = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    service = new AutoSaveService(mockSaveCallback, clock, 300);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("requestSave", () => {
    it("should debounce multiple save requests", () => {
      service.requestSave();
      service.requestSave();
      service.requestSave();

      expect(mockSaveCallback).not.toHaveBeenCalled();

      clock.advance(300);

      expect(mockSaveCallback).toHaveBeenCalledTimes(1);
    });

    it("should reset debounce timer on new requests", () => {
      service.requestSave();

      clock.advance(200);
      expect(mockSaveCallback).not.toHaveBeenCalled();

      service.requestSave();

      // Advance another 200ms (total 400ms from first, but only 200ms from second)
      clock.advance(200);
      expect(mockSaveCallback).not.toHaveBeenCalled();

      clock.advance(100);
      expect(mockSaveCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("flush", () => {
    it("should not save when no save is pending", async () => {
      await service.flush();

      expect(mockSaveCallback).not.toHaveBeenCalled();
    });

    it("should save immediately when a save is pending and not save again on the timer tick", async () => {
      service.requestSave();
      expect(mockSaveCallback).not.toHaveBeenCalled();

      await service.flush();
      expect(mockSaveCallback).toHaveBeenCalledTimes(1);

      clock.advance(300);
      await service.flush();
      expect(mockSaveCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("custom debounce time", () => {
    it("should use custom debounce time", () => {
      const customCallback = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
      const customService = new AutoSaveService(customCallback, clock, 500);

      customService.requestSave();
      clock.advance(300);
      expect(customCallback).not.toHaveBeenCalled();

      clock.advance(200);
      expect(customCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("event emission", () => {
    it("should emit save-completed event after save", async () => {
      const eventHandler = vi.fn();
      service.on("save-completed", eventHandler);

      service.requestSave();
      clock.advance(300);
      await service.flush();

      expect(eventHandler).toHaveBeenCalledTimes(1);
      expect(eventHandler).toHaveBeenCalledWith({ timestamp: clock.now() });
    });

    it("should allow multiple event listeners", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      service.on("save-completed", handler1);
      service.on("save-completed", handler2);

      service.requestSave();
      clock.advance(300);
      await service.flush();

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });
});
