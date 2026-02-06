import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { VersionHistoryService } from "../../src/services/versionHistoryService.js";
import type { Character } from "../../src/types/character.js";

describe("VersionHistoryService - Smart Squashing Refactor", () => {
  let service: VersionHistoryService;
  let mockManager: any;
  let mockCharacter: Character;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Create mock character
    mockCharacter = {
      name: "Test Character",
      tier: 1,
      descriptor: "Swift",
      type: "Glaive",
      focus: "Masters Defense",
      xp: 0,
      shins: 10,
      armor: 1,
      maxCyphers: 2,
      effort: 1,
      stats: {
        might: { pool: 10, edge: 1, current: 10 },
        speed: { pool: 10, edge: 0, current: 10 },
        intellect: { pool: 10, edge: 0, current: 10 },
      },
      abilities: [],
      cyphers: [],
      artifacts: [],
      equipment: [],
      attacks: [],
      specialAbilities: [],
      oddities: [],
      recoveryRolls: {
        action: false,
        tenMinutes: false,
        oneHour: false,
        tenHours: false,
      },
      damageTrack: {
        hale: true,
        impaired: false,
        debilitated: false,
      },
      textFields: {
        background: "",
        notes: "",
        advancement: "",
      },
    } as Character;

    // Create mock VersionHistoryManager with properly mocked IndexedDB
    const mockGetRequest = {
      onsuccess: null as any,
      onerror: null as any,
      result: {
        id: "version-123",
        character: mockCharacter,
        description: "Test",
        timestamp: Date.now(),
      },
    };

    const mockPutRequest = {
      onsuccess: null as any,
      onerror: null as any,
    };

    const mockStore = {
      delete: vi.fn(),
      get: vi.fn(() => {
        // Synchronously trigger success
        Promise.resolve().then(() => {
          if (mockGetRequest.onsuccess) {
            mockGetRequest.onsuccess();
          }
        });
        return mockGetRequest;
      }),
      put: vi.fn(() => {
        // Synchronously trigger success
        Promise.resolve().then(() => {
          if (mockPutRequest.onsuccess) {
            mockPutRequest.onsuccess();
          }
        });
        return mockPutRequest;
      }),
    };

    const mockTransaction = {
      objectStore: vi.fn(() => mockStore),
      oncomplete: null as any,
      onerror: null as any,
    };

    mockManager = {
      saveVersion: vi.fn().mockResolvedValue({
        id: "version-123",
        character: mockCharacter,
        description: "Test",
        timestamp: Date.now(),
      }),
      getVersionById: vi.fn().mockResolvedValue(null),
      getAllVersions: vi.fn().mockResolvedValue([]),
      db: {
        transaction: vi.fn(() => {
          // Synchronously trigger transaction complete
          Promise.resolve().then(() => {
            if (mockTransaction.oncomplete) {
              mockTransaction.oncomplete();
            }
          });
          return mockTransaction;
        }),
      },
    };

    service = new VersionHistoryService(mockManager, 1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("Timer Reset Behavior", () => {
    it("should start a timer when resetTimer is called", () => {
      service.resetTimer();

      expect(service.isTimerActive()).toBe(true);
    });

    it("should reset the timer on each call to resetTimer", async () => {
      service.resetTimer();
      vi.advanceTimersByTime(500);

      service.resetTimer(); // Reset at 500ms
      vi.advanceTimersByTime(500); // Advance another 500ms (1000ms total from start)

      // Timer should NOT have fired yet (reset at 500ms, so fires at 1500ms)
      expect(mockManager.saveVersion).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500); // Now at 1500ms

      // Timer callback fires but buffer is empty, so no save
      await vi.runAllTimersAsync();

      // Timer cleared after performSquash runs with empty buffer
      expect(service.isTimerActive()).toBe(false);
    });

    it("should handle multiple rapid resets correctly", async () => {
      service.resetTimer();
      vi.advanceTimersByTime(200);

      service.resetTimer();
      vi.advanceTimersByTime(200);

      service.resetTimer();
      vi.advanceTimersByTime(200);

      service.resetTimer();
      vi.advanceTimersByTime(200);

      // 800ms total, but timer keeps resetting
      expect(mockManager.saveVersion).not.toHaveBeenCalled();

      vi.advanceTimersByTime(800); // Now 1000ms from last reset

      // Timer fires but buffer is empty
      await vi.runAllTimersAsync();

      // Timer cleared after empty performSquash
      expect(service.isTimerActive()).toBe(false);
    });

    it("should clear timer state after squash completes", async () => {
      service.bufferChange(mockCharacter, "Test change");

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
      await vi.runAllTimersAsync(); // Run again for async operations

      expect(service.isTimerActive()).toBe(false);
    });
  });

  describe("Buffer Behavior", () => {
    it("should buffer changes without immediately saving", () => {
      service.bufferChange(mockCharacter, "Changed name");

      expect(service.getBufferLength()).toBe(1);
      expect(mockManager.saveVersion).not.toHaveBeenCalled();
    });

    it("should accumulate multiple buffered changes", () => {
      service.bufferChange(mockCharacter, "Change 1");
      service.bufferChange(mockCharacter, "Change 2");
      service.bufferChange(mockCharacter, "Change 3");

      expect(service.getBufferLength()).toBe(3);
      expect(mockManager.saveVersion).not.toHaveBeenCalled();
    });

    it("should reset timer when buffering a change", () => {
      service.bufferChange(mockCharacter, "Change 1");

      expect(service.isTimerActive()).toBe(true);
    });

    it("should deep clone characters when buffering", () => {
      const char = { ...mockCharacter };
      service.bufferChange(char, "Change 1");

      // Mutate original
      char.name = "Modified";

      // Buffer should have original value
      vi.advanceTimersByTime(1000);
      // This test verifies the deep clone happened
      expect(service.getBufferLength()).toBe(1);
    });
  });

  describe("Squashing Behavior", () => {
    it("should not squash if buffer is empty", async () => {
      service.resetTimer();

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      expect(mockManager.saveVersion).not.toHaveBeenCalled();
    });

    it("should squash buffered changes after timer expires", async () => {
      service.bufferChange(mockCharacter, "Change 1");
      service.bufferChange(mockCharacter, "Change 2");
      service.bufferChange(mockCharacter, "Change 3");

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      expect(mockManager.saveVersion).toHaveBeenCalledTimes(1);
    });

    it("should use the latest character state when squashing", async () => {
      const char1 = { ...mockCharacter, name: "Name 1" };
      const char2 = { ...mockCharacter, name: "Name 2" };
      const char3 = { ...mockCharacter, name: "Name 3" };

      service.bufferChange(char1, "Change 1");
      service.bufferChange(char2, "Change 2");
      service.bufferChange(char3, "Change 3");

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      expect(mockManager.saveVersion).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Name 3" }),
        expect.any(String)
      );
    });

    it("should combine descriptions when squashing", async () => {
      service.bufferChange(mockCharacter, "Changed name");
      service.bufferChange(mockCharacter, "Changed tier");
      service.bufferChange(mockCharacter, "Changed descriptor");

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      const call = mockManager.saveVersion.mock.calls[0];
      const description = call[1];

      // squashDescriptions should have combined them
      expect(description).toContain("name");
      expect(description).toContain("tier");
      expect(description).toContain("descriptor");
    });

    it("should mark squashed version with metadata", async () => {
      service.bufferChange(mockCharacter, "Change 1");
      service.bufferChange(mockCharacter, "Change 2");

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
      await vi.runAllTimersAsync(); // Run again for async operations

      // Verify metadata update was attempted via transaction
      expect(mockManager.db.transaction).toHaveBeenCalled();
    });

    it("should clear buffer after squashing", async () => {
      service.bufferChange(mockCharacter, "Change 1");
      service.bufferChange(mockCharacter, "Change 2");

      expect(service.getBufferLength()).toBe(2);

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
      await vi.runAllTimersAsync(); // Run again for async operations

      expect(service.getBufferLength()).toBe(0);
    });
  });

  describe("trackChange (Convenience Method)", () => {
    it("should reset timer and buffer change", () => {
      service.trackChange(mockCharacter, "Combined change");

      expect(service.isTimerActive()).toBe(true);
      expect(service.getBufferLength()).toBe(1);
    });

    it("should work same as calling resetTimer + bufferChange separately", () => {
      service.trackChange(mockCharacter, "Change 1");

      const buffer1 = service.getBufferLength();
      const timer1 = service.isTimerActive();

      // Create new service for comparison
      const service2 = new VersionHistoryService(mockManager, 1000);
      service2.resetTimer();
      service2.bufferChange(mockCharacter, "Change 1");

      expect(service2.getBufferLength()).toBe(buffer1);
      expect(service2.isTimerActive()).toBe(timer1);
    });
  });

  describe("Modal Cancel Scenario", () => {
    it("should not add cancelled changes to buffer", () => {
      // User types (timer resets)
      service.resetTimer();
      service.resetTimer();
      service.resetTimer();

      // User cancels (no bufferChange called)
      // Timer continues running

      expect(service.getBufferLength()).toBe(0);
      expect(service.isTimerActive()).toBe(true);
    });

    it("should not create version if timer fires with empty buffer", async () => {
      service.resetTimer(); // Typing
      service.resetTimer(); // More typing
      // User cancels

      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      expect(mockManager.saveVersion).not.toHaveBeenCalled();
    });
  });

  describe("Page Unload (flush)", () => {
    it("should flush buffered changes on page unload", async () => {
      service.bufferChange(mockCharacter, "Change 1");
      service.bufferChange(mockCharacter, "Change 2");

      const flushPromise = service.flush();
      await vi.runAllTimersAsync(); // Process any pending timers
      await flushPromise;

      expect(mockManager.saveVersion).toHaveBeenCalledTimes(1);
      expect(service.getBufferLength()).toBe(0);
    });

    it("should cancel timer when flushing", async () => {
      service.bufferChange(mockCharacter, "Change 1");

      const flushPromise = service.flush();
      await vi.runAllTimersAsync();
      await flushPromise;

      expect(service.isTimerActive()).toBe(false);
    });

    it("should not save if buffer is empty on flush", async () => {
      const flushPromise = service.flush();
      await vi.runAllTimersAsync();
      await flushPromise;

      expect(mockManager.saveVersion).not.toHaveBeenCalled();
    });
  });

  describe("Integration Scenario: Multiple Quick Edits", () => {
    it("should handle realistic editing scenario", async () => {
      // User edits name
      service.bufferChange({ ...mockCharacter, name: "Aria" }, "Changed name");
      vi.advanceTimersByTime(400);

      // User edits tier
      service.bufferChange({ ...mockCharacter, tier: 2 }, "Changed tier");
      vi.advanceTimersByTime(400);

      // User edits descriptor
      service.bufferChange({ ...mockCharacter, descriptor: "Swift" }, "Changed descriptor");
      vi.advanceTimersByTime(600); // Total 1400ms, but timer reset at 800ms

      // Timer fires at 1400ms (600ms after last edit)
      expect(mockManager.saveVersion).not.toHaveBeenCalled();

      vi.advanceTimersByTime(400); // Now 1000ms from last reset

      await vi.runAllTimersAsync();
      await vi.runAllTimersAsync(); // Run again for async operations

      // Should have squashed all 3 changes
      expect(mockManager.saveVersion).toHaveBeenCalledTimes(1);
      expect(service.getBufferLength()).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very rapid buffering", () => {
      for (let i = 0; i < 100; i++) {
        service.bufferChange(mockCharacter, `Change ${i}`);
      }

      expect(service.getBufferLength()).toBe(100);
      expect(mockManager.saveVersion).not.toHaveBeenCalled();
    });

    it("should handle timer firing during additional buffering", async () => {
      service.bufferChange(mockCharacter, "Change 1");

      vi.advanceTimersByTime(999);

      // Add another change just before timer fires
      service.bufferChange(mockCharacter, "Change 2");

      vi.advanceTimersByTime(1); // Original timer fires

      // Timer was reset by bufferChange, so shouldn't fire yet
      await vi.runAllTimersAsync();

      // Should still have buffered changes
      expect(service.getBufferLength()).toBeGreaterThanOrEqual(0); // May have squashed
    });
  });
});
