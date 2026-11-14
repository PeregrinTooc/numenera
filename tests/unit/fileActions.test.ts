import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createFileActions } from "@/app/fileActions";
import { createAppContext, type AppContext } from "@/app/appContext";
import { ManualClock } from "@/services/manualClock";
import { SCHEMA_VERSION } from "@/storage/storageConstants";
import { mockCharacter } from "./helpers/exportManagerFixture";

function pickFileContaining(fileContent: Record<string, unknown>): void {
  const file = { text: vi.fn().mockResolvedValue(JSON.stringify(fileContent)) };
  window.showOpenFilePicker = vi
    .fn()
    .mockResolvedValue([{ getFile: vi.fn().mockResolvedValue(file) }]);
}

describe("file actions: importing a character", () => {
  let clock: ManualClock;
  let ctx: AppContext;
  let alertSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    clock = new ManualClock();
    ctx = { ...createAppContext(), clock };
    ctx.actions.renderCharacterSheet = vi.fn().mockResolvedValue(undefined);
    alertSpy = vi.spyOn(window, "alert").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the import warnings 100 ms after the character is rendered", async () => {
    pickFileContaining({
      version: "1.0",
      schemaVersion: SCHEMA_VERSION + 1,
      character: mockCharacter,
    });

    await createFileActions(ctx, mockCharacter, document.body).handleLoadFromFile();

    expect(ctx.actions.renderCharacterSheet).toHaveBeenCalled();
    clock.advance(99);
    expect(alertSpy).not.toHaveBeenCalled();
    clock.advance(1);
    expect(alertSpy).toHaveBeenCalledOnce();
  });
});
