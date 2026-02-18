import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AutoSaveService } from "../../src/services/autoSaveService.js";

describe("AutoSaveService", () => {
  let service: AutoSaveService;
  let mockSaveCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockSaveCallback = vi.fn().mockResolvedValue(undefined);
    service = new AutoSaveService(mockSaveCallback as any, 300);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("requestSave", () => {
    it("should debounce multiple save requests", () => {
      // Make multiple rapid save requests
      service.requestSave();
      service.requestSave();
      service.requestSave();

      // Should not have called save yet
      expect(mockSaveCallback).not.toHaveBeenCalled();

      // Fast-forward past debounce time
      vi.advanceTimersByTime(300);

      // Should have called save exactly once
      expect(mockSaveCallback).toHaveBeenCalledTimes(1);
    });

    it("should reset debounce timer on new requests", () => {
      service.requestSave();

      // Advance time partially
      vi.advanceTimersByTime(200);
      expect(mockSaveCallback).not.toHaveBeenCalled();

      // Make another request (should reset timer)
      service.requestSave();

      // Advance another 200ms (total 400ms from first, but only 200ms from second)
      vi.advanceTimersByTime(200);
      expect(mockSaveCallback).not.toHaveBeenCalled();

      // Advance final 100ms to complete the 300ms from second request
      vi.advanceTimersByTime(100);
      expect(mockSaveCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("custom debounce time", () => {
    it("should use custom debounce time", () => {
      const customCallback = vi.fn().mockResolvedValue(undefined);
      const customService = new AutoSaveService(customCallback as any, 500);

      customService.requestSave();
      vi.advanceTimersByTime(300);
      expect(customCallback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(200);
      expect(customCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("event emission", () => {
    it("should emit save-completed event after save", async () => {
      const eventHandler = vi.fn();
      service.on("save-completed", eventHandler);

      service.requestSave();
      await vi.runAllTimersAsync();

      expect(eventHandler).toHaveBeenCalledTimes(1);
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
        })
      );
    });

    it("should allow multiple event listeners", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      service.on("save-completed", handler1);
      service.on("save-completed", handler2);

      service.requestSave();
      await vi.runAllTimersAsync();

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it("should allow removing event listeners", () => {
      const handler = vi.fn();

      service.on("save-completed", handler);
      service.off("save-completed", handler);

      service.requestSave();
      vi.advanceTimersByTime(300);

      expect(handler).not.toHaveBeenCalled();
    });
  });
});
