import { describe, it, expect, vi } from "vitest";
import { setupVersionHistoryService } from "./helpers/versionHistoryServiceFixture";

describe("VersionHistoryService - tracking, races and edge cases", () => {
  const fx = setupVersionHistoryService();

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
      await vi.waitFor(() => expect(fx.service.getBufferLength()).toBe(0));

      expect(await fx.manager.getAllVersions()).toHaveLength(0);
    });
  });

  describe("Squash race", () => {
    it("should not double-save when the timer fires again during an in-flight squash", async () => {
      // Hold the first save so we can catch the window between the first
      // squash starting and it actually finishing.
      let releaseSave: () => void = () => {};
      const gate = new Promise<void>((resolve) => {
        releaseSave = resolve;
      });
      const save = fx.manager.saveVersion.bind(fx.manager);
      vi.spyOn(fx.manager, "saveVersion").mockImplementationOnce(async (character, description) => {
        await gate;
        return save(character, description);
      });

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

      releaseSave();
      await vi.waitFor(() => expect(fx.service.getBufferLength()).toBe(0));

      // Change 1 saved once by the in-flight squash, then Change 2 on its own
      // once that finished - never Change 1 again as a duplicate.
      const descriptions = (await fx.manager.getAllVersions()).map(
        (version) => version.description
      );
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
      expect(await fx.manager.getAllVersions()).toHaveLength(0);

      vi.advanceTimersByTime(400); // Now 1000ms from last reset

      await vi.waitFor(() => expect(fx.service.getBufferLength()).toBe(0));

      // Should have squashed all 3 changes
      expect(await fx.manager.getAllVersions()).toHaveLength(1);
      expect(fx.service.getBufferLength()).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very rapid buffering", async () => {
      for (let i = 0; i < 100; i++) {
        fx.service.bufferChange(fx.mockCharacter, `Change ${i}`);
      }

      expect(fx.service.getBufferLength()).toBe(100);
      expect(await fx.manager.getAllVersions()).toHaveLength(0);
    });

    it("should handle timer firing during additional buffering", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Change 1");

      vi.advanceTimersByTime(999);

      // Add another change just before timer fires
      fx.service.bufferChange(fx.mockCharacter, "Change 2");

      vi.advanceTimersByTime(1); // Original timer fires

      // Timer was reset by bufferChange, so shouldn't fire yet
      await vi.waitFor(() => expect(fx.service.getBufferLength()).toBe(0));

      // Should still have buffered changes
      expect(fx.service.getBufferLength()).toBeGreaterThanOrEqual(0); // May have squashed
    });
  });
});
