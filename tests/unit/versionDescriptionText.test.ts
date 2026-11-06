import { describe, it, expect, afterEach } from "vitest";
import { changeLanguage } from "@/i18n/index";
import { restoredDescription, versionDescriptionText } from "@/services/versionDescriptionText";

describe("versionDescriptionText", () => {
  afterEach(async () => {
    await changeLanguage("en");
  });

  it("translates a stored key", () => {
    expect(versionDescriptionText("versionHistory.changes.basicInfo.name")).toBe("Changed name");
  });

  it("translates each comma-separated key into the current language", async () => {
    await changeLanguage("de");

    expect(
      versionDescriptionText(
        "versionHistory.changes.basicInfo.tier, versionHistory.changes.collections.cypher.added"
      )
    ).toBe("Stufe geändert, Cypher hinzugefügt");
  });

  it("shows text that is not a key as stored", () => {
    expect(versionDescriptionText("Edit 4, versionHistory.changes.basicInfo.name")).toBe(
      "Edit 4, Changed name"
    );
  });

  it("describes a restored version by the description of the version it restored", () => {
    const stored = restoredDescription(restoredDescription("versionHistory.changes.initialState"));

    expect(versionDescriptionText(stored)).toBe("Restored: Restored: Initial state");
  });
});
