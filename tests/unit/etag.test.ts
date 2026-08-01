import { describe, it, expect } from "vitest";
import { generateETag } from "../../src/utils/etag";

describe("generateETag", () => {
  const baseCharacter = {
    name: "Kael the Wanderer",
    stats: {
      might: { pool: 15, edge: 2, current: 12 },
      speed: { pool: 12, edge: 1, current: 12 },
    },
    cyphers: [{ name: "Detonation", level: "1d6+2", effect: "Explodes in an immediate radius" }],
    portrait: "data:image/png;base64,AAAA",
  };

  it("changes when a nested stat changes", async () => {
    const changed = {
      ...baseCharacter,
      stats: { ...baseCharacter.stats, might: { ...baseCharacter.stats.might, pool: 20 } },
    };

    const [etag1, etag2] = await Promise.all([generateETag(baseCharacter), generateETag(changed)]);

    expect(etag1).not.toBe(etag2);
  });

  it("changes when a nested cypher effect changes", async () => {
    const changed = {
      ...baseCharacter,
      cyphers: [{ ...baseCharacter.cyphers[0], effect: "A completely different effect" }],
    };

    const [etag1, etag2] = await Promise.all([generateETag(baseCharacter), generateETag(changed)]);

    expect(etag1).not.toBe(etag2);
  });

  it("does not change when object keys are reordered", async () => {
    const reordered = {
      cyphers: baseCharacter.cyphers,
      stats: baseCharacter.stats,
      name: baseCharacter.name,
      portrait: baseCharacter.portrait,
    };

    const [etag1, etag2] = await Promise.all([
      generateETag(baseCharacter),
      generateETag(reordered),
    ]);

    expect(etag1).toBe(etag2);
  });

  it("ignores the portrait field", async () => {
    const differentPortrait = { ...baseCharacter, portrait: "data:image/png;base64,BBBB" };

    const [etag1, etag2] = await Promise.all([
      generateETag(baseCharacter),
      generateETag(differentPortrait),
    ]);

    expect(etag1).toBe(etag2);
  });
});
