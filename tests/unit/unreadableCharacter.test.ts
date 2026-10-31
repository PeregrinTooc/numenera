import { describe, it, expect, vi } from "vitest";
import {
  isUnreadableCharacter,
  keepUnreadableCharacter,
  offerUnreadableBackup,
  serializeUnreadable,
  unreadableFilename,
  type OfferUnreadableDeps,
  type UnreadableChoiceHandlers,
} from "@/app/unreadableCharacter";
import { FULL_CHARACTER } from "@/data/mockCharacters";

describe("isUnreadableCharacter", () => {
  it("treats nothing stored as readable", () => {
    expect(isUnreadableCharacter(null)).toBe(false);
  });

  it("treats a complete character as readable", () => {
    expect(isUnreadableCharacter(FULL_CHARACTER)).toBe(false);
  });

  it("treats an incomplete object as readable because the sanitizer repairs it", () => {
    expect(isUnreadableCharacter({ name: "Only a name" })).toBe(false);
  });

  it.each([["{broken json"], [42], [["a"]]])("treats %j as unreadable", (raw) => {
    expect(isUnreadableCharacter(raw)).toBe(true);
  });
});

describe("serializeUnreadable and unreadableFilename", () => {
  it("keeps text exactly as stored", () => {
    expect(serializeUnreadable("{broken")).toBe("{broken");
  });

  it("serializes objects as indented JSON", () => {
    expect(serializeUnreadable({ a: 1 })).toBe('{\n  "a": 1\n}');
  });

  it("names the file after the date", () => {
    expect(unreadableFilename(new Date("2026-03-04T10:00:00Z"))).toBe(
      "numenera-unreadable-character-2026-03-04.json"
    );
  });
});

describe("keepUnreadableCharacter", () => {
  function makeDeps() {
    const calls: string[] = [];
    return {
      calls,
      deps: {
        saveBackup: vi.fn(async () => void calls.push("backup")),
        persistDefault: vi.fn(async () => void calls.push("default")),
        warn: vi.fn(),
      },
    };
  }

  it("backs up the raw value before replacing it with the default, and warns", async () => {
    const { calls, deps } = makeDeps();

    const kept = await keepUnreadableCharacter("{raw", deps);

    expect(kept).toBe(true);
    expect(deps.saveBackup).toHaveBeenCalledWith("{raw");
    expect(calls).toEqual(["backup", "default"]);
    expect(deps.warn).toHaveBeenCalledWith(expect.any(String), "{raw");
  });

  it("leaves the stored value alone when the backup cannot be written", async () => {
    const { deps } = makeDeps();
    deps.saveBackup.mockRejectedValue(new Error("full"));

    const kept = await keepUnreadableCharacter("{raw", deps);

    expect(kept).toBe(false);
    expect(deps.persistDefault).not.toHaveBeenCalled();
  });
});

describe("offerUnreadableBackup", () => {
  function setup(backup: unknown) {
    let handlers: UnreadableChoiceHandlers | undefined;
    const deps: OfferUnreadableDeps = {
      loadBackup: async () => backup,
      deleteBackup: vi.fn(async () => {}),
      download: vi.fn(),
      showChoice: vi.fn((h) => {
        handlers = h;
      }),
      now: () => new Date("2026-03-04T10:00:00Z"),
    };
    return { deps, choose: () => handlers! };
  }

  it("shows nothing when there is no backup", async () => {
    const { deps } = setup(null);

    await offerUnreadableBackup(deps);

    expect(deps.showChoice).not.toHaveBeenCalled();
  });

  it("downloads the raw data and then removes the backup", async () => {
    const { deps, choose } = setup("{raw");
    await offerUnreadableBackup(deps);

    choose().onDownload();

    expect(deps.download).toHaveBeenCalledWith(
      "numenera-unreadable-character-2026-03-04.json",
      "{raw"
    );
    expect(deps.deleteBackup).toHaveBeenCalledOnce();
  });

  it("removes the backup without downloading when discarded", async () => {
    const { deps, choose } = setup("{raw");
    await offerUnreadableBackup(deps);

    choose().onDiscard();

    expect(deps.download).not.toHaveBeenCalled();
    expect(deps.deleteBackup).toHaveBeenCalledOnce();
  });

  it("keeps the backup when the user asks later", async () => {
    const { deps, choose } = setup("{raw");
    await offerUnreadableBackup(deps);

    choose().onLater();

    expect(deps.download).not.toHaveBeenCalled();
    expect(deps.deleteBackup).not.toHaveBeenCalled();
  });
});
