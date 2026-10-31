import { describe, it, expect, vi } from "vitest";
import { setupVersionHistoryService } from "./helpers/versionHistoryServiceFixture";

describe("VersionHistoryService - Buffer-Based Undo/Redo", () => {
  const fx = setupVersionHistoryService();

  describe("Buffer-Based Undo/Redo", () => {
    describe("canUndo()", () => {
      it("should return false when no changes are buffered", () => {
        expect(fx.service.canUndo()).toBe(false);
      });

      it("should return true when changes are buffered", () => {
        fx.service.bufferChange(fx.mockCharacter, "Change 1");
        expect(fx.service.canUndo()).toBe(true);
      });

      it("should return false after buffer is cleared by squash", async () => {
        fx.service.bufferChange(fx.mockCharacter, "Change 1");
        expect(fx.service.canUndo()).toBe(true);

        vi.advanceTimersByTime(1000);
        await vi.runAllTimersAsync();
        await vi.runAllTimersAsync();

        expect(fx.service.canUndo()).toBe(false);
      });
    });

    describe("undo()", () => {
      it("should return the previous character state", () => {
        const char1 = { ...fx.mockCharacter, name: "State 1" };
        const char2 = { ...fx.mockCharacter, name: "State 2" };

        fx.service.bufferChange(char1, "Change 1");
        fx.service.bufferChange(char2, "Change 2");

        const undoneState = fx.service.undo();
        expect(undoneState?.name).toBe("State 1");
      });

      it("should return null when nothing to undo", () => {
        const undoneState = fx.service.undo();
        expect(undoneState).toBeNull();
      });

      it("should reduce buffer length after undo", () => {
        fx.service.bufferChange(fx.mockCharacter, "Change 1");
        fx.service.bufferChange(fx.mockCharacter, "Change 2");

        expect(fx.service.getBufferLength()).toBe(2);
        fx.service.undo();
        expect(fx.service.getBufferLength()).toBe(1);
      });

      it("should allow multiple undos", () => {
        const char1 = { ...fx.mockCharacter, name: "State 1" };
        const char2 = { ...fx.mockCharacter, name: "State 2" };
        const char3 = { ...fx.mockCharacter, name: "State 3" };

        fx.service.bufferChange(char1, "Change 1");
        fx.service.bufferChange(char2, "Change 2");
        fx.service.bufferChange(char3, "Change 3");

        const undo1 = fx.service.undo();
        expect(undo1?.name).toBe("State 2");

        const undo2 = fx.service.undo();
        expect(undo2?.name).toBe("State 1");

        expect(fx.service.canUndo()).toBe(true); // Still have State 1
      });

      it("should return initial state when undoing the first buffered change", () => {
        const initialState = { ...fx.mockCharacter, name: "Initial" };
        const char1 = { ...fx.mockCharacter, name: "Change 1" };

        // Set initial state before buffering
        fx.service.setInitialState(initialState);
        fx.service.bufferChange(char1, "Change 1");

        const undoneState = fx.service.undo();
        expect(undoneState?.name).toBe("Initial");
      });

      it("should return null when undoing past initial state", () => {
        const initialState = { ...fx.mockCharacter, name: "Initial" };
        const char1 = { ...fx.mockCharacter, name: "Change 1" };

        fx.service.setInitialState(initialState);
        fx.service.bufferChange(char1, "Change 1");

        fx.service.undo(); // Back to initial
        const secondUndo = fx.service.undo(); // Try to undo past initial
        expect(secondUndo).toBeNull();
      });
    });

    describe("setInitialState()", () => {
      it("should store the initial character state", () => {
        const initialState = { ...fx.mockCharacter, name: "Initial" };
        fx.service.setInitialState(initialState);

        expect(fx.service.canUndo()).toBe(false); // No changes yet
      });

      it("should allow undo to return to initial state", () => {
        const initialState = { ...fx.mockCharacter, name: "Initial" };
        const change1 = { ...fx.mockCharacter, name: "Modified" };

        fx.service.setInitialState(initialState);
        fx.service.bufferChange(change1, "Change 1");

        const undone = fx.service.undo();
        expect(undone?.name).toBe("Initial");
      });

      it("should clear initial state after squash", async () => {
        const initialState = { ...fx.mockCharacter, name: "Initial" };
        fx.service.setInitialState(initialState);
        fx.service.bufferChange(fx.mockCharacter, "Change 1");

        vi.advanceTimersByTime(1000);
        await vi.runAllTimersAsync();
        await vi.runAllTimersAsync();

        // After squash, initial state should be cleared
        // Attempting to undo should return null
        const undone = fx.service.undo();
        expect(undone).toBeNull();
      });
    });

    describe("canRedo()", () => {
      it("should return false when no redo is available", () => {
        expect(fx.service.canRedo()).toBe(false);
      });

      it("should return true after an undo", () => {
        fx.service.bufferChange(fx.mockCharacter, "Change 1");
        fx.service.undo();

        expect(fx.service.canRedo()).toBe(true);
      });

      it("should return false after new change clears redo stack", () => {
        const char1 = { ...fx.mockCharacter, name: "State 1" };
        const char2 = { ...fx.mockCharacter, name: "State 2" };

        fx.service.bufferChange(char1, "Change 1");
        fx.service.undo();
        expect(fx.service.canRedo()).toBe(true);

        // New change should clear redo stack
        fx.service.bufferChange(char2, "Change 2");
        expect(fx.service.canRedo()).toBe(false);
      });
    });

    describe("redo()", () => {
      it("should return null when nothing to redo", () => {
        const redoneState = fx.service.redo();
        expect(redoneState).toBeNull();
      });

      it("should restore the undone change", () => {
        const char1 = { ...fx.mockCharacter, name: "State 1" };
        const char2 = { ...fx.mockCharacter, name: "State 2" };

        fx.service.bufferChange(char1, "Change 1");
        fx.service.bufferChange(char2, "Change 2");

        fx.service.undo(); // Back to State 1
        const redone = fx.service.redo(); // Forward to State 2

        expect(redone?.name).toBe("State 2");
      });

      it("should increase buffer length after redo", () => {
        fx.service.bufferChange(fx.mockCharacter, "Change 1");
        fx.service.bufferChange(fx.mockCharacter, "Change 2");

        fx.service.undo();
        expect(fx.service.getBufferLength()).toBe(1);

        fx.service.redo();
        expect(fx.service.getBufferLength()).toBe(2);
      });

      it("should allow multiple redos", () => {
        const char1 = { ...fx.mockCharacter, name: "State 1" };
        const char2 = { ...fx.mockCharacter, name: "State 2" };
        const char3 = { ...fx.mockCharacter, name: "State 3" };

        fx.service.bufferChange(char1, "Change 1");
        fx.service.bufferChange(char2, "Change 2");
        fx.service.bufferChange(char3, "Change 3");

        fx.service.undo(); // Back to State 2
        fx.service.undo(); // Back to State 1

        const redo1 = fx.service.redo(); // Forward to State 2
        expect(redo1?.name).toBe("State 2");

        const redo2 = fx.service.redo(); // Forward to State 3
        expect(redo2?.name).toBe("State 3");
      });
    });
  });
});
