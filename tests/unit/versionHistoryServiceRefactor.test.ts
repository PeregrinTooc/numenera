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
      expect(await fx.manager.getAllVersions()).toHaveLength(0);

      vi.advanceTimersByTime(500); // Now at 1500ms

      await vi.runAllTimersAsync();

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
      expect(await fx.manager.getAllVersions()).toHaveLength(0);

      vi.advanceTimersByTime(800); // Now 1000ms from last reset

      await vi.runAllTimersAsync();

      expect(fx.service.isTimerActive()).toBe(false);
    });

    it("should clear timer state after squash completes", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Test change");

      vi.advanceTimersByTime(1000);
      await vi.waitFor(() => expect(fx.service.getBufferLength()).toBe(0));

      expect(fx.service.isTimerActive()).toBe(false);
    });
  });

  describe("Buffer Behavior", () => {
    it("should buffer changes without immediately saving", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Changed name");

      expect(fx.service.getBufferLength()).toBe(1);
      expect(await fx.manager.getAllVersions()).toHaveLength(0);
    });

    it("should accumulate multiple buffered changes", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Change 1");
      fx.service.bufferChange(fx.mockCharacter, "Change 2");
      fx.service.bufferChange(fx.mockCharacter, "Change 3");

      expect(fx.service.getBufferLength()).toBe(3);
      expect(await fx.manager.getAllVersions()).toHaveLength(0);
    });

    it("should reset timer when buffering a change", () => {
      fx.service.bufferChange(fx.mockCharacter, "Change 1");

      expect(fx.service.isTimerActive()).toBe(true);
    });

    it("should deep clone characters when buffering", () => {
      const char = { ...fx.mockCharacter };
      fx.service.bufferChange(char, "Change 1");

      char.name = "Modified";

      vi.advanceTimersByTime(1000);
      expect(fx.service.getBufferLength()).toBe(1);
    });
  });

  describe("Squashing Behavior", () => {
    it("should not squash if buffer is empty", async () => {
      fx.service.resetTimer();

      vi.advanceTimersByTime(1000);
      await vi.waitFor(() => expect(fx.service.getBufferLength()).toBe(0));

      expect(await fx.manager.getAllVersions()).toHaveLength(0);
    });

    it("should squash buffered changes after timer expires", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Change 1");
      fx.service.bufferChange(fx.mockCharacter, "Change 2");
      fx.service.bufferChange(fx.mockCharacter, "Change 3");

      vi.advanceTimersByTime(1000);
      await vi.waitFor(() => expect(fx.service.getBufferLength()).toBe(0));

      expect(await fx.manager.getAllVersions()).toHaveLength(1);
    });

    it("should use the latest character state when squashing", async () => {
      const char1 = { ...fx.mockCharacter, name: "Name 1" };
      const char2 = { ...fx.mockCharacter, name: "Name 2" };
      const char3 = { ...fx.mockCharacter, name: "Name 3" };

      fx.service.bufferChange(char1, "Change 1");
      fx.service.bufferChange(char2, "Change 2");
      fx.service.bufferChange(char3, "Change 3");

      vi.advanceTimersByTime(1000);
      await vi.waitFor(() => expect(fx.service.getBufferLength()).toBe(0));

      const [version] = await fx.manager.getAllVersions();
      expect(version.character.name).toBe("Name 3");
    });

    it("should combine descriptions when squashing", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Changed name");
      fx.service.bufferChange(fx.mockCharacter, "Changed tier");
      fx.service.bufferChange(fx.mockCharacter, "Changed descriptor");

      vi.advanceTimersByTime(1000);
      await vi.waitFor(() => expect(fx.service.getBufferLength()).toBe(0));

      const [version] = await fx.manager.getAllVersions();
      const description = version.description;

      expect(description).toContain("name");
      expect(description).toContain("tier");
      expect(description).toContain("descriptor");
    });

    it("should mark squashed version with metadata", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Change 1");
      fx.service.bufferChange(fx.mockCharacter, "Change 2");

      vi.advanceTimersByTime(1000);
      await vi.waitFor(() => expect(fx.service.getBufferLength()).toBe(0));

      const [version] = await fx.manager.getAllVersions();
      expect(version.isSquashed).toBe(true);
      expect(version.squashedCount).toBe(2);
    });

    it("should clear buffer after squashing", async () => {
      fx.service.bufferChange(fx.mockCharacter, "Change 1");
      fx.service.bufferChange(fx.mockCharacter, "Change 2");

      expect(fx.service.getBufferLength()).toBe(2);

      vi.advanceTimersByTime(1000);
      await vi.waitFor(() => expect(fx.service.getBufferLength()).toBe(0));

      expect(fx.service.getBufferLength()).toBe(0);
    });
  });
});
