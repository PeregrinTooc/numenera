import { describe, it, expect } from "vitest";
import { parseShard, scenariosInShard } from "../e2e/support/shard";

describe("parseShard", () => {
  it("reads an index and a total", () => {
    expect(parseShard("2/4")).toEqual({ index: 2, total: 4 });
  });

  it("is null when no shard is asked for", () => {
    expect(parseShard(undefined)).toBeNull();
  });

  it.each(["0/4", "5/4", "2", "a/b", "2/0"])("rejects %s", (value) => {
    expect(() => parseShard(value)).toThrow(`E2E_SHARD`);
  });
});

describe("scenariosInShard", () => {
  const scenarios = ["a", "b", "c", "d", "e", "f", "g"];

  it("puts every scenario in exactly one of the shards", () => {
    const shards = [1, 2, 3].map((index) => scenariosInShard(scenarios, { index, total: 3 }));

    expect(shards.flat().sort()).toEqual(scenarios);
  });

  it("deals scenarios out in turn, so neighbouring scenarios of one file spread over the shards", () => {
    expect(scenariosInShard(scenarios, { index: 2, total: 3 })).toEqual(["b", "e"]);
  });
});
