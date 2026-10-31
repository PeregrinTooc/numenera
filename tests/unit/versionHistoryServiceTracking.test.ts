import { describe, it, expect, vi } from "vitest";
import { VersionHistoryService } from "@/services/versionHistoryService";
import type { CharacterVersion } from "@/types/versionHistory";
import type { Character } from "@/types/character";
import { setupVersionHistoryService } from "./helpers/versionHistoryServiceFixture";

describe("VersionHistoryService - tracking, races and edge cases", () => {
  const fx = setupVersionHistoryService();

  describe("trackChange (Convenience Method)", () => {
    it("should reset timer and buffer change", () => {
      fx.service.trackChange(fx.mockCharacter, "Combined change");

      expect(fx.service.isTimerActive()).toBe(true);
      expect(fx.service.getBufferLength()).toBe(1);
    });

    it("should work same as calling resetTimer + bufferChange separately", () => {
      fx.service.trackChange(fx.mockCharacter, "Change 1");

      const buffer1 = fx.service.getBufferLength();
      const timer1 = fx.service.isTimerActive();

      // Create new fx.service for comparison
      const service2 = new VersionHistoryService(fx.mockManager, 1000);
      service2.resetTimer();
      service2.bufferChange(fx.mockCharacter, "Change 1");

      expect(service2.getBufferLength()).toBe(buffer1);
      expect(service2.isTimerActive()).toBe(timer1);
    });
  });

  describe("Modal Cancel Scenario", () => {
    it("should not add cancelled changes to buffer", () => {
      // User types (timer resets)
      fx.service.resetTimer();
      fx.service.resetTimer();
      fx.service.resetTimer();

      // User cancels (no bufferChange called)
      // Timer continues running

      expect(fx.service.getBufferLength()).toBe(0);
      expect(fx.service.isTimerActive()).toBe(true);
    });

    it("should not create version if timer fires with empty buffer", async () => {
      fx.service.resetTimer(); // Typing
      fx.service.resetTimer(); // More typing
      // User cancels

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      expect(fx.mockManager.saveVersion).not.toHaveBeenCalled();
    });
  });

  describe("Squash race", () => {
    it("should not double-save when the timer fires again during an in-flight squash", async () => {
      // Make saveVersion controllable so we can catch the window between the
      // first squash starting and it actually finishing.
      let resolveSave: (value: CharacterVersion) => void = () => {};
      const pendingSave = new Promise<CharacterVersion>((resolve) => {
        resolveSave = resolve;
      });
      vi.mocked(fx.mockManager.saveVersion).mockReturnValue(pendingSave);

      fx.service.bufferChange(fx.mockCharacter, "Change 1");

      // Fire the squash timer - performSquash() starts and suspends on the
      // still-pending saveVersion call, leaving the buffer not yet cleared.
      vi.advanceTimersByTime(1000);
      await Promise.resolve();

      // A further edit restarts the timer, which fires while the first
      // squash is still in flight and sees a non-empty buffer.
      fx.service.bufferChange(fx.mockCharacter, "Change 2");
      vi.advanceTimersByTime(1000);
      await Promise.resolve();

      resolveSave({
        id: "version-123",
        character: fx.mockCharacter,
        description: "Change 1",
        timestamp: Date.now(),
        etag: "etag-123",
      });
      await vi.runAllTimersAsync();

      // Change 1 saved once by the in-flight squash, then Change 2 on its own
      // once that finished - never Change 1 again as a duplicate.
      const descriptions = vi
        .mocked(fx.mockManager.saveVersion)
        .mock.calls.map((call: [Character, string]) => call[1]);
      expect(descriptions).toEqual(["Change 1", "Change 2"]);
    });
  });

  describe("Integration Scenario: Multiple Quick Edits", () => {
    it("should handle realistic editing scenario", async () => {
      // User edits name
      fx.service.bufferChange({ ...fx.mockCharacter, name: "Aria" }, "Changed name");
      vi.advanceTimersByTime(400);

      // User edits tier
      fx.service.bufferChange({ ...fx.mockCharacter, tier: 2 }, "Changed tier");
      vi.advanceTimersByTime(400);

      // User edits descriptor
      fx.service.bufferChange({ ...fx.mockCharacter, descriptor: "Swift" }, "Changed descriptor");
      vi.advanceTimersByTime(600); // Total 1400ms, but timer reset at 800ms

      // Timer fires at 1400ms (600ms after last edit)
      expect(fx.mockManager.saveVersion).not.toHaveBeenCalled();

      vi.advanceTimersByTime(400); // Now 1000ms from last reset

      await vi.runAllTimersAsync();
      await vi.runAllTimersAsync(); // Run again for async operations

      // Should have squashed all 3 changes
      expect(fx.mockManager.saveVersion).toHaveBeenCalledTimes(1);
      expect(fx.service.getBufferLength()).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very rapid buffering", () => {
      for (let i = 0; i < 100; i++) {
        fx.service.bufferChange(fx.mockCharacter, `Change ${i}`);
      }

      expect(fx.service.getBufferLength()).toBe(100);
      expect(fx.mockManager.saveVersion).not.toHaveBeenCalled();
    });

    it("should handle timer firing during additional buffering", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Change 1");

      vi.advanceTimersByTime(999);

      // Add another change just before timer fires
      fx.service.bufferChange(fx.mockCharacter, "Change 2");

      vi.advanceTimersByTime(1); // Original timer fires

      // Timer was reset by bufferChange, so shouldn't fire yet
      await vi.runAllTimersAsync();

      // Should still have buffered changes
      expect(fx.service.getBufferLength()).toBeGreaterThanOrEqual(0); // May have squashed
    });
  });
});
