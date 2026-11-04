import { describe, it, expect } from "vitest";
import {
  columnsFor,
  isCardSection,
  isValidSectionColumns,
  withColumns,
} from "@/types/sectionColumns";

describe("section columns", () => {
  it("a section without a stored choice uses today's columns", () => {
    expect(columnsFor({}, "abilities")).toBe(2);
    expect(columnsFor({}, "attacks")).toBe(1);
  });

  it("a stored choice wins over the default", () => {
    expect(columnsFor({ abilities: 1 }, "abilities")).toBe(1);
  });

  it("storing the default removes the entry", () => {
    expect(withColumns({ attacks: 2 }, "attacks", 1)).toEqual({});
  });

  it("storing a non-default keeps the others", () => {
    expect(withColumns({ attacks: 2 }, "cyphers", 1)).toEqual({ attacks: 2, cyphers: 1 });
  });

  it("only card sections with 1 or 2 are valid", () => {
    expect(isValidSectionColumns({})).toBe(true);
    expect(isValidSectionColumns({ items: 1 })).toBe(true);
    expect(isValidSectionColumns(null)).toBe(false);
    expect(isValidSectionColumns([])).toBe(false);
    expect(isValidSectionColumns({ stats: 2 })).toBe(false);
    expect(isValidSectionColumns({ items: 3 })).toBe(false);
    expect(isValidSectionColumns({ items: "2" })).toBe(false);
  });

  it("card sections are the five collection sections", () => {
    expect(isCardSection("cyphers")).toBe(true);
    expect(isCardSection("notes")).toBe(false);
  });
});
