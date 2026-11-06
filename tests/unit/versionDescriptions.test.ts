import { describe, it, expect } from "vitest";
import { describeCharacterChange } from "@/services/versionDescriptions";
import { createTestCharacter as createBaseCharacter } from "../factories/character.js";

describe("describeCharacterChange", () => {
  it("describes a single detected change by its key", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();
    after.name = "New Name";

    expect(describeCharacterChange(before, after)).toBe("versionHistory.changes.basicInfo.name");
  });

  it("joins multiple detected changes with a comma", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();
    after.tier = 2;
    after.cyphers = [{ name: "Test", level: "1", effect: "" }];

    expect(describeCharacterChange(before, after)).toBe(
      "versionHistory.changes.basicInfo.tier, versionHistory.changes.collections.cypher.added"
    );
  });

  it("describes several basic info changes by the combined key", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();
    after.name = "New Name";
    after.tier = 2;
    after.type = "Jack";

    expect(describeCharacterChange(before, after)).toBe(
      "versionHistory.changes.basicInfo.combined"
    );
  });

  it("falls back to the generic key when nothing is detected", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();

    expect(describeCharacterChange(before, after)).toBe("versionHistory.changes.generic");
  });

  it("ignores portrait-only changes and still falls back to generic", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();
    after.portrait = "data:image/png;base64,different";

    expect(describeCharacterChange(before, after)).toBe("versionHistory.changes.generic");
  });
});
