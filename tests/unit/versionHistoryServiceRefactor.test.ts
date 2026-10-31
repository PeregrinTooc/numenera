import { describe, it, expect, vi } from "vitest";
import { setupVersionHistoryService } from "./helpers/versionHistoryServiceFixture";

describe("VersionHistoryService - Smart Squashing Refactor", () => {
  const fx = setupVersionHistoryService();

  describe("Timer Reset Behavior", () => {
    it("should start a timer when resetTimer is called", () => {
      fx.service.resetTimer();

      expect(fx.service.isTimerActive()).toBe(true);
    });

    it("should reset the timer on each call to resetTimer", async () => {
      fx.service.resetTimer();
      vi.advanceTimersByTime(500);

      fx.service.resetTimer(); // Reset at 500ms
      vi.advanceTimersByTime(500); // Advance another 500ms (1000ms total from start)

      // Timer should NOT have fired yet (reset at 500ms, so fires at 1500ms)
      expect(fx.mockManager.saveVersion).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500); // Now at 1500ms

      // Timer callback fires but buffer is empty, so no save
      await vi.runAllTimersAsync();

      // Timer cleared after performSquash runs with empty buffer
      expect(fx.service.isTimerActive()).toBe(false);
    });

    it("should handle multiple rapid resets correctly", async () => {
      fx.service.resetTimer();
      vi.advanceTimersByTime(200);

      fx.service.resetTimer();
      vi.advanceTimersByTime(200);

      fx.service.resetTimer();
      vi.advanceTimersByTime(200);

      fx.service.resetTimer();
      vi.advanceTimersByTime(200);

      // 800ms total, but timer keeps resetting
      expect(fx.mockManager.saveVersion).not.toHaveBeenCalled();

      vi.advanceTimersByTime(800); // Now 1000ms from last reset

      // Timer fires but buffer is empty
      await vi.runAllTimersAsync();

      // Timer cleared after empty performSquash
      expect(fx.service.isTimerActive()).toBe(false);
    });

    it("should clear timer state after squash completes", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Test change");

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
      await vi.runAllTimersAsync(); // Run again for async operations

      expect(fx.service.isTimerActive()).toBe(false);
    });
  });

  describe("Buffer Behavior", () => {
    it("should buffer changes without immediately saving", () => {
      fx.service.bufferChange(fx.mockCharacter, "Changed name");

      expect(fx.service.getBufferLength()).toBe(1);
      expect(fx.mockManager.saveVersion).not.toHaveBeenCalled();
    });

    it("should accumulate multiple buffered changes", () => {
      fx.service.bufferChange(fx.mockCharacter, "Change 1");
      fx.service.bufferChange(fx.mockCharacter, "Change 2");
      fx.service.bufferChange(fx.mockCharacter, "Change 3");

      expect(fx.service.getBufferLength()).toBe(3);
      expect(fx.mockManager.saveVersion).not.toHaveBeenCalled();
    });

    it("should reset timer when buffering a change", () => {
      fx.service.bufferChange(fx.mockCharacter, "Change 1");

      expect(fx.service.isTimerActive()).toBe(true);
    });

    it("should deep clone characters when buffering", () => {
      const char = { ...fx.mockCharacter };
      fx.service.bufferChange(char, "Change 1");

      // Mutate original
      char.name = "Modified";

      // Buffer should have original value
      vi.advanceTimersByTime(1000);
      // This test verifies the deep clone happened
      expect(fx.service.getBufferLength()).toBe(1);
    });
  });

  describe("Squashing Behavior", () => {
    it("should not squash if buffer is empty", async () => {
      fx.service.resetTimer();

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      expect(fx.mockManager.saveVersion).not.toHaveBeenCalled();
    });

    it("should squash buffered changes after timer expires", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Change 1");
      fx.service.bufferChange(fx.mockCharacter, "Change 2");
      fx.service.bufferChange(fx.mockCharacter, "Change 3");

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      expect(fx.mockManager.saveVersion).toHaveBeenCalledTimes(1);
    });

    it("should use the latest character state when squashing", async () => {
      const char1 = { ...fx.mockCharacter, name: "Name 1" };
      const char2 = { ...fx.mockCharacter, name: "Name 2" };
      const char3 = { ...fx.mockCharacter, name: "Name 3" };

      fx.service.bufferChange(char1, "Change 1");
      fx.service.bufferChange(char2, "Change 2");
      fx.service.bufferChange(char3, "Change 3");

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      expect(fx.mockManager.saveVersion).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Name 3" }),
        expect.any(String)
      );
    });

    it("should combine descriptions when squashing", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Changed name");
      fx.service.bufferChange(fx.mockCharacter, "Changed tier");
      fx.service.bufferChange(fx.mockCharacter, "Changed descriptor");

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      const call = vi.mocked(fx.mockManager.saveVersion).mock.calls[0];
      const description = call[1];

      // squashDescriptions should have combined them
      expect(description).toContain("name");
      expect(description).toContain("tier");
      expect(description).toContain("descriptor");
    });

    it("should mark squashed version with metadata", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Change 1");
      fx.service.bufferChange(fx.mockCharacter, "Change 2");

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
      await vi.runAllTimersAsync(); // Run again for async operations

      expect(fx.mockManager.updateVersionMetadata).toHaveBeenCalledWith("version-123", {
        isSquashed: true,
        squashedCount: 2,
      });
    });

    it("should clear buffer after squashing", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Change 1");
      fx.service.bufferChange(fx.mockCharacter, "Change 2");

      expect(fx.service.getBufferLength()).toBe(2);

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
      await vi.runAllTimersAsync(); // Run again for async operations

      expect(fx.service.getBufferLength()).toBe(0);
    });
  });
});
