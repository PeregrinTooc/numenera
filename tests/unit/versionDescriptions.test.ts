import { describe, it, expect } from "vitest";
import { describeCharacterChange } from "../../src/services/versionDescriptions.js";
import { createTestCharacter as createBaseCharacter } from "../factories/character.js";

describe("describeCharacterChange", () => {
  it("translates a single detected change into its English text", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();
    after.name = "New Name";

    expect(describeCharacterChange(before, after)).toBe("Changed name");
  });

  it("translates and joins multiple detected changes with a comma", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();
    after.tier = 2;
    after.cyphers = [{ name: "Test", level: "1", effect: "" }];

    expect(describeCharacterChange(before, after)).toBe("Changed tier, Added cypher");
  });

  it("translates a combined-category key (e.g. multiple basic info changes)", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();
    after.name = "New Name";
    after.tier = 2;
    after.type = "Jack";

    expect(describeCharacterChange(before, after)).toBe("Edited basic info");
  });

  it("falls back to the translated generic description when nothing is detected", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();

    expect(describeCharacterChange(before, after)).toBe("Updated character");
  });

  it("ignores portrait-only changes and still falls back to generic", () => {
    const before = createBaseCharacter();
    const after = createBaseCharacter();
    after.portrait = "data:image/png;base64,different";

    expect(describeCharacterChange(before, after)).toBe("Updated character");
  });
});
